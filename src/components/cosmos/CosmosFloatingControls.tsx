import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Type, Search, AlertTriangle, Rocket, LucideIcon } from 'lucide-react';

/* cspell:words FC Idx bg */

// Separate component for button with tooltip using React state
const ButtonWithTooltip: React.FC<{
  button: { id: string; icon: LucideIcon; label: string; onClick: () => void; active: boolean; isAINav?: boolean };
  Icon: LucideIcon;
  handleClick: () => void;
}> = ({ button, Icon, handleClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden w-14 h-14 rounded-full border-2 transition-all duration-300 ${
          button.active
            ? 'bg-primary/20 border-primary shadow-lg shadow-primary/30'
            : button.isAINav
              ? 'ai-navigator-button border-white/20'
              : 'bg-gray-900/80 border-white/20 hover:border-primary hover:bg-gray-800'
        } backdrop-blur-xl`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {button.isAINav && (
          <div className="shimmer-overlay absolute inset-0 rounded-full pointer-events-none" />
        )}
        <Icon className={`w-5 h-5 mx-auto ${button.active ? 'text-primary' : 'text-white'}`} />
      </motion.button>
      
      {/* Tooltip */}
      <div 
        className={`absolute left-[72px] top-1/2 -translate-y-1/2 pointer-events-none z-[9999] transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
          {button.label}
        </div>
      </div>
    </div>
  );
};

interface CosmosFloatingControlsProps {
  onFilterClick: () => void;
  onAlertsClick?: () => void;
  alertsActive?: boolean;
  onHelpClick?: () => void;
  onSearchClick?: () => void;
  searchOpen?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchClose?: () => void;
  onResetView?: () => void;
  onAINavigatorClick?: () => void;
  onLaunchClick?: () => void;
  launchActive?: boolean;
  showCampaignNames: boolean;
  onToggleCampaignNames: () => void;
  hideReset?: boolean;
  hideToggleNames?: boolean;
}

export const CosmosFloatingControls: React.FC<CosmosFloatingControlsProps> = ({
  onSearchClick,
  searchOpen = false,
  searchQuery = '',
  onSearchChange,
  onSearchClose,
  onAlertsClick,
  alertsActive,
  onResetView,
  onAINavigatorClick,
  onLaunchClick,
  launchActive,
  showCampaignNames,
  onToggleCampaignNames,
  hideReset = false,
  hideToggleNames = false
}) => {
  let buttons = [
    {
      id: 'ai',
      icon: Sparkles,
      label: 'AI Navigator',
      onClick: onAINavigatorClick || (() => {}),
      active: false,
      isAINav: true
    },
    {
      id: 'search',
      icon: Search,
      label: 'Search',
      onClick: onSearchClick || (() => {}),
      active: !!searchOpen
    },
    {
      id: 'alerts',
      icon: AlertTriangle,
      label: 'Alerts',
      onClick: onAlertsClick || (() => {}),
      active: !!alertsActive
    },
    {
      id: 'launch',
      icon: Rocket,
      label: 'Upcoming launches',
      onClick: onLaunchClick || (() => {}),
      active: !!launchActive
    },
    {
      id: 'grid',
      icon: Type,
      label: 'Toggle Campaign Names',
      onClick: onToggleCampaignNames,
      active: showCampaignNames
    },
    // Reset button kept but hidden by default
    {
      id: 'reset',
      icon: Target,
      label: 'Reset View',
      onClick: onResetView || (() => {}),
      active: false
    }
  ];

  if (hideReset) {
    buttons = buttons.filter(b => b.id !== 'reset');
  }
  if (hideToggleNames) {
    buttons = buttons.filter(b => b.id !== 'grid');
  }

  const visibleButtons = buttons;
  const searchIdx = visibleButtons.findIndex(b => b.id === 'search');
  const buttonSizePx = 56; // w-14 h-14 => 56px
  const gapPx = 12; // gap-3 => 12px
  const inputTopPx = searchIdx >= 0 ? searchIdx * (buttonSizePx + gapPx) : 0;

  return (
    <div id="floating-controls" className="fixed top-[97px] left-6 z-[100] flex flex-col gap-3" style={{ pointerEvents: 'auto' }}>
      {visibleButtons.map((button) => {
        const Icon = button.icon;
        const handleClick = button.id === 'search'
          ? () => {
              if (searchOpen) {
                onSearchChange && onSearchChange('');
                onSearchClose && onSearchClose();
              } else {
                (onSearchClick || (() => {}))();
              }
            }
          : button.onClick;
        return (
          <ButtonWithTooltip
            key={button.id}
            button={button}
            Icon={Icon}
            handleClick={handleClick}
          />
        );
      })}

      {searchOpen && (
        <div
          className="absolute"
          style={{ left: 72, top: inputTopPx, width: 320 }}
        >
          <div className="flex items-center bg-black/75 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl px-3 py-2">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search campaigns and items"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-gray-400 px-2 py-2"
            />
            {searchQuery ? (
              <button
                className="ml-2 px-2 py-1 text-gray-300 hover:text-white"
                onClick={() => { onSearchChange && onSearchChange(''); onSearchClose && onSearchClose(); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : (
              <button
                className="ml-2 px-2 py-1 text-gray-300 hover:text-white"
                onClick={() => onSearchClose && onSearchClose()}
                aria-label="Close search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

