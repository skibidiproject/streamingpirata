'use client';

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string | null;
  onPause: () => void;
  onEnded: () => void;
  onPlay?: () => void;
  onError?: (error: any) => void;
  onReady?: () => void;
  className?: string;
}

// Global promise to track API loading
let apiLoadPromise: Promise<void> | null = null;

const loadYouTubeAPI = (): Promise<void> => {
  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  if ((window as any).YT?.Player) {
    return Promise.resolve();
  }

  apiLoadPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    
    if (existingScript) {
      const checkAPI = () => {
        if ((window as any).YT?.Player) {
          resolve();
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    
    const originalCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (originalCallback) originalCallback();
      resolve();
    };
    
    document.body.appendChild(tag);
  });

  return apiLoadPromise;
};

export default function YouTubePlayer({ 
  videoId, 
  onPause, 
  onPlay, 
  onEnded,
  onError,
  onReady,
  className = ""
}: YouTubePlayerProps) {

  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      return;
    }

    let isMounted = true;

    const initPlayer = async () => {
      try {

        setError(null);

        await loadYouTubeAPI();

        if (!isMounted || !playerRef.current) return;

        // Destroy existing player
        if (ytPlayerRef.current) {
          ytPlayerRef.current.destroy();
        }

        ytPlayerRef.current = new (window as any).YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            controls: 0,
            disablekb: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (isMounted) {
          
                onReady?.();
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              
              // YouTube player states
              // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
              if (event.data === 2) {
                onPause();
                console.log("apsjd")
              } else if (event.data === 1) {
                onPlay?.();
              }
              else if(event.data === 0){
                onEnded();
              }
            },
            onError: (event: any) => {
              if (!isMounted) return;
              
              const errorMessages: { [key: number]: string } = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or private',
                101: 'Video cannot be embedded',
                150: 'Video cannot be embedded'
              };
              
              const errorMessage = errorMessages[event.data] || 'Unknown error occurred';
              setError(errorMessage);
        
              onError?.(errorMessage);
            }
          }
        });

      } catch (err) {
        if (isMounted) {
          const errorMessage = 'Failed to load YouTube player';
          setError(errorMessage);
          onError?.(errorMessage);
        }
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // Ignore destruction errors
        }
      }
    };
  }, [videoId, onPause, onPlay, onError, onReady]);

  if (!videoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <p>No video selected</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 text-red-600 p-4 ${className}`}>
        <div className="text-center">
          <p className="font-medium">Error loading video</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div
        ref={playerRef}
        className="inset-0 w-full h-full "
      />
    
    </div>
  );
}