import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext';

export const LayerIndicator: React.FC = () => {
  const { zoomState } = useDashboard();

  return (
    <motion.div 
      className="fixed bottom-8 left-6 z-50 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-lg border-2 border-primary/40 rounded-xl p-4 shadow-2xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-gray-300 text-[10px] uppercase tracking-wider font-bold">Layer</span>
          <span className="text-white text-2xl font-bold leading-none">
            {zoomState.layer}
          </span>
        </div>
        <div className="h-10 w-px bg-white/30" />
        <div className="flex flex-col">
          <span className="text-gray-300 text-[10px] uppercase tracking-wider font-bold">Zoom</span>
          <span className="text-white text-2xl font-bold leading-none">
            {Math.round(zoomState.level)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

