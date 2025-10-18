const axios = require('axios');
const { Client } = require('pg');
const crypto = require('crypto');

// === CONFIG ===
const TMDB_API_KEY = "3deee28772f9714a63f73d5c9c6690b9";
const LANG = "it-IT";
const DB_CONFIG = {
  host: "localhost",
  database: "streaming_db",
  user: "postgres",
  password: "developer"
};

// Configurazione
const ENABLE_RATE_LIMITING = true; // Se false, disabilita il rate limiting
const MAX_REQUESTS_PER_SECOND = 50; // Limite TMDB: 50 richieste al secondo
const INCLUDE_SEASON_0 = false; // Se true, include gli episodi speciali (stagione 0)

class TMDBImporter {
  constructor(apiKey = TMDB_API_KEY, lang = LANG, forceAdd = false) {
    this.apiKey = apiKey;
    this.lang = lang;
    this.forceAdd = forceAdd; // Forza l'inserimento anche se non ancora uscito
    this.client = new Client(DB_CONFIG);
    
    // Rate limiting
    this.requestQueue = [];
    this.requestTimestamps = [];
    this.processingQueue = false;
  }

  // Rate limiting per TMDB API
  async rateLimitedRequest(requestFn) {
    if (!ENABLE_RATE_LIMITING) {
      return await requestFn();
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      
      // Rimuovi timestamp più vecchi di 1 secondo
      this.requestTimestamps = this.requestTimestamps.filter(
        timestamp => now - timestamp < 1000
      );

      // Se abbiamo raggiunto il limite, aspetta
      if (this.requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
        const oldestTimestamp = Math.min(...this.requestTimestamps);
        const waitTime = 1000 - (now - oldestTimestamp);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Processa la prossima richiesta
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      this.requestTimestamps.push(now);

      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processingQueue = false;
  }

  async connect() {
    await this.client.connect();
    console.log('Database connected');
  }

  async disconnect() {
    await this.client.end();
    console.log('Database disconnected');
  }

  // Funzione per creare hash dei dati
  createHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Controlla se una data è nel futuro
  isInFuture(dateString) {
    if (!dateString) return false;
    const releaseDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Imposta a mezzanotte per confronto solo data
    return releaseDate > today;
  }

  // Fetch lista ID da vixsrc.to
  async fetchVixsrcIds(type) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://vixsrc.to/api/list/${type}?lang=it`)
      );
      return response.data.map(item => ({ tmdb_id: item.tmdb_id }));
    } catch (error) {
      console.error(`Error fetching ${type} IDs from vixsrc:`, error.message);
      throw error;
    }
  }

  // Fetch e merge generi da TMDB
  async fetchAllGenres() {
    const genres = {};
    
    for (const mediaType of ["movie", "tv"]) {
      try {
        const response = await this.rateLimitedRequest(() => 
          axios.get(`https://api.themoviedb.org/3/genre/${mediaType}/list`, {
            params: {
              api_key: this.apiKey,
              language: this.lang
            }
          })
        );
        
        const genresList = response.data.genres || [];
        for (const genre of genresList) {
          const genreId = genre.id;
          const name = genre.name;
          
          if (genres[genreId]) {
            if (!genres[genreId].includes(name)) {
              genres[genreId].push(name);
            }
          } else {
            genres[genreId] = [name];
          }
        }
      } catch (error) {
        console.error(`Error fetching ${mediaType} genres:`, error.message);
      }
    }
    
    return genres;
  }

  // Inserisci generi nel database
  async insertGenres() {
    const genres = await this.fetchAllGenres();
    
    for (const [genreId, names] of Object.entries(genres)) {
      const genreName = Array.isArray(names) ? names.join(", ") : String(names);
      
      await this.client.query(`
        INSERT INTO genres (id, genre)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET genre = EXCLUDED.genre
      `, [genreId, genreName]);
    }
    
    console.log("Genres table updated.");
  }

  // Fetch release dates specifiche per un film
  async getMovieReleaseDates(tmdbId) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/release_dates`, {
          params: {
            api_key: this.apiKey
          }
        })
      );
      return response.data.results || [];
    } catch (error) {
      console.error(`Error fetching release dates for movie ${tmdbId}:`, error.message);
      return [];
    }
  }

  // Estrai data di uscita italiana per film
  async getItalianReleaseDate(tmdbId, fallbackDate) {
    const releaseDates = await this.getMovieReleaseDates(tmdbId);
    
    // Prima cerca la data italiana
    for (const country of releaseDates) {
      if (country.iso_3166_1 === "IT") {
        for (const entry of country.release_dates) {
          if (entry.release_date) {
            const date = entry.release_date.split('T')[0]; // Estrai solo la data
            console.log(`Found Italian release date for ${tmdbId}: ${date}`);
            return date;
          }
        }
      }
    }
    
    // Fallback sulla data originale se non trovata quella italiana
    console.log(`No Italian release date found for ${tmdbId}, using fallback: ${fallbackDate}`);
    return fallbackDate;
  }

  // Fetch dati da TMDB
  async getTmdbData(mediaType, tmdbId) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}`, {
          params: {
            api_key: this.apiKey,
            language: this.lang,
            append_to_response: "videos,images,release_dates,content_ratings"
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching TMDB data for ${mediaType} ${tmdbId}:`, error.message);
      throw error;
    }
  }

  // Estrai certificazione (prima Italia, poi US come fallback)
  extractCertification(data, mediaType) {
    if (mediaType === "movie") {
      const releaseDates = data.release_dates?.results || [];
      
      // Prima prova con l'Italia (tipo 3)
      for (const country of releaseDates) {
        if (country.iso_3166_1 === "IT") {
          for (const entry of country.release_dates) {
            if (entry.certification) {
              return entry.certification;
            }
          }
        }
      }
      
      // Fallback su US se non trovato in Italia
      for (const country of releaseDates) {
        if (country.iso_3166_1 === "US") {
          for (const entry of country.release_dates) {
            if (entry.certification) {
              return entry.certification;
            }
          }
        }
      }
    } else if (mediaType === "tv") {
      // Per le serie TV usa content_ratings
      const contentRatings = data.content_ratings?.results || [];
      
      // Prima prova con l'Italia
      for (const rating of contentRatings) {
        if (rating.iso_3166_1 === "IT" && rating.rating) {
          return rating.rating;
        }
      }
      
      // Fallback su US
      for (const rating of contentRatings) {  
        if (rating.iso_3166_1 === "US" && rating.rating) {
          return rating.rating;
        }
      }
    }
    
    return null;
  }

  // Estrai trailer YouTube
  extractTrailer(data) {
    const videos = data.videos?.results || [];
    for (const video of videos) {
      if (video.type === "Trailer" && video.site === "YouTube") {
        return `https://www.youtube.com/watch?v=${video.key}`;
      }
    }
    return null;
  }

  // Estrai rating TMDB
  extractRating(data) {
    return data.vote_average || null;
  }

  // Ottieni miglior logo
  async getBestLogo(mediaType, tmdbId) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/images`, {
          params: { api_key: this.apiKey }
        })
      );
      
      const logos = response.data.logos || [];
      if (!logos.length) return null;

      // Prima cerca loghi italiani
      const italianLogos = logos.filter(logo => logo.iso_639_1 === "it");
      if (italianLogos.length) {
        const bestItalian = italianLogos.reduce((best, current) => 
          (current.width * current.height) > (best.width * best.height) ? current : best
        );
        return `https://image.tmdb.org/t/p/original${bestItalian.file_path}`;
      }

      // Poi cerca loghi inglesi
      const englishLogos = logos.filter(logo => logo.iso_639_1 === "en");
      if (englishLogos.length) {
        const bestEnglish = englishLogos.reduce((best, current) => 
          (current.width * current.height) > (best.width * best.height) ? current : best
        );
        return `https://image.tmdb.org/t/p/original${bestEnglish.file_path}`;
      }

      // Altrimenti prendi il migliore disponibile
      const bestLogo = logos.reduce((best, current) => 
        (current.width * current.height) > (best.width * best.height) ? current : best
      );
      return `https://image.tmdb.org/t/p/original${bestLogo.file_path}`;
      
    } catch (error) {
      console.error(`Error fetching logo for ${mediaType} ${tmdbId}:`, error.message);
      return null;
    }
  }

  // Ottieni miglior still per episodio
  async getBestEpisodeStill(tmdbId, seasonNumber, episodeNumber) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}/images`,
          { params: { api_key: this.apiKey } }
        )
      );
      
      const stills = response.data.stills || [];
      if (!stills.length) return null;

      const bestStill = stills.reduce((best, current) => 
        (current.width * current.height) > (best.width * best.height) ? current : best
      );
      return `https://image.tmdb.org/t/p/original${bestStill.file_path}`;
      
    } catch (error) {
      console.error(`Error fetching episode still for S${seasonNumber}E${episodeNumber}:`, error.message);
      return null;
    }
  }

  // Crea oggetto dati normalizzato per l'hash
  createDataForHash(data, mediaType, logoUrl, trailerUrl, certification, rating, releaseDate) {
    const title = mediaType === "movie" ? data.title : data.name;
    const posterUrl = data.poster_path ? `https://image.tmdb.org/t/p/original${data.poster_path}` : null;
    const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;
    const genreIds = (data.genres || []).map(genre => genre.id);

    return {
      title,
      description: data.overview,
      release_date: releaseDate,
      type: mediaType,
      poster_url: posterUrl,
      logo_url: logoUrl,
      backdrop_url: backdropUrl,
      trailer_url: trailerUrl,
      certification,
      rating,
      genres_ids: genreIds
    };
  }

  // Controlla se i dati sono cambiati e se l'autoupdate è abilitato
  async shouldUpdateRecord(tmdbId, newDataHash) {
    try {
      const result = await this.client.query(
        'SELECT data_hash, set_autoupdate FROM media WHERE id = $1',
        [tmdbId]
      );
      
      if (result.rows.length === 0) {
        return { shouldUpdate: true, isNew: true }; // Nuovo record
      }
      
      const { data_hash: existingHash, set_autoupdate: autoUpdate } = result.rows[0];
      
      // Se autoupdate è disabilitato per questo record, non aggiornare
      if (!autoUpdate) {
        return { shouldUpdate: false, isNew: false, reason: 'autoupdate disabled' };
      }
      
      // Se i dati sono uguali, non aggiornare
      if (existingHash === newDataHash) {
        return { shouldUpdate: false, isNew: false, reason: 'unchanged' };
      }
      
      return { shouldUpdate: true, isNew: false }; // Aggiorna
      
    } catch (error) {
      console.error('Error checking record update status:', error.message);
      return { shouldUpdate: true, isNew: true }; // In caso di errore, assume nuovo
    }
  }

  // Inserisci o aggiorna media
  async insertOrUpdateMedia(mediaType, data) {
    const tmdbId = data.id;
    const logoUrl = await this.getBestLogo(mediaType, tmdbId);
    const trailerUrl = this.extractTrailer(data);
    const certification = this.extractCertification(data, mediaType);
    const rating = this.extractRating(data);
    
    // Determina la data di uscita
    let releaseDate;
    if (mediaType === "movie") {
      releaseDate = await this.getItalianReleaseDate(tmdbId, data.release_date);
    } else {
      releaseDate = data.first_air_date; // Per le serie TV usa la data originale
    }
    
    // Controlla se il contenuto è già uscito
    if (!this.forceAdd && (this.isInFuture(releaseDate) || !releaseDate)) {
      console.log(`Skipping ${mediaType} ${tmdbId} - not yet released (${releaseDate})`);
      return null;
    }
    
    // Crea dati normalizzati per l'hash
    const normalizedData = this.createDataForHash(data, mediaType, logoUrl, trailerUrl, certification, rating, releaseDate);
    const dataHash = this.createHash(normalizedData);
    
    // Controlla se dovremmo aggiornare questo record
    const { shouldUpdate, isNew, reason } = await this.shouldUpdateRecord(tmdbId, dataHash);
    
    if (!shouldUpdate) {
      console.log(`Media ${tmdbId} skipped (${reason})`);
      return tmdbId;
    }
    
    const statusMsg = this.forceAdd && this.isInFuture(releaseDate) ? " (FORCED - not yet released)" : "";
    
    if (isNew) {
      console.log(`Inserting new media ${tmdbId}: ${normalizedData.title} (Rating: ${rating || 'N/A'}, Release: ${releaseDate})${statusMsg}`);
    } else {
      console.log(`Updating media ${tmdbId}: ${normalizedData.title} (Rating: ${rating || 'N/A'}, Release: ${releaseDate})${statusMsg}`);
    }
    
    // Inserisci o aggiorna
    await this.client.query(`
      INSERT INTO media (id, title, description, release_date, type, poster_url, logo_url, backdrop_url, trailer_url, certification, rating, genres_ids, data_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id, type) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        release_date = EXCLUDED.release_date,
        type = EXCLUDED.type,
        poster_url = EXCLUDED.poster_url,
        logo_url = EXCLUDED.logo_url,
        backdrop_url = EXCLUDED.backdrop_url,
        trailer_url = EXCLUDED.trailer_url,
        certification = EXCLUDED.certification,
        rating = EXCLUDED.rating,
        genres_ids = EXCLUDED.genres_ids,
        data_hash = EXCLUDED.data_hash
    `, [
      tmdbId,
      normalizedData.title,
      normalizedData.description,
      normalizedData.release_date,
      normalizedData.type,
      normalizedData.poster_url,
      normalizedData.logo_url,
      normalizedData.backdrop_url,
      normalizedData.trailer_url,
      normalizedData.certification,
      normalizedData.rating,
      normalizedData.genres_ids,
      dataHash
    ]);
    
    return tmdbId;
  }

  // Ottieni dati dettagliati episodio da TMDB (senza rating)
  async getEpisodeData(tmdbId, seasonNumber, episodeNumber) {
    try {
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}`, {
          params: { 
            api_key: this.apiKey, 
            language: this.lang 
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching episode data for S${seasonNumber}E${episodeNumber}:`, error.message);
      return null;
    }
  }

  // Gestisci stagioni ed episodi per serie TV
  async handleTvSeasonsAndEpisodes(tmdbId, mediaId) {
    try {
      // Ottieni info serie
      const response = await this.rateLimitedRequest(() => 
        axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
          params: { api_key: this.apiKey, language: this.lang }
        })
      );
      
      const seasons = response.data.seasons || [];
      
      // Filtra le stagioni in base alla configurazione
      const filteredSeasons = INCLUDE_SEASON_0 
        ? seasons 
        : seasons.filter(season => season.season_number > 0);
      
      console.log(`Processing ${filteredSeasons.length} seasons for TV show ${tmdbId}${INCLUDE_SEASON_0 ? ' (including specials)' : ' (excluding season 0)'}`);
      
      for (const season of filteredSeasons) {
        const seasonNumber = season.season_number;
        
        // Ottieni dettagli stagione
        const seasonResponse = await this.rateLimitedRequest(() => 
          axios.get(
            `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}`,
            { params: { api_key: this.apiKey, language: this.lang } }
          )
        );
        
        const seasonData = seasonResponse.data;
        
        // Controlla se la stagione è già uscita
        if (!this.forceAdd && (this.isInFuture(seasonData.air_date) || !seasonData.air_date)) {
          console.log(`Skipping season ${seasonNumber} - not yet released (${seasonData.air_date})`);
          continue;
        }
        
        const statusMsg = this.forceAdd && this.isInFuture(seasonData.air_date) ? " (FORCED - not yet released)" : "";
        
        // CORREZIONE: Conta gli episodi dall'array episodes
        const episodeCount = seasonData.episodes ? seasonData.episodes.length : 0;
        console.log(`Season ${seasonNumber} has ${episodeCount} episodes`);
        
        // Inserisci stagione con il conteggio corretto
        await this.client.query(`
          INSERT INTO tv_seasons (id, media_id, season_number, description, number_of_episodes, release_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            number_of_episodes = EXCLUDED.number_of_episodes,
            release_date = EXCLUDED.release_date
        `, [
          seasonData.id,
          mediaId,
          seasonData.season_number,
          seasonData.overview,
          episodeCount, // <-- CORREZIONE: Usa il conteggio dall'array episodes
          seasonData.air_date
        ]);
        
        console.log(`Season ${seasonNumber} release date: ${seasonData.air_date}${statusMsg}`);
        
        // Inserisci episodi
        const episodes = seasonData.episodes || [];
        for (const episode of episodes) {
          // Controlla se l'episodio è già uscito
          if (!this.forceAdd && (this.isInFuture(episode.air_date) || !episode.air_date)) {
            console.log(`Skipping episode S${seasonNumber}E${episode.episode_number} - not yet aired (${episode.air_date})`);
            continue;
          }
          
          const episodeStatusMsg = this.forceAdd && this.isInFuture(episode.air_date) ? " (FORCED - not yet aired)" : "";
          
          console.log(`Processing episode S${seasonNumber}E${episode.episode_number}: ${episode.name} (Release: ${episode.air_date || 'N/A'})${episodeStatusMsg}`);
          
          const stillUrl = await this.getBestEpisodeStill(tmdbId, seasonNumber, episode.episode_number);
          
          // MODIFICA: Aggiungi episode.air_date alla query di inserimento
          await this.client.query(`
            INSERT INTO tv_episodes (id, season_id, episode_number, title, description, duration, still_url, release_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              duration = EXCLUDED.duration,
              still_url = EXCLUDED.still_url,
              release_date = EXCLUDED.release_date
          `, [
            episode.id,
            seasonData.id,
            episode.episode_number,
            episode.name,
            episode.overview,
            episode.runtime || episode.duration,
            stillUrl,
            episode.air_date // <-- AGGIUNTO: Data di rilascio dell'episodio
          ]);
        }
      }
      
      console.log(`Seasons and episodes processed for TV show ${tmdbId}`);
      
    } catch (error) {
      console.error(`Error processing seasons/episodes for ${tmdbId}:`, error.message);
    }
  }

  // Importa media completo
  async importMediaComplete(mediaType, tmdbId) {
    try {
      // Ottieni dati da TMDB
      const data = await this.getTmdbData(mediaType, tmdbId);
      
      // Inserisci o aggiorna media
      const mediaId = await this.insertOrUpdateMedia(mediaType, data);
      
      // Se il media non è stato inserito (non ancora uscito), salta
      if (!mediaId) {
        return null;
      }
      
      // Se è una serie TV, gestisci stagioni ed episodi
      if (mediaType === "tv") {
        await this.handleTvSeasonsAndEpisodes(tmdbId, mediaId);
      }
      
      return mediaId;
      
    } catch (error) {
      console.error(`Error importing ${mediaType} ${tmdbId}:`, error.message);
      return null;
    }
  }

  // NUOVA FUNZIONE: Importa un singolo contenuto
  async importSingleMedia(mediaType, tmdbId) {
    try {
      console.log(`Starting import for single ${mediaType} with ID: ${tmdbId}${this.forceAdd ? ' (FORCE MODE)' : ''}`);
      
      // Aggiorna generi prima dell'import
      await this.insertGenres();
      
      // Importa il contenuto
      const mediaId = await this.importMediaComplete(mediaType, tmdbId);
      
      if (mediaId) {
        console.log(`Successfully imported ${mediaType} ${tmdbId}`);
        return mediaId;
      } else {
        console.log(`Failed to import ${mediaType} ${tmdbId}`);
        return null;
      }
      
    } catch (error) {
      console.error(`Error in importSingleMedia:`, error.message);
      return null;
    }
  }

  // Importa tutti i media da vixsrc
  async importAllFromVixsrc(type) {
    try {
      console.log(`Fetching ${type} IDs from vixsrc...`);
      const ids = await this.fetchVixsrcIds(type);
      console.log(`Found ${ids.length} ${type} IDs to process`);
      
      // Aggiorna generi prima di iniziare
      await this.insertGenres();
      
      let processed = 0;
      let errors = 0;
      let skipped = 0;
      
      // Processa in batch per evitare rate limiting
      const batchSize = 5;
      for (let i = 0; i < ids.length; i += batchSize) {
        // Controlla se dobbiamo fermarci
        if (isShuttingDown) {
          console.log(`\nStopping import at ${processed}/${ids.length} processed`);
          throw new Error('SHUTDOWN_REQUESTED');
        }
        
        const batch = ids.slice(i, i + batchSize);
        
        const promises = batch.map(async (item) => {
          try {
            // Controlla di nuovo prima di ogni import
            if (isShuttingDown) {
              throw new Error('SHUTDOWN_REQUESTED');
            }
            
            const result = await this.importMediaComplete(type, item.tmdb_id);
            if (result) {
              processed++;
            } else {
              skipped++;
            }
            console.log(`Progress: ${processed}/${ids.length} processed, ${skipped} skipped (${Math.round(processed/ids.length*100)}%)`);
          } catch (error) {
            if (error.message === 'SHUTDOWN_REQUESTED') {
              throw error;
            }
            errors++;
            console.error(`Failed to import ${type} ${item.tmdb_id}:`, error.message);
          }
        });
        
        await Promise.all(promises);
        
        // Piccola pausa tra batch per rispettare rate limits
        if (i + batchSize < ids.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`Import completed. Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
      
    } catch (error) {
      if (error.message === 'SHUTDOWN_REQUESTED') {
        throw error;
      }
      console.error(`Error in importAllFromVixsrc:`, error.message);
    }
  }
}

// Variabile globale per gestire lo shutdown
let isShuttingDown = false;
let currentImporter = null;

// Funzione principale
async function main() {
  const args = process.argv.slice(2);
  
  // Controlla se è stata richiesta l'importazione di un singolo elemento
  if (args.length >= 2 && args[0] === 'single') {
    const [, mediaType, tmdbId, forceFlag] = args;
    
    if (!['movie', 'tv'].includes(mediaType)) {
      console.error('Media type must be "movie" or "tv"');
      process.exit(1);
    }
    
    if (!tmdbId || isNaN(tmdbId)) {
      console.error('Please provide a valid TMDB ID');
      process.exit(1);
    }
    
    const forceAdd = forceFlag === 'force';
    
    if (forceAdd) {
      console.log('FORCE MODE: Will import even if not yet released');
    }
    
    const importer = new TMDBImporter(TMDB_API_KEY, LANG, forceAdd);
    currentImporter = importer;
    
    try {
      await importer.connect();
      await importer.importSingleMedia(mediaType, parseInt(tmdbId));
      console.log(`Single ${mediaType} import completed`);
    } catch (error) {
      console.error("Error importing single media:", error.message);
    } finally {
      await importer.disconnect();
    }
    
    return;
  }
  
  // Importazione completa (comportamento originale)
  const importer = new TMDBImporter();
  currentImporter = importer;
  
  try {
    await importer.connect();
    
    // Importa film
    if (!isShuttingDown) {
      console.log("=== Starting movie import ===");
      await importer.importAllFromVixsrc("movie");
    }
    
    // Importa serie TV
    if (!isShuttingDown) {
      console.log("=== Starting TV import ===");
      await importer.importAllFromVixsrc("tv");
    }
    
    if (!isShuttingDown) {
      console.log("=== All imports completed ===");
    }
    
  } catch (error) {
    if (error.message === 'SHUTDOWN_REQUESTED') {
      console.log("\n=== Import interrupted by user ===");
    } else {
      console.error("Main error:", error);
    }
  } finally {
    await importer.disconnect();
  }
}

// Gestione graceful shutdown
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      if (isShuttingDown) {
        console.log('\nForcing exit...');
        process.exit(1);
      }
      
      console.log(`\n${signal} received. Shutting down gracefully...`);
      console.log('Press Ctrl+C again to force exit');
      
      isShuttingDown = true;
      
      // Disconnetti dal database se l'importer è attivo
      if (currentImporter) {
        try {
          await currentImporter.disconnect();
        } catch (error) {
          console.error('Error disconnecting:', error.message);
        }
      }
      
      process.exit(0);
    });
  });
}

// Esegui se chiamato direttamente
if (require.main === module) {
  setupGracefulShutdown();
  main();
}

module.exports = TMDBImporter;