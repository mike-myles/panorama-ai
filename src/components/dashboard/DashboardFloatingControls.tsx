import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, MoreHorizontal, HelpCircle, Settings } from 'lucide-react';
import { CosmosFilterPanel } from '../cosmos/CosmosFilterPanel';
import { HelpModal } from '../HelpModal';

export const DashboardFloatingControls: React.FC = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const buttons = [
    {
      id: 'more',
      icon: MoreHorizontal,
      label: 'More Options',
      onClick: () => {},
      active: false
    },
    {
      id: 'filter',
      icon: Filter,
      label: 'Filters',
      onClick: () => setIsFilterPanelOpen(true),
      active: false
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      onClick: () => {},
      active: false
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help',
      onClick: () => setIsHelpModalOpen(true),
      active: false
    }
  ];

  return (
    <>
      <div className="fixed top-[169px] left-6 z-40 flex flex-col gap-3">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          return (
            <motion.button
              key={button.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={button.onClick}
              className={`group relative w-14 h-14 rounded-full border-2 transition-all duration-300 ${
                button.active
                  ? 'bg-primary/20 border-primary shadow-lg shadow-primary/30'
                  : 'bg-gray-900/80 border-white/20 hover:border-primary hover:bg-gray-800'
              } backdrop-blur-xl`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-5 h-5 mx-auto ${button.active ? 'text-primary' : 'text-white'}`} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
                  {button.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Filter Panel (Slides in from left) */}
      <CosmosFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />
      
      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

