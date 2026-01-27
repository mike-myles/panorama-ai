import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

interface TimelineSliderProps {
  onTimeChange: (daysAgo: number) => void;
  onCollapse?: () => void;
}

type Duration = '3months' | '6months' | '1year' | '3years';

const durationLabels: Record<Duration, string> = {
  '3months': '3 Months',
  '6months': '6 Months',
  '1year': '1 Year',
  '3years': '3 Years'
};

const durationDays: Record<Duration, number> = {
  '3months': 90,
  '6months': 180,
  '1year': 365,
  '3years': 1095
};

export const TimelineSlider: React.FC<TimelineSliderProps> = ({ onTimeChange, onCollapse }) => {
  const [duration, setDuration] = useState<Duration>('3months');
  const [sliderValue, setSliderValue] = useState(0); // 0 = current, 100 = max days ago

  const maxDays = durationDays[duration];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    const daysAgo = Math.round((value / 100) * maxDays);
    onTimeChange(daysAgo);
  };

  const handleDurationChange = (newDuration: Duration) => {
    setDuration(newDuration);
    setSliderValue(0);
    onTimeChange(0);
  };

  const getDateFromDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentDaysAgo = Math.round((sliderValue / 100) * maxDays);

  const content = (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 w-full bg-gray-800/50 backdrop-blur-lg border-t border-white/10 px-8 py-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-white font-semibold">Historical view</span>
          </div>
          
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Collapse"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          
          {/* Duration selector */}
          <div className="flex gap-2">
            {(Object.keys(durationLabels) as Duration[]).map((dur) => (
              <button
                key={dur}
                onClick={() => handleDurationChange(dur)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  duration === dur
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                {durationLabels[dur]}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Current date display */}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-white font-semibold">
              {currentDaysAgo === 0 ? 'Today' : getDateFromDaysAgo(currentDaysAgo)}
            </span>
          </div>
        </div>

        {/* Timeline slider */}
        <div className="relative">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{getDateFromDaysAgo(maxDays)}</span>
            <span className="text-primary font-semibold">
              {sliderValue}% back in time
            </span>
            <span>Today</span>
          </div>
          
          <div className="relative">
            {/* Slider track with gradient */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gradient-to-r from-purple-500/30 via-primary/30 to-green-500/30 rounded-full" />
            
            {/* Progress indicator */}
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-purple-500 to-primary rounded-full"
              style={{ width: `${100 - sliderValue}%` }}
              initial={false}
              animate={{ width: `${100 - sliderValue}%` }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={100 - sliderValue} // Invert so right = current, left = past
              onChange={(e) => handleSliderChange({ ...e, target: { ...e.target, value: String(100 - parseInt(e.target.value)) } })}
              className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
              style={{
                WebkitAppearance: 'none',
              }}
            />
            
            {/* Custom slider thumb styling via CSS */}
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3B82F6, #A855F7);
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
                position: relative;
                z-index: 20;
              }
              
              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3B82F6, #A855F7);
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
              }
              
              input[type="range"]::-webkit-slider-thumb:hover {
                box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.4), 0 6px 16px rgba(0, 0, 0, 0.5);
              }
            `}</style>
          </div>

          {/* Time markers */}
          <div className="flex justify-between mt-3">
            {[0, 25, 50, 75, 100].map((marker) => {
              const markerDaysAgo = Math.round((marker / 100) * maxDays);
              return (
                <div
                  key={marker}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => {
                    setSliderValue(marker);
                    onTimeChange(markerDaysAgo);
                  }}
                >
                  <div className={`w-0.5 h-2 rounded-full transition-all ${
                    Math.abs(sliderValue - marker) < 5 
                      ? 'bg-primary h-3' 
                      : 'bg-gray-600 group-hover:bg-gray-400'
                  }`} />
                  <span className={`text-[10px] mt-1 transition-colors ${
                    Math.abs(sliderValue - marker) < 5
                      ? 'text-primary font-bold'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}>
                    {marker === 0 ? getDateFromDaysAgo(maxDays).split(',')[0] : 
                     marker === 100 ? 'Now' : 
                     `${100 - marker}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info text */}
        {sliderValue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-center"
          >
            <p className="text-sm text-gray-400">
              Viewing portfolio data from <span className="text-primary font-semibold">{currentDaysAgo} days ago</span>
              {' '}• All metrics above reflect this time period
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return createPortal(content, document.body);
};

