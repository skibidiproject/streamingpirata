'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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


const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
);

export default function VideoPlayer({ streamUrl, title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Player states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [volume, setVolume] = useState(1);
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

    // Initial loading message
    const [loadingMessage, setLoadingMessage] = useState('Caricamento contenuto...');

    const [isAutoQuality, setIsAutoQuality] = useState(true);
    const [isAtLiveEdge, setIsAtLiveEdge] = useState(true);

    const subtitlePosition = useMemo(() => {
        return showControls ? "bottom-28" : "bottom-10";
    }, [showControls]);

    const [isBuffering, setIsBuffering] = useState(false);

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    const volumeSliderRef = useRef<HTMLDivElement>(null);
    const isVolumeSliderDragging = useRef(false);

    // Configurazione specifica per streaming live
    const configureLiveStream = (hls: Hls) => {
        hls.config.lowLatencyMode = true;
        hls.config.liveSyncDurationCount = 3;
        hls.config.liveMaxLatencyDurationCount = 6;
        hls.config.backBufferLength = 60;
    };

    const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !volumeSliderRef.current) return;

        const rect = volumeSliderRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVolume = Math.min(Math.max(clickX / rect.width, 0), 1);

        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
        setVolume(newVolume);
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

    const handleMouseLeave = () => {
        if (isPlaying && !showSettings) {
            setShowControls(false);
        }
    };

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

    const setupHLS = useCallback((url: string) => {
        if (!videoRef.current) return;

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

            // Configurazione specifica per live streaming
            configureLiveStream(hls);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setLoadingMessage('Stream live pronto...');
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

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
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
                setLoadingMessage('Connessione allo stream...');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            setLoadingMessage('Errore di rete, riconnessione...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            setLoadingMessage('Errore media, riconnessione...');
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

        const handleTimeUpdate = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const bufferedPercent = (bufferedEnd / video.duration) * 100;
                setBuffered(bufferedPercent);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleVolumeChange = () => setVolume(video.volume);
        const handleCanPlay = () => {
            setIsLoading(false);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('volumechange', handleVolumeChange);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
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

    const handleClickSettings = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowSettings(prev => !prev);
    };

    useEffect(() => {
        if (showControls && isPlaying && !showSettings) {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }

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
            className="cursor-none relative w-full h-[100dvh] bg-black overflow-hidden group touch-manipulation"
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerInteraction}
            onTouchEnd={handleContainerInteraction}
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
            />

            {/* Enhanced Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-default">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-white text-lg">{loadingMessage}</p>
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

            {/* Controls Overlay */}
            <div
                className={`cursor-auto absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
                    <img src="/logo_fcnet.svg" alt="logo" className='w-15' />
                    <h1 className="text-white text-lg md:text-xl font-semibold truncate drop-shadow-lg flex-1">
                        {title}
                    </h1>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between px-2 pb-1">
                        <div className="flex items-center gap-4">

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
                                    <PauseIcon className="w-7 h-7" />
                                ) : (
                                    <PlayIcon className="w-7 h-7" />
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                {/*Volume control*/}
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
                                    className="w-16 md:w-20 h-1.5 bg-zinc-700 rounded-full cursor-pointer relative control-element"
                                    onClick={handleVolumeSeek}
                                    onMouseDown={handleVolumeDragStart}
                                    onTouchStart={handleVolumeDragStart}
                                >
                                    <div
                                        className="h-full bg-blue-500 rounded-full absolute"
                                        style={{ width: `${volume * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* LIVE Indicator */}
                            <div className="flex items-center gap-2">
                                <div className="font-medium px-2 py-1 bg-red-600 rounded-sm flex items-center">
                                    <span>LIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3 md:gap-4">
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