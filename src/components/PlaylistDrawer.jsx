import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Radio, Disc, ExternalLink, Music } from 'lucide-react';
import { SONGS } from '../data/songs';

export default function PlaylistDrawer({
  isOpen,
  onClose,
  currentIndex,
  onSelectSong,
  isPlaying
}) {
  const ytMusicUrl = "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw";
  const spotifyUrl = "https://open.spotify.com/playlist/66IiiYZBRPPHQTxxp7461k";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg p-5 rounded-3xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl text-white overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-white animate-pulse" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-wide">Rickshawala Playlist</h3>
                  <p className="text-[11px] text-white/50">{SONGS.length} tracks • 90s Bollywood Hits</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white font-medium"
                >
                  <span>Spotify</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>
                <a
                  href={ytMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white font-medium"
                >
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2c-3.972 0-7.2-3.228-7.2-7.2s3.228-7.2 7.2-7.2 7.2 3.228 7.2 7.2-3.228 7.2-7.2 7.2zm-2.4-10.2v6l5.1-3-5.1-3z"/>
                  </svg>
                  <span>YT Music</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Song List - Clean Hidden Scrollbar */}
            <div className="flex flex-col gap-1 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
              {SONGS.map((song, index) => {
                const isActive = index === currentIndex;

                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      onSelectSong(index);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/30 text-white'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Track Number */}
                      <span className={`text-xs font-mono w-5 text-right shrink-0 ${isActive ? 'text-white font-bold' : 'text-white/30'}`}>
                        {index + 1}
                      </span>

                      {/* YouTube Thumbnail */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-neutral-800">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Disc className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                          </div>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="flex flex-col min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                          {song.title}
                        </h4>
                        <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-white/40'}`}>
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-0.5 bg-white animate-bounce" style={{ height: '60%', animationDelay: '0ms' }} />
                          <span className="w-0.5 bg-white animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
                          <span className="w-0.5 bg-white animate-bounce" style={{ height: '40%', animationDelay: '300ms' }} />
                          <span className="w-0.5 bg-white animate-bounce" style={{ height: '80%', animationDelay: '450ms' }} />
                        </div>
                      ) : isActive ? (
                        <Pause className="w-4 h-4 text-white opacity-60" />
                      ) : (
                        <Play className="w-4 h-4 opacity-20 text-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
