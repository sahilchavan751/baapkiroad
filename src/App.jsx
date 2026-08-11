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

  // Ambience & Horn audio state & refs
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const ambienceAudioRef = useRef(null);
  const hornAudioRef = useRef(null);

  const ytPlayerRef = useRef(null);
  const currentSong = SONGS[currentIndex] || SONGS[0];

  // Configure ambience & horn audio instances on mount
  useEffect(() => {
    ambienceAudioRef.current = new Audio('/traffic-ambience.webm');
    ambienceAudioRef.current.loop = true;
    ambienceAudioRef.current.volume = 0.45;

    hornAudioRef.current = new Audio('/horn.mp3');
    hornAudioRef.current.volume = 0.85;

    return () => {
      if (ambienceAudioRef.current) ambienceAudioRef.current.pause();
      if (hornAudioRef.current) hornAudioRef.current.pause();
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
  const handleYTStateChange = useCallback((stateCode, player) => {
    if (stateCode === 1) {
      setIsPlaying(true);
    } else if (stateCode === 2) {
      setIsPlaying(false);
    } else if (stateCode === 0) {
      setCurrentIndex(prev => (prev + 1) % SONGS.length);
      setIsPlaying(true);
    }
  }, []);

  // Time update from polling
  const handleYTTimeUpdate = useCallback((current, dur) => {
    setCurrentTime(current);
    if (dur > 0) setDuration(dur);
  }, []);

  // Error → skip to next playable video
  const handleYTError = useCallback((errorCode) => {
    console.warn('Skipping unplayable track, error:', errorCode);
    setCurrentIndex(prev => (prev + 1) % SONGS.length);
  }, []);

  // ============ Custom UI Controls ============

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
    setCurrentIndex(prev => (prev - 1 + SONGS.length) % SONGS.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % SONGS.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSelectSong = (index) => {
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0d0907] text-white selection:bg-amber-500 selection:text-black overflow-hidden font-sans">
      {/* Hidden YouTube Player — plays individual videos by ID */}
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

      {/* Sleek Custom Audio Player with Floating Horn & Ambience buttons */}
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
