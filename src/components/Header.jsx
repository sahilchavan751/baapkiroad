import React, { useState, useEffect } from 'react';
import { Disc3, Volume2, VolumeX, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ isPlaying, onTogglePlaylist, isAmbienceOn, toggleAmbience, onPlayHorn }) {
  const [timeString, setTimeString] = useState('');
  const [onlineCount, setOnlineCount] = useState(44);

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      setTimeString(`${hours}:${minutesStr} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuate online count slightly for live feel
  useEffect(() => {
    const countInterval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return next >= 38 && next <= 62 ? next : prev;
      });
    }, 5000);
    return () => clearInterval(countInterval);
  }, []);

  const ytMusicPlaylistUrl = "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 sm:px-8 py-5 flex items-center justify-between pointer-events-none drop-shadow-md">
      {/* Left Section: Time & Online badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 sm:gap-6 pointer-events-auto"
      >
        <span className="text-white/90 text-sm font-semibold tracking-wider font-mono">
          {timeString || '10:34 am'}
        </span>

        <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
          <span>{onlineCount} online</span>
        </div>
      </motion.div>

      {/* Right Section: Horn, Ambience, Playlist Toggle & YT Music */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-4 sm:gap-6 pointer-events-auto"
      >
        {/* Horn Sound Button */}
        <button
          onClick={onPlayHorn}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/80 hover:text-amber-300 active:scale-95 transition-all duration-150 cursor-pointer"
          title="Honk Horn Sound"
        >
          <Megaphone className="w-4 h-4 text-amber-400" />
          <span>Horn</span>
        </button>

        {/* Road Traffic Ambience Sound Toggle */}
        <button
          onClick={toggleAmbience}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
            isAmbienceOn ? 'text-amber-400 font-semibold' : 'text-white/80 hover:text-white'
          }`}
          title="Toggle Road Traffic Ambience Sound"
        >
          {isAmbienceOn ? (
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 text-white/60" />
          )}
          <span>Ambience</span>
          {isAmbienceOn && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />
          )}
        </button>

        {/* Playlist Quick Drawer Button */}
        <button
          onClick={onTogglePlaylist}
          className="hidden md:flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
          title="Browse Playlist Tracks"
        >
          <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin-slow text-red-400' : ''}`} />
          <span>Playlist</span>
        </button>

        {/* YT Music Playlist Link */}
        <a
          href={ytMusicPlaylistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-all duration-200 group"
        >
          <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2c-3.972 0-7.2-3.228-7.2-7.2s3.228-7.2 7.2-7.2 7.2 3.228 7.2 7.2-3.228 7.2-7.2 7.2zm-2.4-10.2v6l5.1-3-5.1-3z"/>
          </svg>
          <span>YT Music</span>
          <span className="text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">↗</span>
        </a>
      </motion.div>
    </header>
  );
}
