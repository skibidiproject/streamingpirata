'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
    streamUrl: string;
    title: string;
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

const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
);

const VolumeHighIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const VolumeLowIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    </svg>
);

const MuteIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
);

const FullscreenIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
);

const FullscreenExitIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
);

export default function VideoPlayer({ streamUrl, title }: VideoPlayerProps) {
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
        return showControls ? "bottom-28" : "bottom-10";
    }, [showControls]);

    const progressRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const isDraggingRef = useRef(false);

    const [isBuffering, setIsBuffering] = useState(false);

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);



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

        setShowControls(true);

        if (isPlaying) {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    // Configure HLS with proxy support
    const setupHLS = useCallback((url: string) => {
        if (!videoRef.current) return;

        // Destroy previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        setLoadingMessage('Inizializzazione player...');

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

                setIsLoading(false);
                setError(null);

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

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            setLoadingMessage('Errore di rete, tentativo di ripristino...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            setLoadingMessage('Errore media, tentativo di ripristino...');
                            hls.recoverMediaError();
                            break;
                        default:
                            setError('Errore fatale durante la riproduzione');
                            setIsLoading(false);
                            break;
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
        const handleVolumeChange = () => setVolume(video.volume);
        const handleCanPlay = () => {
            setIsLoading(false);
        };

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
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current || e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
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
    }, [showSettings]);

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

    // Auto-hide controls e chiusura impostazioni
    // 4. Modifica l'useEffect per auto-hide controls
    useEffect(() => {
        if (showControls && isPlaying && !showSettings) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (!isDraggingRef.current) { // Usa isDraggingRef invece di isDragging
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
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
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
                    <div className="text-blue-500 text-4xl md:text-6xl mb-4">⚠️</div>
                    <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">Errore di riproduzione</h2>
                    <p className="text-gray-400 text-sm md:text-base">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[100dvh] bg-black overflow-hidden group touch-manipulation"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={handleMouseLeave} // AGGIUNGI QUESTA RIGA
            onClick={handleContainerInteraction}
            onTouchEnd={handleContainerInteraction}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain touch-none pointer-events-none"
                playsInline
                preload="auto"
                muted={volume === 0}
                crossOrigin="anonymous"
            />

            {/* Sottotitoli con posizione dinamica */}
            {customSubtitles && (
                <div className={`absolute ${subtitlePosition} left-1/2 transform -translate-x-1/2 z-20 pointer-events-none px-2 transition-all duration-300`}>
                    <div className="bg-black/20 backdrop-blur-sm p-2 text-center rounded-md mx-4 sm:mx-1">
                        <span
                            className="text-white text-base md:text-lg font-medium leading-tight"
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
                <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30">
                    <div className="text-center">
                        <p className="text-white text-lg md:text-xl mb-2">Caricamento contenuto...</p>
                        <p className="text-blue-300 text-sm md:text-base">{loadingMessage}</p>
                    </div>
                </div>
            )}

            {/* Buffering Overlay */}
            {isBuffering && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                    <div className="bg-black/50 rounded-full p-4">
                        <LoadingSpinner />
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div
                    ref={settingsRef}
                    className={`
                        absolute
                        bottom-28
                        h-70
                        right-2
                        bg-[#0a0a0a] rounded-xl
                        p-4 z-40
                        shadow-2xl border border-stone-800
                        w-[80%] max-w-md
                        sm:w-96 sm:right-4 lg:right-6
                        md:w-80
                        lg:w-80
                        settings-panel
                    `}
                >
                    <div className="flex justify-between items-center mb-4">
                        {/* Tabs a sinistra */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSettingsTab('quality')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all control-element ${settingsTab === 'quality'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Qualità
                            </button>
                            <button
                                onClick={() => setSettingsTab('audio')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all control-element ${settingsTab === 'audio'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Audio
                            </button>
                            <button
                                onClick={() => setSettingsTab('subtitles')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all control-element ${settingsTab === 'subtitles'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                Sottotitoli
                            </button>
                        </div>

                        {/* Bottone X a destra */}
                        <button
                            onClick={() => setShowSettings(false)}
                            className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
                            aria-label="Chiudi impostazioni"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>


                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {settingsTab === 'quality' && (
                            <div className="space-y-2 h-50">
                                <button
                                    onClick={() => changeQuality(-1)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center transition-all control-element ${isAutoQuality ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    Automatico
                                </button>
                                {qualityLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => changeQuality(level.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex justify-between items-center transition-all control-element ${!isAutoQuality && currentQuality === level.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        <span>{level.height}p</span>
                                        <span className="text-xs opacity-80">{formatBitrate(level.bitrate)}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {settingsTab === 'audio' && (
                            <div className="space-y-2 h-50">
                                {audioTracks.length === 0 ? (
                                    <p className="text-gray-400 text-sm px-3 py-2">Nessuna traccia audio aggiuntiva</p>
                                ) : (
                                    audioTracks.map((track) => (
                                        <button
                                            key={track.id}
                                            onClick={() => changeAudioTrack(track.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center transition-all control-element ${currentAudioTrack === track.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            <span>
                                                {track.name} {track.language && <span className="text-xs opacity-70">({track.language})</span>}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {settingsTab === 'subtitles' && (
                            <div className="space-y-2 overflow-auto h-50">
                                <button
                                    onClick={() => changeSubtitleTrack(-1)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center transition-all control-element ${currentSubtitleTrack === -1 ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                >
                                    Disattivati
                                </button>
                                {subtitleTracks.map((track) => (
                                    <button
                                        key={track.id}
                                        onClick={() => changeSubtitleTrack(track.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center transition-all control-element ${currentSubtitleTrack === track.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        <span>
                                            {track.name} {track.language && <span className="text-xs opacity-70">({track.language})</span>}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Top Bar con freccia indietro */}
                <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'} flex items-center gap-4`}>
                    <button
                        onClick={() => window.history.back()}
                        className="text-white hover:text-gray-300 transition-colors control-element"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <img src="/logo.png" alt="logo" className='w-15' />
                    <h1 className="text-white text-lg md:text-xl font-semibold truncate drop-shadow-lg flex-1">
                        {title}
                    </h1>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>

                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className="w-full h-2 md:h-1.5 bg-zinc-700 rounded-full cursor-pointer relative mb-3 md:mb-4"
                        onClick={handleSeek}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        <div
                            className="h-full bg-zinc-500 rounded-full absolute"
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
                        <div className="flex items-center gap-4 md:gap-6">
                            {/* Play/Pause */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                                className="text-white p-1 control-element"
                                aria-label={isPlaying ? "Pausa" : "Riproduci"}
                            >
                                {isPlaying ? (
                                    <PauseIcon className="w-8 h-8 md:w-7 md:h-7" />
                                ) : (
                                    <PlayIcon className="w-8 h-8 md:w-7 md:h-7" />
                                )}
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (videoRef.current) {
                                            videoRef.current.muted = !videoRef.current.muted
                                        }
                                    }}
                                    className="text-white p-1 control-element"
                                    aria-label={videoRef.current?.muted ? "Riattiva audio" : "Disattiva audio"}
                                >
                                    {volume === 0 || videoRef.current?.muted ? (
                                        <MuteIcon className="w-6 h-6" />
                                    ) : volume < 0.5 ? (
                                        <VolumeLowIcon className="w-6 h-6" />
                                    ) : (
                                        <VolumeHighIcon className="w-6 h-6" />
                                    )}
                                </button>

                                <input
                                    type='range'
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-16 md:w-20 accent-blue-500 control-element"
                                    aria-label="Volume"
                                />
                            </div>

                            {/* Time Display */}
                            <div className="text-white text-sm font-mono min-w-[85px]">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* Settings */}
                            <button
                                onClick={handleClickSettings}
                                className={`text-white p-1 control-element ${showSettings ? 'text-blue-400' : ''}`}
                                aria-label="Impostazioni"
                            >
                                <SettingsIcon className="w-6 h-6" />
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullscreen();
                                }}
                                className="text-white p-1 control-element"
                                aria-label={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
                            >
                                {isFullscreen ? (
                                    <FullscreenExitIcon className="w-6 h-6" />
                                ) : (
                                    <FullscreenIcon className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}