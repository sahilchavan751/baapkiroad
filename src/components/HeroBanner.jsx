import React from 'react';
import { motion } from 'framer-motion';

export default function HeroBanner({ isPlaying }) {
  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden select-none flex flex-col items-center justify-start pt-20 sm:pt-24 md:pt-28">
      {/* High Quality Hero Background Image (Mobile & Desktop) */}
      <div className="absolute inset-0 z-0">
        {/* Mobile Vertical Background */}
        <img
          src="/saloon_bg-verticle.png"
          alt="Rickshawala Mobile Background Illustration"
          className="block sm:hidden w-full h-full object-cover object-center"
        />
        
        {/* Desktop Landscape Background */}
        <img
          src="/saloon_bg.png"
          alt="Rickshawala Desktop Background Illustration"
          className="hidden sm:block w-full h-full object-cover object-center"
        />
        
        {/* Subtle Vignette & Atmospheric Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none" />
      </div>

      {/* Hero Title Image - Positioned Upper Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 pointer-events-none px-4 text-center flex items-center justify-center w-full"
      >
        <img
          src="/title.png"
          alt="Rickshawala Title"
          className="w-[75vw] sm:w-[65vw] md:w-[55vw] max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl h-auto object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
        />
      </motion.div>

      {/* Floating Ambient Glow Particles Overlay */}
      {isPlaying && (
        <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-amber-200/60 blur-xs animate-ping duration-1000" />
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-orange-300/40 blur-xs animate-pulse duration-700" />
        </div>
      )}
    </div>
  );
}
