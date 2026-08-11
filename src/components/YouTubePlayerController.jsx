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
  const hasUserInteractedRef = useRef(false);

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
        height: '40',
        width: '60',
        videoId: currentVideoIdRef.current,
        host: 'https://www.youtube-nocookie.com',
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
          playsinline: 1,  // Critical for iOS
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

    // Track first user interaction for mobile autoplay unlock
    const handleUserInteraction = () => {
      hasUserInteractedRef.current = true;
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // When videoId prop changes, load the new video
  useEffect(() => {
    if (readyRef.current && playerRef.current && videoId) {
      try {
        // On mobile, cueVideoById doesn't autoplay (good for initial load)
        // loadVideoById auto-plays which requires prior user interaction
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
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

  // The iframe MUST have real dimensions and not be fully invisible on mobile.
  // Mobile browsers (especially iOS Safari) will refuse to play audio from
  // iframes that are display:none, visibility:hidden, or 0x0 pixels.
  // We use a small visible iframe tucked behind the player bar.
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        width: '60px',
        height: '40px',
        overflow: 'hidden',
        opacity: 0.001,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div id="yt-hidden-player" />
    </div>
  );
}
