import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Command, LayoutDashboard, Orbit } from 'lucide-react';
import { ViewMode } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { CommandBar } from './CommandBar';

const viewModes = [
  { id: 'cosmos' as ViewMode, label: 'Cosmos', icon: Orbit },
  { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard }
];

export const FilterBar: React.FC = () => {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const { activeView, setActiveView } = useDashboard();

  return (
    <div className="sticky top-[73px] z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10" style={{ width: '100vw', maxWidth: '100vw' }}>
      <div className="w-full px-6 py-4" style={{ maxWidth: '100vw' }}>
        <div className="flex items-center gap-3">
          {/* View Mode Tabs (moved from PresetTabs) */}
          {viewModes.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <motion.button
                key={id}
                onClick={() => setActiveView(id)}
                className={`relative px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeViewTab"
                    className="absolute inset-0 bg-primary/20 rounded-xl border-2 border-primary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* AI Navigator Button with Shimmer */}
          <button
            onClick={() => setIsCommandBarOpen(true)}
            className="ai-navigator-button flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            {/* Shimmer overlay */}
            <div className="shimmer-overlay" />
            
            {/* Button content */}
            <div className="relative z-10 flex items-center gap-2">
              <Command className="w-5 h-5" />
              <span className="hidden sm:inline">AI Navigator</span>
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-xs font-mono">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>
      </div>
      
      {/* Command Bar Modal */}
      <CommandBar 
        isOpen={isCommandBarOpen} 
        onClose={() => setIsCommandBarOpen(false)} 
      />
    </div>
  );
};
