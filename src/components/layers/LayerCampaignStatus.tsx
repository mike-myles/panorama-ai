import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber, getChannelColor } from '../../utils/helpers';
import { AlertBadge } from '../AlertBadge';

export const LayerCampaignStatus: React.FC = () => {
  const { data, zoomState, setZoomLevel, setFocusedCampaign } = useDashboard();
  const { campaigns } = data;

  // Only show this layer when explicitly at this zoom range and NOT showing other content  
  const isVisible = zoomState.level >= 60 && zoomState.level <= 69;
  const opacity = zoomState.level < 63 
    ? (zoomState.level - 60) / 3
    : zoomState.level > 65
    ? Math.max(0, 1 - ((zoomState.level - 65) / 3))
    : 1;
  const blur = zoomState.level > 65 ? (zoomState.level - 65) / 3 * 6 : 
                zoomState.level < 62 ? (62 - zoomState.level) / 2 * 4 : 0;

  // Hide completely when not in range
  if (!isVisible) return null;

  // Categorize campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused');
  const warningCampaigns = campaigns.filter(c => c.status === 'at_risk');

  const activeTotal = activeCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const activeRoas = activeCampaigns.reduce((sum, c, _, arr) => sum + c.roas / arr.length, 0);

  return (
    <motion.div
      className="absolute inset-0 overflow-auto p-12 pb-24"
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setZoomLevel(15)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Portfolio
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Campaign status management</h1>
          <p className="text-gray-400 text-lg">Monitor and manage active, paused, and at-risk campaigns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Play className="w-6 h-6 text-success" />
              <span className="text-gray-300 text-sm font-semibold">Active campaigns</span>
            </div>
            <p className="text-5xl font-bold text-white">{activeCampaigns.length}</p>
            <p className="text-success text-sm mt-1">Avg ROAS: {formatNumber(activeRoas, 2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <span className="text-gray-300 text-sm font-semibold">Warning Status</span>
            </div>
            <p className="text-5xl font-bold text-white">{warningCampaigns.length}</p>
            <p className="text-warning text-sm mt-1">Requires attention</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-500/20 to-gray-500/5 border border-gray-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Pause className="w-6 h-6 text-gray-400" />
              <span className="text-gray-300 text-sm font-semibold">Paused Campaigns</span>
            </div>
            <p className="text-5xl font-bold text-white">{pausedCampaigns.length}</p>
            <p className="text-gray-400 text-sm mt-1">Currently inactive</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-gray-300 text-sm font-semibold">Active Spend</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(activeTotal)}</p>
            <p className="text-primary text-sm mt-1">From active campaigns</p>
          </motion.div>
        </div>

        {/* Active Campaigns Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-success mb-6 flex items-center gap-3">
            <div className="p-2 bg-success/20 rounded-xl">
              <Play className="w-6 h-6" />
            </div>
            Active Campaigns ({activeCampaigns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign, index) => (
              <CampaignStatusCard 
                key={campaign.id}
                campaign={campaign}
                index={index}
                onClick={() => {
                  setFocusedCampaign(campaign.id);
                  setZoomLevel(90);
                }}
              />
            ))}
          </div>
        </div>

        {/* Warning Campaigns Section */}
        {warningCampaigns.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-warning mb-6 flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              Warning Status ({warningCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {warningCampaigns.map((campaign, index) => (
                <CampaignStatusCard 
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  onClick={() => {
                    setFocusedCampaign(campaign.id);
                    setZoomLevel(90);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused Campaigns Section */}
        {pausedCampaigns.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-xl">
                <Pause className="w-6 h-6" />
              </div>
              Paused / Inactive Campaigns ({pausedCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pausedCampaigns.map((campaign, index) => (
                <CampaignStatusCard 
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  isDisabled={true}
                  onClick={() => {
                    setFocusedCampaign(campaign.id);
                    setZoomLevel(90);
                  }}
                />
              ))}
            </div>
            {pausedCampaigns.length === 0 && (
              <div className="bg-white/5 rounded-2xl p-8 text-center">
                <p className="text-gray-500">No paused campaigns at the moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface CampaignStatusCardProps {
  campaign: any;
  index: number;
  isDisabled?: boolean;
  onClick: () => void;
}

const CampaignStatusCard: React.FC<CampaignStatusCardProps> = ({ campaign, index, isDisabled = false, onClick }) => {
  const channelColor = getChannelColor(campaign.channel);
  const budgetPercent = (campaign.spent / campaign.budget) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDisabled ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isDisabled ? { scale: 1.02, y: -4 } : {}}
      onClick={onClick}
      className={`cursor-pointer ${isDisabled ? 'grayscale' : ''}`}
    >
      <div className={`relative bg-white/5 backdrop-blur-lg border ${
        isDisabled ? 'border-gray-500/30' : 'border-white/10'
      } rounded-2xl p-6 shadow-xl hover:border-${isDisabled ? 'gray-500/50' : 'white/30'} transition-all overflow-hidden`}>
        {/* Channel color accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: isDisabled ? '#6B7280' : channelColor, opacity: isDisabled ? 0.5 : 1 }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-white font-semibold text-lg mb-1 line-clamp-2">{campaign.name}</h4>
            <p className={`text-sm capitalize ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>
              {campaign.channel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {campaign.alerts.length > 0 && !isDisabled && (
              <AlertBadge alert={campaign.alerts[0]} size={28} />
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              campaign.status === 'active' ? 'bg-success/20 text-success' :
              campaign.status === 'paused' ? 'bg-gray-500/20 text-gray-400' :
              'bg-warning/20 text-warning'
            }`}>
              {campaign.status === 'at_risk' ? 'At risk' : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>Budget</span>
            <span className={`text-sm font-semibold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
              {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
            </span>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isDisabled ? 'bg-gray-500' :
                budgetPercent > 95 ? 'bg-critical' : 
                budgetPercent > 80 ? 'bg-warning' : 
                'bg-success'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className={`text-xs mb-1 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>ROAS</p>
            <p className={`text-xl font-bold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
              {formatNumber(campaign.roas, 1)}
            </p>
          </div>
          <div>
            <p className={`text-xs mb-1 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>Conv.</p>
            <p className={`text-xl font-bold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
              {campaign.conversions}
            </p>
          </div>
          <div>
            <p className={`text-xs mb-1 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>CTR</p>
            <p className={`text-xl font-bold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
              {formatNumber(campaign.ctr, 1)}%
            </p>
          </div>
        </div>

        {isDisabled && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Pause className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-400 font-semibold">Paused</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

