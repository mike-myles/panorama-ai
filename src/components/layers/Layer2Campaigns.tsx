import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber, getChannelColor, getStatusColor } from '../../utils/helpers';
import { AlertBadge } from '../AlertBadge';
import { Campaign } from '../../types';

interface CampaignCardProps {
  campaign: Campaign;
  isFocused: boolean;
  onClick: () => void;
  layerDistance: number;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, isFocused, onClick, layerDistance }) => {
  const budgetPercent = (campaign.spent / campaign.budget) * 100;
  const channelColor = getChannelColor(campaign.channel);
  const statusColor = getStatusColor(campaign.status);
  
  // Sharp cards for readability (no blur)
  const opacity = layerDistance > 0 ? Math.max(0.7, 1 - (layerDistance * 0.1)) : 1;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03, rotateY: 2, rotateX: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer ${isFocused ? 'ring-4 ring-primary' : ''}`}
      style={{
        filter: 'none',
        opacity,
        perspective: '1000px'
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl hover:border-white/30 transition-all overflow-hidden">
        {/* Channel color accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: channelColor }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
              {campaign.name}
            </h3>
            <p className="text-gray-400 text-sm capitalize">
              {campaign.channel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {campaign.alerts.length > 0 && (
              <AlertBadge alert={campaign.alerts[0]} size={32} />
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-white/10`}>
              {campaign.status === 'at_risk' 
                ? 'At risk' 
                : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Budget</span>
            <span className="text-white text-sm font-semibold">
              {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
            </span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                budgetPercent > 95 ? 'bg-critical' : budgetPercent > 80 ? 'bg-warning' : 'bg-success'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">ROAS</p>
            <p className="text-white text-xl font-bold">
              {formatNumber(campaign.roas, 1)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Conv.</p>
            <p className="text-white text-xl font-bold">
              {campaign.conversions}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">CTR</p>
            <p className="text-white text-xl font-bold">
              {formatNumber(campaign.ctr, 1)}%
            </p>
          </div>
        </div>

        {/* Hover gradient overlay */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
          style={{ backgroundColor: channelColor }}
        />
      </div>
    </motion.div>
  );
};

export const Layer2Campaigns: React.FC = () => {
  const { data, zoomState, setZoomLevel, setFocusedCampaign, filterState } = useDashboard();
  const { campaigns } = data;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Hide when KPI-specific views are showing
  const isVisible = zoomState.level >= 70 && zoomState.level <= 85;
  
  // Scroll to top when layer becomes visible
  useEffect(() => {
    if (isVisible && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isVisible]);
  
  // Calculate opacity - fade in from 70-75%, stay visible 75-80%, fade out 80-85%
  let opacity = 1;
  if (zoomState.level < 75) {
    opacity = (zoomState.level - 70) / 5;
  } else if (zoomState.level > 80) {
    opacity = Math.max(0, 1 - ((zoomState.level - 80) / 5));
  }

  // Keep sharp (no container blur)

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterState.channels.length > 0 && !filterState.channels.includes(campaign.channel)) {
      return false;
    }
    if (filterState.status !== 'all' && campaign.status !== filterState.status) {
      return false;
    }
    if (campaign.roas < filterState.roasRange[0] || campaign.roas > filterState.roasRange[1]) {
      return false;
    }
    if (campaign.budget < filterState.budgetRange[0] || campaign.budget > filterState.budgetRange[1]) {
      return false;
    }
    if (zoomState.focusedChannelId && campaign.channel !== zoomState.focusedChannelId) {
      return false;
    }
    return true;
  });

  const handleCampaignClick = (campaignId: string) => {
    setFocusedCampaign(campaignId);
    setZoomLevel(90); // Zoom to Layer 3 (Diagnostic) range: 86-95
  };

  return (
    <motion.div
      ref={scrollContainerRef}
      className="absolute inset-0 flex items-start justify-center px-12 pt-28 pb-12 overflow-auto"
      style={{
        opacity,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full max-w-screen-2xl">
        {filteredCampaigns.map((campaign, index) => {
          const isFocused = zoomState.focusedCampaignId === campaign.id;
          // Only calculate distance if a campaign is actually focused, otherwise all cards are at distance 0
          const focusedIndex = zoomState.focusedCampaignId ? filteredCampaigns.findIndex(c => c.id === zoomState.focusedCampaignId) : -1;
          const layerDistance = focusedIndex >= 0 && !isFocused ? Math.min(2, Math.abs(index - focusedIndex)) : 0;
          
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <CampaignCard
                campaign={campaign}
                isFocused={isFocused}
                onClick={() => handleCampaignClick(campaign.id)}
                layerDistance={layerDistance}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

