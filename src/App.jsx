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

  // Ambience audio state & ref
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const ambienceAudioRef = useRef(null);

  const ytPlayerRef = useRef(null);
  const currentSong = SONGS[currentIndex] || SONGS[0];

  // Configure ambience audio volume on mount
  useEffect(() => {
    if (ambienceAudioRef.current) {
      ambienceAudioRef.current.volume = 0.20; // Low background volume
    }
  }, []);

  const toggleAmbience = () => {
    if (!ambienceAudioRef.current) return;
    if (isAmbienceOn) {
      ambienceAudioRef.current.pause();
      setIsAmbienceOn(false);
    } else {
      ambienceAudioRef.current.volume = 0.20; // Ensure low volume
      ambienceAudioRef.current.play().catch(e => console.warn('Ambience audio play error:', e));
      setIsAmbienceOn(true);
    }
  };

  // YouTube player is ready
  const handleYTPlayerReady = useCallback((player) => {
    ytPlayerRef.current = player;
  }, []);

  // YouTube player state changed
  const handleYTStateChange = useCallback((stateCode, player) => {
    // YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (stateCode === 1) {
      setIsPlaying(true);
    } else if (stateCode === 2) {
      setIsPlaying(false);
    } else if (stateCode === 0) {
      // Video ended → play next
      setCurrentIndex(prev => {
        const next = (prev + 1) % SONGS.length;
        return next;
      });
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
    setCurrentIndex(prev => {
      const next = (prev + 1) % SONGS.length;
      return next;
    });
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
      {/* HTML5 Audio element for low-volume road traffic ambience sound */}
      <audio
        ref={ambienceAudioRef}
        src="/traffic-ambience.webm"
        loop
        preload="auto"
      />

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
        isAmbienceOn={isAmbienceOn}
        toggleAmbience={toggleAmbience}
      />

      {/* Hero Visual Section */}
      <HeroBanner isPlaying={isPlaying} />

      {/* Custom Glassmorphism Audio Player UI */}
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
