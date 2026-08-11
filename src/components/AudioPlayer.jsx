import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ListMusic } from 'lucide-react';

export default function AudioPlayer({
  currentSong,
  isPlaying,
  togglePlay,
  onPrevious,
  onNext,
  currentTime,
  duration,
  onSeek,
  onOpenPlaylist
}) {
  const progressBarRef = useRef(null);

  // Helper to format seconds into m:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickPosition / rect.width));
    onSeek(percentage * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl sm:max-w-2xl px-3 sm:px-6 py-2.5 sm:py-3 rounded-full bg-neutral-900/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3 sm:gap-6 text-white"
    >
      {/* Left: Album Thumbnail */}
      <div className="flex items-center gap-3 min-w-0">
        <div 
          onClick={onOpenPlaylist}
          className="relative group cursor-pointer shrink-0"
          title="Click to view tracklist"
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/20 shadow-md relative bg-neutral-800 transition-transform group-hover:scale-105 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            {/* Center vinyl hole design detail */}
            <div className="absolute inset-0 m-auto w-3 h-3 bg-neutral-900 rounded-full border border-white/30" />
          </div>
          
          {/* Equalizer overlay icon */}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ListMusic className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="flex flex-col min-w-0 pr-1">
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-[200px] md:max-w-[240px]" title={currentSong.title}>
            {currentSong.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-white/60 truncate max-w-[130px] sm:max-w-[200px]" title={currentSong.artist}>
            {currentSong.artist}
          </p>

          {/* Time indicator underneath info */}
          <div className="flex items-center gap-1 mt-0.5 text-[10px] sm:text-[11px] text-white/50 font-mono tracking-tight">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration || currentSong.durationSec)}</span>
          </div>
        </div>
      </div>

      {/* Middle: Progress Bar & Scrubber */}
      <div className="hidden sm:flex flex-col flex-1 max-w-[220px] mx-2 gap-1">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="relative w-full h-1.5 bg-white/15 hover:bg-white/25 rounded-full cursor-pointer overflow-hidden transition-all group"
        >
          <div
            className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full relative transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Right: Playback Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Skip Back */}
        <button
          onClick={onPrevious}
          className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </button>

        {/* Main Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={togglePlay}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:shadow-white/20 transition-all cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current text-black" />
          ) : (
            <Play className="w-5 h-5 fill-current text-black ml-0.5" />
          )}
        </motion.button>

        {/* Skip Forward */}
        <button
          onClick={onNext}
          className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </button>
      </div>
    </motion.div>
  );
}
