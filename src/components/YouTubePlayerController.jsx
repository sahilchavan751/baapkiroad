import React, { useEffect, useRef, useCallback } from 'react';

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

  useEffect(() => {
    currentVideoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    // Load YouTube IFrame API script once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-hidden-player', {
        height: '1',
        width: '1',
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
          playsinline: 1,
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

  // When videoId prop changes, load the new video
  useEffect(() => {
    if (readyRef.current && playerRef.current && videoId) {
      try {
        playerRef.current.loadVideoById(videoId);
      } catch (e) {
        console.warn('Error loading video:', e);
      }
    }
  }, [videoId]);

  // Time update polling
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

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      <div id="yt-hidden-player" />
    </div>
  );
}
