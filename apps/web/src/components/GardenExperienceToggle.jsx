import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

const GardenExperienceToggle = () => {
  const [isNightMode, setIsNightMode] = useState(() => {
    const saved = localStorage.getItem('gardenExperienceMode');
    return saved === 'night';
  });

  useEffect(() => {
    localStorage.setItem('gardenExperienceMode', isNightMode ? 'night' : 'day');
  }, [isNightMode]);

  const dayContent = {
    title: 'Social Balcony',
    description: 'Card games and therapeutic breakfasts on the balcony with Gwarimpa skyline view.',
    image: HOTEL_IMAGES.gardenDay,
  };

  const nightContent = {
    title: 'Garden After Dark',
    description: 'Fresh Pepper Soup + Outdoor Movies under the stars.',
    image: HOTEL_IMAGES.gardenNight,
  };

  const activeContent = isNightMode ? nightContent : dayContent;

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl my-12">
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
        <button
          onClick={() => setIsNightMode(false)}
          className={`p-2 rounded-full transition-all ${!isNightMode ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
          aria-label="Day Mode"
        >
          <Sun className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsNightMode(true)}
          className={`p-2 rounded-full transition-all ${isNightMode ? 'bg-black text-white neon-glow-amber' : 'text-white hover:bg-white/20'}`}
          aria-label="Night Mode"
        >
          <Moon className="w-5 h-5" />
        </button>
      </div>

      <div className="relative h-[500px] w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={isNightMode ? 'night' : 'day'}
            src={activeContent.image}
            alt={activeContent.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
          <motion.div
            key={`text-${isNightMode ? 'night' : 'day'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="heading-font text-4xl md:text-5xl font-bold text-white mb-4">
              {activeContent.title}
            </h3>
            <p className="text-lg text-white/90 max-w-2xl">
              {activeContent.description}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GardenExperienceToggle;