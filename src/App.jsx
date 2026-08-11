import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import AudioPlayer from './components/AudioPlayer';
import PlaylistDrawer from './components/PlaylistDrawer';
import YouTubePlayerController from './components/YouTubePlayerController';
import { SONGS } from './data/songs';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  // Shuffle & Repeat state
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'

  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
    repeatModeRef.current = repeatMode;
    currentIndexRef.current = currentIndex;
  }, [isShuffle, repeatMode, currentIndex]);

  // Ambience & Horn audio state & refs
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const ambienceAudioRef = useRef(null);
  const hornAudioRef = useRef(null);

  const ytPlayerRef = useRef(null);
  const currentSong = SONGS[currentIndex] || SONGS[0];

  const getRandomIndex = (currIdx) => {
    if (SONGS.length <= 1) return 0;
    let nextIdx = currIdx;
    while (nextIdx === currIdx) {
      nextIdx = Math.floor(Math.random() * SONGS.length);
    }
    return nextIdx;
  };

  // Configure ambience & horn audio instances on mount
  useEffect(() => {
    ambienceAudioRef.current = new Audio('/traffic-ambience.webm');
    ambienceAudioRef.current.loop = true;
    ambienceAudioRef.current.volume = 0.45;

    hornAudioRef.current = new Audio('/horn.mp3');
    hornAudioRef.current.volume = 0.85;

    // Mobile touch listener to unlock HTML5 audio context on first gesture
    const unlockMobileAudio = () => {
      if (ambienceAudioRef.current) {
        ambienceAudioRef.current.play().then(() => {
          if (!isAmbienceOn) ambienceAudioRef.current.pause();
        }).catch(() => {});
      }
      if (hornAudioRef.current) {
        hornAudioRef.current.play().then(() => {
          hornAudioRef.current.pause();
          hornAudioRef.current.currentTime = 0;
        }).catch(() => {});
      }
      window.removeEventListener('touchstart', unlockMobileAudio);
      window.removeEventListener('click', unlockMobileAudio);
    };

    window.addEventListener('touchstart', unlockMobileAudio, { once: true });
    window.addEventListener('click', unlockMobileAudio, { once: true });

    return () => {
      if (ambienceAudioRef.current) ambienceAudioRef.current.pause();
      if (hornAudioRef.current) hornAudioRef.current.pause();
      window.removeEventListener('touchstart', unlockMobileAudio);
      window.removeEventListener('click', unlockMobileAudio);
    };
  }, []);

  const toggleAmbience = () => {
    if (!ambienceAudioRef.current) {
      ambienceAudioRef.current = new Audio('/traffic-ambience.webm');
      ambienceAudioRef.current.loop = true;
    }

    if (isAmbienceOn) {
      ambienceAudioRef.current.pause();
      setIsAmbienceOn(false);
    } else {
      ambienceAudioRef.current.volume = 0.45;
      const playPromise = ambienceAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Ambience audio play error:', e);
        });
      }
      setIsAmbienceOn(true);
    }
  };

  const handlePlayHorn = () => {
    try {
      if (!hornAudioRef.current) {
        hornAudioRef.current = new Audio('/horn.mp3');
      }
      hornAudioRef.current.currentTime = 0;
      hornAudioRef.current.volume = 0.85;
      const playPromise = hornAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Horn audio play error:', e);
          const fallback = new Audio('/horn.mp3');
          fallback.volume = 0.85;
          fallback.play();
        });
      }
    } catch (err) {
      console.error('Horn trigger error:', err);
    }
  };

  // YouTube player is ready
  const handleYTPlayerReady = useCallback((player) => {
    ytPlayerRef.current = player;
  }, []);

  // YouTube player state changed
  const handleYTStateChange = useCallback((stateCode) => {
    if (stateCode === 1) { // PLAYING
      setIsPlaying(true);
    } else if (stateCode === 2) { // PAUSED
      setIsPlaying(false);
    } else if (stateCode === 0) { // ENDED -> handle repeat / shuffle / next
      if (repeatModeRef.current === 'one') {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
        }
        setIsPlaying(true);
      } else if (isShuffleRef.current) {
        const nextIdx = getRandomIndex(currentIndexRef.current);
        setCurrentIndex(nextIdx);
        setIsPlaying(true);
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          ytPlayerRef.current.loadVideoById(SONGS[nextIdx].videoId);
        }
      } else {
        const nextIdx = (currentIndexRef.current + 1) % SONGS.length;
        setCurrentIndex(nextIdx);
        setIsPlaying(true);
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          ytPlayerRef.current.loadVideoById(SONGS[nextIdx].videoId);
        }
      }
    }
  }, []);

  // Time update from polling
  const handleYTTimeUpdate = useCallback((current, dur) => {
    setCurrentTime(current);
    if (dur > 0) setDuration(dur);
  }, []);

  // Error -> skip to next track
  const handleYTError = useCallback((errorCode) => {
    console.warn('Skipping unplayable track, YT error code:', errorCode);
    const nextIdx = isShuffleRef.current ? getRandomIndex(currentIndexRef.current) : (currentIndexRef.current + 1) % SONGS.length;
    setCurrentIndex(nextIdx);
  }, []);

  // ============ Custom UI Controls ============

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const togglePlay = () => {
    if (!ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Play/Pause error:', e);
    }
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(newTime, true);
    }
  };

  const handlePrevious = () => {
    let prevIdx;
    if (isShuffle) {
      prevIdx = getRandomIndex(currentIndex);
    } else {
      prevIdx = (currentIndex - 1 + SONGS.length) % SONGS.length;
    }
    setCurrentIndex(prevIdx);
    setCurrentTime(0);
    setIsPlaying(true);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(SONGS[prevIdx].videoId);
      } catch (e) { /* ignore */ }
    }
  };

  const handleNext = () => {
    let nextIdx;
    if (isShuffle) {
      nextIdx = getRandomIndex(currentIndex);
    } else {
      nextIdx = (currentIndex + 1) % SONGS.length;
    }
    setCurrentIndex(nextIdx);
    setCurrentTime(0);
    setIsPlaying(true);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(SONGS[nextIdx].videoId);
      } catch (e) { /* ignore */ }
    }
  };

  const handleSelectSong = (index) => {
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(SONGS[index].videoId);
      } catch (e) { /* ignore */ }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0907] text-white selection:bg-amber-500 selection:text-black overflow-hidden font-sans">
      {/* Hidden YouTube Player Controller */}
      <YouTubePlayerController
        videoId={currentSong.videoId}
        isPlaying={isPlaying}
        onPlayerReady={handleYTPlayerReady}
        onStateChange={handleYTStateChange}
        onTimeUpdate={handleYTTimeUpdate}
        onError={handleYTError}
      />

      {/* Top Header */}
      <Header
        isPlaying={isPlaying}
        onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
      />

      {/* Hero Visual Section */}
      <HeroBanner isPlaying={isPlaying} />

      {/* Sleek Custom Audio Player */}
      <AudioPlayer
        currentSong={{ ...currentSong, durationSec: duration }}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        isAmbienceOn={isAmbienceOn}
        toggleAmbience={toggleAmbience}
        onPlayHorn={handlePlayHorn}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
        repeatMode={repeatMode}
        toggleRepeat={toggleRepeat}
      />

      {/* Tracklist Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        currentIndex={currentIndex}
        onSelectSong={handleSelectSong}
        isPlaying={isPlaying}
      />
    </div>
  );
}
