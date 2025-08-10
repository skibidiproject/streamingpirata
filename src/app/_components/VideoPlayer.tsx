'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DisableContextMenu from './DisableContextMenu'
import Hls from 'hls.js';

import {
    PlayIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    Cog6ToothIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    XMarkIcon,
    PauseIcon,
    ForwardIcon,
    BackwardIcon
} from '@heroicons/react/24/solid';

import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';


import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';

interface VideoPlayerProps {
    streamUrl: string;
    title: string;
    nextEpisode?: any;
}

interface AudioTrack {
    id: number;
    name: string;
    language?: string;
}

interface SubtitleTrack {
    id: number;
    name: string;
    language?: string;
}

interface QualityLevel {
    id: number;
    height: number;
    width: number;
    bitrate: number;
}


const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
);

export default function VideoPlayer({ streamUrl, title, nextEpisode }: VideoPlayerProps) {
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null); // Ref per il pannello impostazioni

    // Player states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);

    // Track states
    const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
    const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [currentAudioTrack, setCurrentAudioTrack] = useState(-1);
    const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState(-1);
    const [currentQuality, setCurrentQuality] = useState(-1);


    //gestures
    const lastTapRef = useRef<number | null>(null);



    //forward backward icons state
    const [skipDirection, setSkipDirection] = React.useState<"forward" | "backward" | null>(null);
    const [skipAnimKey, setSkipAnimKey] = React.useState(0);
    const [showPlayingIcon, setShowPlayingIcon] = React.useState<boolean | null>(null);


    // Settings panel
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'quality' | 'audio' | 'subtitles'>('quality');

    // Sottotitoli personalizzati
    const [customSubtitles, setCustomSubtitles] = useState<string>('');

    // Initial loading message
    const [loadingMessage, setLoadingMessage] = useState('Caricamento contenuto...');

    // Aggiungi un nuovo state per tracciare se la modalità automatica è attiva
    const [isAutoQuality, setIsAutoQuality] = useState(true);

    // Posizione dinamica sottotitoli
    const subtitlePosition = useMemo(() => {
        return showControls ? "bottom-28" : "bottom-18";
    }, [showControls]);

    const progressRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const [isBuffering, setIsBuffering] = useState(false);

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    const volumeSliderRef = useRef<HTMLDivElement>(null);
    const isVolumeSliderDragging = useRef(false);


    const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !volumeSliderRef.current) return;

        const rect = volumeSliderRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVolume = Math.min(Math.max(clickX / rect.width, 0), 1);

        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
        setVolume(newVolume);
        setIsMuted(newVolume === 0 || videoRef.current.muted);
    };

    const handleTap = (event: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        const now = Date.now();
        const rect = containerRef.current.getBoundingClientRect();

        let tapX: number;
        let tapY: number;


        if ("touches" in event && event.touches.length > 0) {
            tapX = event.touches[0].clientX;
            tapY = event.touches[0].clientY;
        } else if ("clientX" in event) {
            tapX = event.clientX;
            tapY = event.clientY;
        } else {
            return; // non gestiamo altro
        }

        const relativeX = tapX - rect.left;
        const relativeY = tapY - rect.top
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;

        // Rileva doppio tap entro 300ms
        if (lastTapRef.current && (now - lastTapRef.current) < 300) {
            // Prendo la posizione X del tap/click


            if (relativeX < halfWidth) {
                skipBackward();
            } else {
                skipForward();
            }


            lastTapRef.current = null; // resetto dopo doppio tap
        } else {

            if (relativeX > halfWidth - 100 && relativeX < halfWidth + 100 && relativeY > halfHeight - 100 && relativeY < halfHeight + 100 && showControls)
                togglePlay()
            else
            {
                lastTapRef.current = now;
                setShowControls(true)
            }   
                
        }
    };



    const updateVolumeFromEvent = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if (!videoRef.current || !volumeSliderRef.current) return;

        let clientX: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        } else if ('clientX' in e) {
            clientX = (e as MouseEvent).clientX;
        } else {
            return;
        }

        const rect = volumeSliderRef.current.getBoundingClientRect();
        let newVolume = (clientX - rect.left) / rect.width;
        newVolume = Math.min(Math.max(newVolume, 0), 1);

        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
        setVolume(newVolume);
        setIsMuted(newVolume === 0 || videoRef.current.muted);
    };

    const handleVolumeDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        isVolumeSliderDragging.current = true;
        updateVolumeFromEvent(e);
        document.addEventListener('mousemove', handleVolumeDragging);
        document.addEventListener('touchmove', handleVolumeDragging);
        document.addEventListener('mouseup', handleVolumeDragEnd);
        document.addEventListener('touchend', handleVolumeDragEnd);
    };

    const handleVolumeDragging = (e: MouseEvent | TouchEvent) => {
        if (!isVolumeSliderDragging.current) return;
        updateVolumeFromEvent(e);
    };

    const handleVolumeDragEnd = () => {
        isVolumeSliderDragging.current = false;
        document.removeEventListener('mousemove', handleVolumeDragging);
        document.removeEventListener('touchmove', handleVolumeDragging);
        document.removeEventListener('mouseup', handleVolumeDragEnd);
        document.removeEventListener('touchend', handleVolumeDragEnd);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration || !progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * duration;

        videoRef.current.currentTime = Math.min(Math.max(newTime, 0), duration);
        setCurrentTime(newTime);
    };

    const updateTimeFromEvent = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if (!videoRef.current || !duration || !progressRef.current) return;

        let clientX: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        } else if ('clientX' in e) {
            clientX = (e as MouseEvent).clientX;
        } else {
            return;
        }

        const rect = progressRef.current.getBoundingClientRect();
        let newTime = ((clientX - rect.left) / rect.width) * duration;
        if (newTime < 0) newTime = 0;
        if (newTime > duration) newTime = duration;

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        isDraggingRef.current = true; // Cambia da isDragging.current a isDraggingRef.current
        updateTimeFromEvent(e);
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('touchmove', handleDragging);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);
    };

    const handleDragging = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return; // Cambia da isDragging.current a isDraggingRef.current
        updateTimeFromEvent(e);
    };

    const handleDragEnd = () => {
        isDraggingRef.current = false; // Cambia da isDragging.current a isDraggingRef.current
        document.removeEventListener('mousemove', handleDragging);
        document.removeEventListener('touchmove', handleDragging);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
    };

    const handleMouseLeave = () => {
        if (isPlaying && !showSettings && !isDraggingRef.current) {
            setShowControls(false);
        }
    };

    // Gestione interazione container
    const handleContainerInteraction = (e: React.MouseEvent | React.TouchEvent) => {

        const target = e.target as HTMLElement;

        if (showSettings || target.closest('.control-element') || target.closest('.settings-panel')) {
            return;
        }

        handleTap(e);

    
    };

    // Configure HLS with proxy support
    const setupHLS = useCallback((url: string) => {
        if (!videoRef.current) return;

        // Destroy previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                startLevel: -1,
                capLevelToPlayerSize: true,
                xhrSetup: (xhr, url) => {
                    xhr.setRequestHeader('Accept', '*/*');
                }
            });

            // Setup HLS events
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setLoadingMessage('Manifest caricato, preparazione video...');

                // Setup quality levels
                const levels: QualityLevel[] = data.levels.map((level, index) => ({
                    id: index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate
                }));
                setQualityLevels(levels);

            });

            // Modifica l'evento LEVEL_SWITCHED per non aggiornare currentQuality se siamo in modalità automatica
            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                // Solo se NON siamo in modalità automatica, aggiorna currentQuality
                if (!isAutoQuality) {
                    setCurrentQuality(data.level);
                }
            });

            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
                const tracks: AudioTrack[] = data.audioTracks.map((track, index) => ({
                    id: index,
                    name: track.name || `Audio ${index + 1}`,
                    language: track.lang
                }));
                setAudioTracks(tracks);
            });

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                setCurrentAudioTrack(data.id);
            });

            hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
                const tracks: SubtitleTrack[] = data.subtitleTracks.map((track, index) => ({
                    id: index,
                    name: track.name || `Sottotitoli ${index + 1}`,
                    language: track.lang
                }));
                setSubtitleTracks(tracks);

                if (hlsRef.current) {
                    hlsRef.current.subtitleTrack = -1;
                }

                if (videoRef.current && tracks.length > 0) {
                    const video = videoRef.current;
                    Array.from(video.textTracks).forEach(track => {
                        track.mode = 'disabled';
                    });
                }
            });

            hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
                setCurrentSubtitleTrack(data.id);

                if (videoRef.current) {
                    const video = videoRef.current;
                    Array.from(video.textTracks).forEach((track, index) => {
                        if (data.id === -1) {
                            track.mode = 'disabled';
                        } else if (index === data.id) {
                            track.mode = 'showing';
                        } else {
                            track.mode = 'disabled';
                        }
                    });
                }
            });

            hls.on(Hls.Events.FRAG_LOADING, () => {
                setLoadingMessage('Caricamento segmenti...');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);

                // Gestione errori in base al tipo di dettaglio
                if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                    // Errore nel caricamento del manifest (spesso 404)
                    setError(`Impossibile caricare il contenuto. Potrebbe non essere disponibile.`);
                    setIsLoading(false);
                    return;
                }

                if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                    setError('Timeout nel caricamento del contenuto');
                    setIsLoading(false);
                    return;
                }

                // Gestione errori fatali
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:

                            setLoadingMessage('Errore di rete, tentativo di ripristino...');
                            setTimeout(() => {
                                if (hlsRef.current) {
                                    hls.startLoad();
                                }
                            }, 2000);

                            break;

                        case Hls.ErrorTypes.MEDIA_ERROR:
                            setLoadingMessage('Errore media, tentativo di ripristino...');
                            setTimeout(() => {
                                if (hlsRef.current) {
                                    hls.recoverMediaError();
                                }
                            }, 1000);
                            break;

                        default:
                            setError('Errore fatale durante la riproduzione');
                            setIsLoading(false);
                            break;
                    }
                } else {
                    // Errori non fatali - gestisci silenziosamente o con retry
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        console.warn('Errore di rete non fatale, continuando...');
                    }
                }
            });


            hls.loadSource(url);
            hls.attachMedia(videoRef.current);
            hlsRef.current = hls;

        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = url;
            setIsLoading(false);

        } else {
            setError('HLS non supportato su questo browser');
            setIsLoading(false);
        }
    }, []);

    // Initialize player
    useEffect(() => {
        if (streamUrl) {
            setupHLS(streamUrl);
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [streamUrl, setupHLS]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);

            // Aggiungi questa condizione per completare il caricamento
            if (video.duration > 0 && video.readyState >= 3) {
                setIsLoading(false);
                setError(null);

                // Autoplay dopo il caricamento completo
                video.play().catch(error => {
                    console.log('Autoplay prevented:', error);
                });
            }

            const nativeTracks: SubtitleTrack[] = [];
            for (let i = 0; i < video.textTracks.length; i++) {
                const track = video.textTracks[i];
                if (track.kind === 'subtitles' || track.kind === 'captions') {
                    nativeTracks.push({
                        id: i,
                        name: track.label || `Sottotitoli ${i + 1}`,
                        language: track.language
                    });

                    track.mode = 'disabled';

                    track.addEventListener('cuechange', () => {
                        if (track.activeCues && track.activeCues.length > 0) {
                            const cue = track.activeCues[0] as any;
                            setCustomSubtitles(cue.text || '');
                        } else {
                            setCustomSubtitles('');
                        }
                    });
                }
            }

            if (nativeTracks.length > 0) {
                setSubtitleTracks(prev => prev.length > 0 ? prev : nativeTracks);
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);

            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const bufferedPercent = (bufferedEnd / video.duration) * 100;
                setBuffered(bufferedPercent);
            }
        };



        const handlePlay = () => setIsPlaying(true);


        const handlePause = () => setIsPlaying(false);


        const handleEnded = () => setIsPlaying(false);
        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        }
        const handleCanPlay = () => { };
        const handleCanPlayThrough = () => {
            if (video.duration > 0) {
                setIsLoading(false);
                setError(null);
            }
        };

        video.addEventListener('canplaythrough', handleCanPlayThrough);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('canplay', handleCanPlay);
        // Aggiungi questi listener
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        // Modifica il listener canplay esistente per includere setIsBuffering(false)


        return () => {
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('volumechange', handleVolumeChange);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('canplaythrough', handleCanPlayThrough);
        };
    }, []);

    // Fullscreen handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Keyboard shortcuts
    // Sostituisci l'useEffect per i keyboard shortcuts con questo:
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current || e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    skipBackward();
                    break;
                case 'ArrowRight':
                    skipForward();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.muted = !videoRef.current.muted;
                    }
                    break;
                case 'Escape':
                    if (showSettings) {
                        e.preventDefault();
                        setShowSettings(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSettings, duration]); // Aggiungi 'duration' alle dipendenze

    // Settings panel toggle handler
    const handleClickSettings = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowSettings(prev => {
            if (prev) {
                return false;
            }
            return true;
        });

    };

    const handleClickNextEpisode = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        router.push(`/player/tv/${nextEpisode.id}/${nextEpisode.season}/${nextEpisode.episode}`);
    };

    // Auto-hide controls e chiusura impostazioni
    // 4. Modifica l'useEffect per auto-hide controls
    useEffect(() => {
        if (showControls && isPlaying && !showSettings) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (!isDraggingRef.current && !isVolumeSliderDragging.current) { // Usa isDraggingRef invece di isDragging
                    setShowControls(false);

                }
            }, 3000);
        }

        // Cleanup timeout when controls are hidden or video is paused
        if (!showControls || !isPlaying || showSettings) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = null;
            }
        }

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showControls, isPlaying, showSettings]);


    const togglePlay = () => {
        if (!videoRef.current) return;


        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setShowPlayingIcon(false)
            
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowPlayingIcon(true)
        }


        setShowControls(true);

    };


    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };



    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
        }
    };

    function formatTime(time: number): string {
        if (isNaN(time)) return '0:00';

        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    }



    const skipBackward = () => {
        if (!videoRef.current) return;

        const newTime = Math.max(videoRef.current.currentTime - 10, 0);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        setSkipDirection("backward");
        setSkipAnimKey(prev => prev + 1);

    };

    const skipForward = () => {
        if (!videoRef.current) return;

        const newTime = Math.min(videoRef.current.currentTime + 10, duration);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        setSkipDirection("forward");
        setSkipAnimKey(prev => prev + 1);


    };

    // Modifica la funzione changeQuality
    const changeQuality = (levelId: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelId;

            // Se levelId è -1, siamo in modalità automatica
            if (levelId === -1) {
                setIsAutoQuality(true);
                setCurrentQuality(-1);
            } else {
                // Modalità manuale
                setIsAutoQuality(false);
                setCurrentQuality(levelId);
            }
        }
    };

    const changeAudioTrack = (trackId: number) => {
        if (hlsRef.current) {
            hlsRef.current.audioTrack = trackId;
            setCurrentAudioTrack(trackId);
        }
    };

    const changeSubtitleTrack = (trackId: number) => {
        if (trackId === -1) {
            setCustomSubtitles('');
        }

        if (hlsRef.current) {
            hlsRef.current.subtitleTrack = trackId;
        }

        if (videoRef.current) {
            const video = videoRef.current;
            Array.from(video.textTracks).forEach((track, index) => {
                if (trackId === -1) {
                    track.mode = 'disabled';
                } else if (index === trackId) {
                    track.mode = 'showing';
                } else {
                    track.mode = 'disabled';
                }
            });
        }
        setCurrentSubtitleTrack(trackId);
    };

    const formatBitrate = (bitrate: number) => {
        return bitrate > 1000000 ? `${(bitrate / 1000000).toFixed(1)} Mbps` : `${Math.round(bitrate / 1000)} kbps`;
    };

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">Errore di riproduzione</h2>
                    <p className="text-gray-400 text-sm md:text-base">{error}</p>
                </div>
            </div>
        );;
    }



    return (
        <div
            ref={containerRef}
            className="cursor-none relative w-full h-[100dvh] bg-black overflow-hidden group touch-manipulation"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={handleMouseLeave} // AGGIUNGI QUESTA RIGA
            onClick={handleContainerInteraction}
        >
            <DisableContextMenu />
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain touch-none pointer-events-none"
                playsInline
                preload="auto"
                muted={volume === 0}
                crossOrigin="anonymous"
                autoPlay
            />

            {/* Sottotitoli con posizione dinamica */}
            {customSubtitles && (
                <div className={`absolute ${subtitlePosition} left-1/2 transform -translate-x-1/2 z-20 pointer-events-none px-2 transition-all duration-300`}>
                    <div className="bg-black/20 backdrop-blur-sm p-2 text-center rounded-md mx-4 sm:mx-1">
                        <span
                            className="text-white text-base lg:text-3xl font-medium leading-tight"
                            dangerouslySetInnerHTML={{ __html: customSubtitles }}
                        />
                    </div>
                </div>
            )}

            {/* CSS per nascondere i sottotitoli nativi */}
            <style jsx>{`
                video::cue {
                    opacity: 0 !important;
                    display: none !important;
                }
            `}</style>

            {/* Enhanced Loading Overlay */}

            {isLoading && (
                <div className="absolute inset-0 bg-[#0a0a0a] bg-opacity-90 flex items-center justify-center z-50 cursor-default">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-white text-lg">{loadingMessage}</p>
                    </div>
                </div>
            )}

            {skipDirection === "forward" && (
                <FastForwardRoundedIcon
                    key={skipAnimKey}
                    className="absolute top-1/2 right-[10vw] -translate-y-1/2 z-50 fadeInOut aspect-square"
                    style={{ fontSize: "3rem" }}
                />
            )}

            {skipDirection === "backward" && (
                <FastForwardRoundedIcon
                    key={skipAnimKey}
                    className="absolute top-1/2 left-[10vw] rotate-180 -translate-y-1/2 z-50 fadeInOut aspect-square"
                    style={{ fontSize: "3rem" }}
                />
            )}


            {showPlayingIcon === true && !isLoading && (

                <PauseIcon className="absolute top-1/2  -translate-y-1/2 z-50 left-1/2 -translate-x-1/2   fadeInOut aspect-square w-[5vw] pointer-events-none" />
            )}


            {showPlayingIcon === false && !isLoading && (

                <PlayIcon className="absolute top-1/2  -translate-y-1/2 z-50 left-1/2 -translate-x-1/2 fadeInOut aspect-square w-[5vw] pointer-events-none" />
            )}

            {/* Buffering Overlay */}

            {isBuffering && !isLoading && isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                    <div className="rounded-full p-4">
                        <LoadingSpinner />
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            <div
                ref={settingsRef}
                className={`fixed bottom-24 lg:bottom-28 right-2 sm:right-4 lg:right-6 
        bg-[#0a0a0a]/95 backdrop-blur-md border border-zinc-800 
        cursor-auto
        rounded-xl shadow-2xl z-40 w-[85%] max-w-sm sm:max-w-md
        transition-all duration-300 ease-in-out
        ${showSettings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        h-[50vh] sm:h-[65vh] lg:h-[40vh]
        flex flex-col`}
            >
                {/* Header with tabs and close button */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-800 flex-shrink-0">
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-zinc-800/60 rounded-lg p-1">
                        <button
                            onClick={() => setSettingsTab('quality')}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${settingsTab === 'quality'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-300 hover:bg-white/10'
                                }`}
                        >
                            Qualità
                        </button>
                        <button
                            onClick={() => setSettingsTab('audio')}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${settingsTab === 'audio'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-300 hover:bg-white/10'
                                }`}
                        >
                            Audio
                        </button>
                        <button
                            onClick={() => setSettingsTab('subtitles')}
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${settingsTab === 'subtitles'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-300 hover:bg-white/10'
                                }`}
                        >
                            Sottotitoli
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => setShowSettings(false)}
                        className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                        aria-label="Chiudi impostazioni"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content area with proper scrolling */}
                <div className="flex-1 overflow-auto">
                    <div className="h-full">
                        <div className="p-4 space-y-2">
                            {settingsTab === 'quality' && (
                                <>
                                    <button
                                        onClick={() => changeQuality(-1)}
                                        className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${isAutoQuality
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-gray-300 hover:bg-white/10 active:bg-white/20'
                                            }`}
                                    >
                                        <span className="font-medium">Automatico</span>

                                    </button>

                                    {qualityLevels.length > 1 ? (
                                        qualityLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                onClick={() => changeQuality(level.id)}
                                                className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all duration-200 ${!isAutoQuality && currentQuality === level.id
                                                    ? 'bg-white text-black shadow-sm'
                                                    : 'text-gray-300 hover:bg-white/10 active:bg-white/20'
                                                    }`}
                                            >
                                                <span className="font-medium">{level.height}p</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs opacity-70">{formatBitrate(level.bitrate)}</span>

                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-4 text-gray-500 text-sm text-center rounded-lg bg-zinc-900/30">
                                            Nessuna qualità aggiuntiva disponibile
                                        </div>
                                    )}
                                </>
                            )}

                            {settingsTab === 'audio' && (
                                <>
                                    {audioTracks.length === 0 ? (
                                        <div className="px-3 py-4 text-gray-500 text-sm text-center rounded-lg bg-zinc-900/30">
                                            Nessuna traccia audio aggiuntiva
                                        </div>
                                    ) : (
                                        audioTracks.map((track) => (
                                            <button
                                                key={track.id}
                                                onClick={() => changeAudioTrack(track.id)}
                                                className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all duration-200 ${currentAudioTrack === track.id
                                                    ? 'bg-white text-black shadow-sm'
                                                    : 'text-gray-300 hover:bg-white/10 active:bg-white/20'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{track.name}</span>
                                                    {track.language && (
                                                        <span className="text-xs opacity-70 mt-0.5">
                                                            {track.language}
                                                        </span>
                                                    )}
                                                </div>

                                            </button>
                                        ))
                                    )}
                                </>
                            )}

                            {settingsTab === 'subtitles' && (
                                <>
                                    {subtitleTracks.length === 0 ? (
                                        <div className="px-3 py-4 text-gray-500 text-sm text-center rounded-lg bg-zinc-900/30">
                                            Nessun sottotitolo disponibile
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => changeSubtitleTrack(-1)}
                                                className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all duration-200 ${currentSubtitleTrack === -1
                                                    ? 'bg-white text-black shadow-sm'
                                                    : 'text-gray-300 hover:bg-white/10 active:bg-white/20'
                                                    }`}
                                            >
                                                <span className="font-medium">Disattivati</span>
                                            </button>

                                            {subtitleTracks.map((track) => (
                                                <button
                                                    key={track.id}
                                                    onClick={() => changeSubtitleTrack(track.id)}
                                                    className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all duration-200 ${currentSubtitleTrack === track.id
                                                        ? 'bg-white text-black shadow-sm'
                                                        : 'text-gray-300 hover:bg-white/10 active:bg-white/20'
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{track.name}</span>
                                                        {track.language && (
                                                            <span className="text-xs opacity-70 mt-0.5">
                                                                {track.language}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Overlay */}
            <div
                className={`cursor-auto absolute inset-0 bg-gradient-to-t from-black/90   via-black/40 to-transparent duration-300 ${showControls ? 'opacity-100 ' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Top Bar con freccia indietro */}
                <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'} flex items-center gap-4 `}>
                    <button
                        onClick={() => window.history.back()}
                        className="text-white hover:text-gray-300 transition-all control-element hover:bg-white/18 rounded-lg p-1 hover:scale-110 duration-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    {/*<img src="/logo.png" alt="logo" className='w-15' />*/}
                    <h1 className="text-white text-lg md:text-xl font-semibold truncate drop-shadow-lg flex-1">
                        {title}
                    </h1>
                </div>



                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>

                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className={`w-full   bg-white/15  rounded-full cursor-pointer relative mb-3 md:mb-4 duration-200 transition-all ${isDraggingRef.current ? "h-2" : "hover:h-2 h-1.5"} `}
                        onClick={handleSeek}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        <div
                            className="h-full bg-white/25 rounded-full absolute"
                            style={{ width: `${buffered}%` }}
                        />
                        <div
                            className="h-full bg-white rounded-full absolute"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        >
                        </div>
                    </div>



                    {/* Control Buttons */}
                    <div className="flex items-center justify-between px-2 pb-1">
                        <div className="flex items-center gap-4">

                            {/* Play/Pause */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                                className="text-white p-1 control-element cursor-pointer hover:bg-white/20 hover:scale-110 rounded-md duration-100 transition-all"
                                aria-label={isPlaying ? "Pausa" : "Riproduci"}
                            >
                                {isPlaying ? (
                                    <PauseIcon className="w-7 h-7" />
                                ) : (
                                    <PlayIcon className="w-7 h-7" />
                                )}
                            </button>

                            {
                                /*
                                    TASTI SKIP

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    skipBackward();
                                }}
                                className="text-white control-element sm:block hidden p-1"
                                aria-label="Indietro 10 secondi"
                            >
                                <Replay10RoundedIcon style={{ fontSize: 28 }} />
                            </button>

 
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    skipForward();
                                }}
                                className="text-white control-element sm:block hidden"
                                aria-label="Avanti 10 secondi"
                            >
                                <Forward10RoundedIcon style={{ fontSize: 28 }} />
                            </button>
                                


                                */
                            }


                            <div className={`items-center gap-2 transition-all duration-200 ${isVolumeSliderDragging.current ? "w-30" : "w-10 hover:w-31"} md:flex hidden`}>
                                {/*Volume control*/}
                                <button


                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (videoRef.current) {
                                            const newMutedState = !videoRef.current.muted;
                                            videoRef.current.muted = newMutedState;
                                            setIsMuted(newMutedState); // Aggiungi questa riga
                                        }
                                    }}
                                    className="text-white p-1 control-element hover:bg-white/20 hover:scale-110 rounded-md duration-100 transition-all cursor-pointer "
                                    aria-label={videoRef.current?.muted ? "Riattiva audio" : "Disattiva audio"}
                                >
                                    {volume === 0 || isMuted ? (
                                        <SpeakerXMarkIcon className="w-6 h-6" />
                                    ) : volume < 0.5 ? (
                                        <SpeakerWaveIcon className="w-6 h-6" />
                                    ) : (
                                        <SpeakerWaveIcon className="w-6 h-6" />
                                    )}
                                </button>

                                {/* Custom Volume Slider */}
                                <div
                                    ref={volumeSliderRef}
                                    className={`w-16 md:w-20 bg-white/15 rounded-full cursor-pointer relative control-element h-1.5 duration-200 transition-all`}
                                    onClick={handleVolumeSeek}
                                    onMouseDown={handleVolumeDragStart}
                                    onTouchStart={handleVolumeDragStart}
                                >
                                    <div
                                        className=" bg-white rounded-full absolute h-full"
                                        style={{ width: `${volume * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Time Display */}
                            <div className="text-white text-sm font-mono min-w-[85px]">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3 md:gap-4">

                            {/* NEXT EP */}
                            {nextEpisode &&
                                <button
                                    onClick={handleClickNextEpisode}
                                    className={`text-white control-element sm:block hidden cursor-pointer  hover:bg-white/18 hover:scale-110 rounded-md duration-100 transition-all`}
                                    aria-label="Impostazioni"
                                >
                                    <SkipNextRoundedIcon style={{ fontSize: 34 }} />
                                </button>
                            }

                            {/* Settings */}
                            <button
                                onClick={handleClickSettings}
                                className={`text-white p-1 control-element cursor-pointer  ${showSettings ? 'text-blue-400' : ''} hover:bg-white/18 hover:scale-110 rounded-md duration-100 transition-all`}
                                aria-label="Impostazioni"
                            >
                                <Cog6ToothIcon className="w-6 h-6" />
                            </button>


                            {/* Fullscreen */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullscreen();
                                }}
                                className="text-white p-1 control-element hover:bg-white/18 hover:scale-110 cursor-pointer  rounded-md duration-100 transition-all"
                                aria-label={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
                            >
                                {isFullscreen ? (
                                    <ArrowsPointingInIcon className="w-6 h-6" />
                                ) : (
                                    <ArrowsPointingOutIcon className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}