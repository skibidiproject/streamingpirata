from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import re
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import logging
from urllib.parse import urlparse, urljoin, quote, unquote
from typing import Dict, List, Tuple, Optional

# Configurazione logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class HLSProxy:
    """Classe per gestire il proxy HLS con supporto completo per tracce audio/sottotitoli"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
        self.timeout = 30
        self.max_retries = 3
    
    def _make_request(self, url: str, stream: bool = False, headers: Optional[Dict] = None) -> requests.Response:
        """Effettua una richiesta HTTP con retry automatico"""
        request_headers = {**self.headers}
        if headers:
            request_headers.update(headers)
        
        # Aggiungi Referer e Origin se è una richiesta a vixsrc
        if 'vixsrc.to' in url:
            request_headers.update({
                'Referer': 'https://vixsrc.to/',
                'Origin': 'https://vixsrc.to'
            })
        
        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    url, 
                    headers=request_headers, 
                    timeout=self.timeout, 
                    stream=stream,
                    allow_redirects=True
                )
                
                if response.status_code == 200:
                    return response
                elif response.status_code in [403, 404] and attempt < self.max_retries - 1:
                    logger.warning(f"Tentativo {attempt + 1} fallito per {url}: {response.status_code}")
                    time.sleep(1)
                    continue
                else:
                    return response
                    
            except Exception as e:
                logger.error(f"Errore richiesta tentativo {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(1)
        
        raise Exception(f"Tutti i tentativi falliti per {url}")
    
    def proxy_playlist(self, url: str) -> Tuple[str, int, Dict]:
        """Proxy per playlist M3U8 (master o media)"""
        try:
            response = self._make_request(url)
            
            if response.status_code != 200:
                return f"Errore: {response.status_code}", response.status_code, {}
            
            content = response.text
            
            # Check if it's a VTT subtitle file
            if url.lower().endswith('.vtt') or content.strip().startswith('WEBVTT'):
                return self._handle_vtt_subtitle(content, response.status_code)
            
            if not content.strip().startswith('#EXTM3U'):
                return "Non è un file M3U8 valido", 400, {}
            
            # Determina se è un master playlist o media playlist
            is_master = '#EXT-X-STREAM-INF' in content or '#EXT-X-MEDIA' in content
            
            # Processa il contenuto
            if is_master:
                modified_content = self._process_master_playlist(content, url)
            else:
                modified_content = self._process_media_playlist(content, url)
            
            headers = {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
            
            return modified_content, 200, headers
            
        except Exception as e:
            logger.error(f"Errore proxy playlist: {e}")
            return f"Errore interno: {str(e)}", 500, {}
    
    def _handle_vtt_subtitle(self, content: str, status_code: int) -> Tuple[str, int, Dict]:
        """Handle VTT subtitle files"""
        headers = {
            'Content-Type': 'text/vtt',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
            'Cache-Control': 'public, max-age=3600'
        }
        
        return content, status_code, headers
    
    def proxy_subtitle(self, url: str) -> Tuple[str, int, Dict]:
        """Proxy specifico per sottotitoli VTT"""
        try:
            response = self._make_request(url)
            
            if response.status_code != 200:
                return f"Errore: {response.status_code}", response.status_code, {}
            
            content = response.text
            
            # Handle VTT files directly
            if url.lower().endswith('.vtt') or content.strip().startswith('WEBVTT'):
                return self._handle_vtt_subtitle(content, response.status_code)
            
            # Handle M3U8 subtitle playlists
            if content.strip().startswith('#EXTM3U'):
                modified_content = self._process_media_playlist(content, url)
                
                headers = {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
                
                return modified_content, 200, headers
            
            # Default handling for other subtitle formats
            headers = {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
                'Cache-Control': 'public, max-age=3600'
            }
            
            return content, 200, headers
            
        except Exception as e:
            logger.error(f"Errore proxy subtitle: {e}")
            return f"Errore interno: {str(e)}", 500, {}
    
    def _process_master_playlist(self, content: str, base_url: str) -> str:
        """Processa un master playlist M3U8"""
        lines = content.split('\n')
        modified_lines = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('#EXT-X-STREAM-INF'):
                # Linea di informazioni stream - mantieni così com'è
                modified_lines.append(line)
            elif line.startswith('#EXT-X-MEDIA'):
                # Tracce audio/sottotitoli - modifica URI
                modified_line = self._process_media_tag(line, base_url)
                modified_lines.append(modified_line)
            elif line and not line.startswith('#'):
                # URL di playlist - proxy
                playlist_url = self._resolve_url(line, base_url)
                proxied_url = f"/api/v1/proxy/playlist?url={quote(playlist_url, safe='')}"
                modified_lines.append(proxied_url)
            else:
                modified_lines.append(line)
        
        return '\n'.join(modified_lines)
    
    def _process_media_playlist(self, content: str, base_url: str) -> str:
        """Processa un media playlist M3U8"""
        lines = content.split('\n')
        modified_lines = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('#EXT-X-KEY:'):
                # Chiave di crittografia
                modified_line = self._process_key_tag(line, base_url)
                modified_lines.append(modified_line)
            elif line and not line.startswith('#'):
                # Segmento video
                segment_url = self._resolve_url(line, base_url)
                
                # Check if it's a VTT subtitle segment
                if segment_url.lower().endswith('.vtt'):
                    proxied_url = f"/api/v1/proxy/subtitle?url={quote(segment_url, safe='')}"
                else:
                    proxied_url = f"/api/v1/proxy/segment?url={quote(segment_url, safe='')}"
                
                modified_lines.append(proxied_url)
            else:
                modified_lines.append(line)
        
        return '\n'.join(modified_lines)
    
    def _process_media_tag(self, line: str, base_url: str) -> str:
        """Processa tag #EXT-X-MEDIA per tracce audio/sottotitoli"""
        # Cerca URI nella linea
        uri_match = re.search(r'URI=(["\']?)([^",\s]+)\1', line)
        if uri_match:
            original_uri = uri_match.group(2)
            full_uri = self._resolve_url(original_uri, base_url)
            
            # Determina il tipo di traccia
            if 'TYPE=AUDIO' in line:
                proxied_uri = f"/api/v1/proxy/audio?url={quote(full_uri, safe='')}"
            elif 'TYPE=SUBTITLES' in line:
                proxied_uri = f"/api/v1/proxy/subtitle?url={quote(full_uri, safe='')}"
            else:
                proxied_uri = f"/api/v1/proxy/playlist?url={quote(full_uri, safe='')}"
            
            # Sostituisci URI mantenendo le virgolette originali
            new_attr = f'URI="{proxied_uri}"'
            return line.replace(uri_match.group(0), new_attr)
        
        return line
    
    def _process_key_tag(self, line: str, base_url: str) -> str:
        """Processa tag #EXT-X-KEY per chiavi di crittografia"""
        uri_match = re.search(r'URI=(["\']?)([^",\s]+)\1', line)
        if uri_match:
            original_uri = uri_match.group(2)
            full_uri = self._resolve_url(original_uri, base_url)
            
            # Usa route specifica per chiavi vixsrc
            if 'vixsrc.to' in full_uri and 'enc.key' in full_uri:
                proxied_uri = "/api/v1/vixsrc/key"
            else:
                proxied_uri = f"/api/v1/proxy/key?url={quote(full_uri, safe='')}"
            
            new_attr = f'URI="{proxied_uri}"'
            return line.replace(uri_match.group(0), new_attr)
        
        return line
    
    def _resolve_url(self, url: str, base_url: str) -> str:
        """Risolve URL relativo in assoluto"""
        if url.startswith('http'):
            return url
        elif url.startswith('/'):
            parsed = urlparse(base_url)
            return f"{parsed.scheme}://{parsed.netloc}{url}"
        else:
            return urljoin(base_url, url)
    
    def proxy_segment(self, url: str, request_headers: Dict) -> Tuple[bytes, int, Dict]:
        """Proxy per segmenti video con supporto Range"""
        try:
            headers = {}
            if 'Range' in request_headers:
                headers['Range'] = request_headers['Range']
            
            response = self._make_request(url, stream=True, headers=headers)
            
            response_headers = {
                'Content-Type': response.headers.get('Content-Type', 'video/mp2t'),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600'
            }
            
            if 'Content-Length' in response.headers:
                response_headers['Content-Length'] = response.headers['Content-Length']
            
            if response.status_code == 206 and 'Content-Range' in response.headers:
                response_headers['Content-Range'] = response.headers['Content-Range']
            
            return response.content, response.status_code, response_headers
            
        except Exception as e:
            logger.error(f"Errore proxy segment: {e}")
            return f"Errore: {str(e)}".encode(), 500, {}
    
    def proxy_key(self, url: str) -> Tuple[bytes, int, Dict]:
        """Proxy per chiavi di crittografia"""
        try:
            response = self._make_request(url)
            
            headers = {
                'Content-Type': response.headers.get('Content-Type', 'application/octet-stream'),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'public, max-age=86400'
            }
            
            return response.content, response.status_code, headers
            
        except Exception as e:
            logger.error(f"Errore proxy key: {e}")
            return f"Errore: {str(e)}".encode(), 500, {}

class M3U8Extractor:
    """Classe per estrarre URL M3U8 da pagine web"""
    
    def __init__(self):
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--disable-extensions")
        self.chrome_options.add_argument("--disable-plugins")
        self.chrome_options.add_argument("--disable-images")
        self.chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
    
    def extract_urls(self, player_url: str) -> List[Dict]:
        """Estrae URL M3U8 da una pagina web"""
        logger.info(f"Avvio estrazione da: {player_url}")
        
        driver = None
        try:
            driver = webdriver.Chrome(options=self.chrome_options)
            driver.set_page_load_timeout(30)
            driver.get(player_url)
            
            # Attendi caricamento pagina
            time.sleep(3)
            
            # Avvia riproduzione
            self._trigger_playback(driver)
            
            # Attendi caricamento stream
            time.sleep(5)
            
            # Estrai URL dai log
            urls = self._extract_from_logs(driver)
            
            # Testa e valida URL
            validated_urls = self._validate_urls(urls)
            
            logger.info(f"Trovati {len(validated_urls)} URL validi")
            return validated_urls
            
        except Exception as e:
            logger.error(f"Errore durante estrazione: {e}")
            return []
        finally:
            if driver:
                driver.quit()
    
    def _trigger_playback(self, driver) -> bool:
        """Avvia la riproduzione del video"""
        selectors = [
            "button[class*='play']",
            ".play-button",
            ".vjs-big-play-button",
            "[aria-label*='play']",
            "video",
            ".play-btn",
            "#play-button",
            "[data-testid*='play']",
            ".player-play-button"
        ]
        
        for selector in selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed():
                        driver.execute_script("arguments[0].click();", element)
                        logger.info(f"Cliccato pulsante play: {selector}")
                        time.sleep(1)
                        return True
            except Exception as e:
                logger.debug(f"Errore con selettore {selector}: {e}")
                continue
        
        # Fallback: cerca video tag e avvia riproduzione
        try:
            videos = driver.find_elements(By.TAG_NAME, "video")
            for video in videos:
                driver.execute_script("arguments[0].play();", video)
                logger.info("Avviata riproduzione video tramite script")
                return True
        except Exception as e:
            logger.debug(f"Errore avvio video: {e}")
        
        return False
    
    def _extract_from_logs(self, driver) -> List[str]:
        """Estrae URL M3U8 dai log di rete"""
        urls = set()
        
        try:
            logs = driver.get_log('performance')
            
            for log in logs:
                try:
                    message = json.loads(log['message'])
                    
                    # Controlla richieste di rete
                    if message['message']['method'] == 'Network.requestWillBeSent':
                        url = message['message']['params']['request']['url']
                        if self._is_valid_m3u8_url(url):
                            urls.add(url)
                    
                    # Controlla risposte di rete
                    elif message['message']['method'] == 'Network.responseReceived':
                        url = message['message']['params']['response']['url']
                        if self._is_valid_m3u8_url(url):
                            urls.add(url)
                            
                except (json.JSONDecodeError, KeyError) as e:
                    # Fallback con regex
                    log_text = log.get('message', '')
                    if 'playlist' in log_text or '.m3u8' in log_text:
                        regex_patterns = [
                            r'"url":"([^"]*playlist[^"]*\?[^"]*)"',
                            r'"url":"([^"]*\.m3u8[^"]*\?[^"]*)"',
                            r'https?://[^"\s]+(?:playlist|\.m3u8)[^"\s]*'
                        ]
                        
                        for pattern in regex_patterns:
                            matches = re.findall(pattern, log_text)
                            for match in matches:
                                clean_url = match.replace('\\', '')
                                if self._is_valid_m3u8_url(clean_url):
                                    urls.add(clean_url)
        
        except Exception as e:
            logger.error(f"Errore estrazione log: {e}")
        
        return list(urls)
    
    def _is_valid_m3u8_url(self, url: str) -> bool:
        """Verifica se un URL è potenzialmente un M3U8 valido"""
        if not url or len(url) < 20:
            return False
        
        url_lower = url.lower()
        
        # Deve contenere playlist o .m3u8
        has_m3u8 = ('playlist' in url_lower or '.m3u8' in url_lower)
        
        # Deve avere parametri
        has_params = ('?' in url and '=' in url)
        
        # Deve avere parametri di autenticazione
        auth_params = ['token', 'expires', 'hash', 'sig', 'auth', 'key', 'h=']
        has_auth = any(param in url_lower for param in auth_params)
        
        # Esclusioni
        excludes = ['google', 'facebook', 'analytics', 'ads', 'font', 'css', 'js', 'ico', 'png', 'jpg', 'gif']
        is_excluded = any(exclude in url_lower for exclude in excludes)
        
        return has_m3u8 and has_params and has_auth and not is_excluded
    
    def _validate_urls(self, urls: List[str]) -> List[Dict]:
        """Valida gli URL trovati"""
        validated = []
        
        for url in urls:
            try:
                # Test rapido dell'URL
                response = requests.head(url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                is_valid = response.status_code == 200
                is_master = 'type=' not in url  # Master playlist non ha type=
                
                validated.append({
                    'url': url,
                    'status': 'working' if is_valid else 'error',
                    'is_master': is_master,
                    'status_code': response.status_code,
                    'priority': 1 if is_master else 2  # Master playlist ha priorità più alta
                })
                
            except Exception as e:
                validated.append({
                    'url': url,
                    'status': 'error',
                    'is_master': False,
                    'error': str(e),
                    'priority': 3
                })
        
        # Ordina per priorità
        validated.sort(key=lambda x: x['priority'])
        return validated

# Istanze globali
proxy = HLSProxy()
extractor = M3U8Extractor()

# ================================
# API ROUTES - V1
# ================================

@app.route('/api/v1/extract', methods=['POST'])
def extract_m3u8():
    """Estrae URL M3U8 da una pagina web"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'Campo "url" obbligatorio'
            }), 400
        
        player_url = data['url']
        
        # Validazione URL
        if not player_url.startswith(('http://', 'https://')):
            return jsonify({
                'success': False,
                'error': 'URL non valido'
            }), 400
        
        # Estrazione
        results = extractor.extract_urls(player_url)
        
        if not results:
            return jsonify({
                'success': False,
                'error': 'Nessun stream M3U8 trovato',
                'urls': []
            })
        
        # Trova URL migliore
        best_url = None
        for result in results:
            if result['status'] == 'working':
                best_url = result['url']
                break
        
        return jsonify({
            'success': True,
            'stream_url': best_url,
            'proxy_url': f"/api/v1/proxy/playlist?url={quote(best_url, safe='')}" if best_url else None,
            'all_urls': results,
            'stats': {
                'total_found': len(results),
                'working': len([r for r in results if r['status'] == 'working']),
                'master_playlists': len([r for r in results if r.get('is_master', False)])
            }
        })
        
    except Exception as e:
        logger.error(f"Errore API extract: {e}")
        return jsonify({
            'success': False,
            'error': f'Errore interno: {str(e)}'
        }), 500

@app.route('/api/v1/proxy/playlist')
def proxy_playlist():
    """Proxy per playlist M3U8 (master o media)"""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Parametro url obbligatorio'}), 400
    
    try:
        url = unquote(url)
        content, status_code, headers = proxy.proxy_playlist(url)
        
        if status_code != 200:
            return jsonify({'error': content}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore proxy playlist: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/proxy/segment')
def proxy_segment():
    """Proxy per segmenti video"""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Parametro url obbligatorio'}), 400
    
    try:
        url = unquote(url)
        content, status_code, headers = proxy.proxy_segment(url, request.headers)
        
        if status_code != 200:
            return jsonify({'error': content.decode()}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore proxy segment: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/proxy/key')
def proxy_key():
    """Proxy per chiavi di crittografia"""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Parametro url obbligatorio'}), 400
    
    try:
        url = unquote(url)
        content, status_code, headers = proxy.proxy_key(url)
        
        if status_code != 200:
            return jsonify({'error': content.decode()}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore proxy key: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/proxy/audio')
def proxy_audio():
    """Proxy per tracce audio"""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Parametro url obbligatorio'}), 400
    
    try:
        url = unquote(url)
        content, status_code, headers = proxy.proxy_playlist(url)
        
        if status_code != 200:
            return jsonify({'error': content}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore proxy audio: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/proxy/subtitle')
def proxy_subtitle():
    """Proxy per sottotitoli"""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Parametro url obbligatorio'}), 400
    
    try:
        url = unquote(url)
        content, status_code, headers = proxy.proxy_subtitle(url)
        
        if status_code != 200:
            return jsonify({'error': content}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore proxy subtitle: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/vixsrc/key')
def vixsrc_key():
    """Endpoint diretto per chiave vixsrc"""
    try:
        key_url = "https://vixsrc.to/storage/enc.key"
        content, status_code, headers = proxy.proxy_key(key_url)
        
        if status_code != 200:
            return jsonify({'error': content.decode()}), status_code
        
        return Response(content, status=status_code, headers=headers)
        
    except Exception as e:
        logger.error(f"Errore vixsrc key: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 M3U8 Extractor API - Versione Master Playlist Priority")
    print("📍 Endpoints disponibili (aggiornare):")
    print("   POST /extract - Estrae URL M3U8 (priorità master playlist)")
    print("   GET /proxy/m3u8 - Proxy M3U8 con CORS")
    print("   GET /proxy/manifest - Proxy manifest M3U8")
    print("   GET /proxy/segment - Proxy segmenti video")
    print("   GET /proxy/key - Proxy chiavi crittografia")
    print("   GET /storage/enc.key - Route diretta per chiave vixsrc")
    print("   GET /health - Health check")
    print("\n🎯 Funzionalità:")
    print("   - Priorità automatica ai master playlist (senza type=)")
    print("   - Fallback su URL specifici se necessario")
    print("   - Master playlist contengono tutte le qualità")
    print("   - Supporto diretto per chiavi vixsrc")
    print("   - Route /proxy/manifest aggiunta")
    print("\n💡 Usa proxy_url per evitare errori CORS!")
    
    app.run(host='0.0.0.0', port=5000, debug=True)