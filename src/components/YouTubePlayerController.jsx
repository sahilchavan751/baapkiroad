import React, { useEffect, useRef } from 'react';

export default function YouTubePlayerController({
  videoId,
  isPlaying,
  onPlayerReady,
  onStateChange,
  onTimeUpdate,
  onError
}) {
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const readyRef = useRef(false);
  const currentVideoIdRef = useRef(videoId);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    currentVideoIdRef.current = videoId;
    isPlayingRef.current = isPlaying;
  }, [videoId, isPlaying]);

  useEffect(() => {
    // Load YouTube IFrame API script once if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-instance', {
        height: '100%',
        width: '100%',
        videoId: currentVideoIdRef.current,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1, // Essential for mobile iOS inline playback
        },
        events: {
          onReady: (event) => {
            readyRef.current = true;
            if (onPlayerReady) onPlayerReady(event.target);
          },
          onStateChange: (event) => {
            if (onStateChange) onStateChange(event.data, event.target);
          },
          onError: (event) => {
            console.warn('YT Error code:', event.data, 'for video:', currentVideoIdRef.current);
            if (onError) onError(event.data);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle track change (videoId)
  useEffect(() => {
    if (readyRef.current && playerRef.current && videoId) {
      try {
        if (isPlayingRef.current) {
          playerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: 0
          });
        } else {
          playerRef.current.cueVideoById({
            videoId: videoId,
            startSeconds: 0
          });
        }
      } catch (e) {
        console.warn('Error changing video:', e);
      }
    }
  }, [videoId]);

  // Sync play/pause state changes
  useEffect(() => {
    if (readyRef.current && playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        const state = playerRef.current.getPlayerState();
        if (isPlaying && state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
          playerRef.current.playVideo();
        } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn('Error syncing play/pause:', e);
      }
    }
  }, [isPlaying]);

  // Time update polling loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const current = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            if (onTimeUpdate) onTimeUpdate(current, dur);
          } catch (e) { /* ignore */ }
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onTimeUpdate]);

  // Mobile browsers require the iframe to have actual layout dimensions
  // and be rendered on-screen (not display:none, not opacity 0).
  // We position it fixed in the background behind the app UI at 5% opacity.
  return (
    <div
      className="fixed bottom-0 right-0 w-32 h-20 pointer-events-none opacity-5 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div id="yt-player-instance" className="w-full h-full" />
    </div>
  );
}
