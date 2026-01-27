import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber, getChannelColor } from '../../utils/helpers';

export const LayerBudgetHealth: React.FC = () => {
  const { data, zoomState, setZoomLevel, setFocusedCampaign } = useDashboard();
  const { campaigns } = data;

  // Only show this layer when explicitly at this zoom range and NOT showing other content
  const isVisible = zoomState.level >= 46 && zoomState.level <= 59;
  const opacity = zoomState.level < 50 
    ? (zoomState.level - 46) / 4
    : zoomState.level > 55
    ? Math.max(0, 1 - ((zoomState.level - 55) / 4))
    : 1;
  const blur = zoomState.level > 55 ? (zoomState.level - 55) / 4 * 6 : 
                zoomState.level < 48 ? (48 - zoomState.level) / 2 * 4 : 0;

  // Hide completely when not in range
  if (!isVisible) return null;

  // Categorize campaigns by budget health
  const campaignsByHealth = campaigns.map(campaign => {
    const utilization = (campaign.spent / campaign.budget) * 100;
    let healthStatus: 'healthy' | 'warning' | 'critical' | 'excellent';
    let healthColor: string;
    
    if (utilization >= 95) {
      healthStatus = 'critical';
      healthColor = 'from-critical/20 to-critical/5 border-critical/30';
    } else if (utilization >= 80) {
      healthStatus = 'warning';
      healthColor = 'from-warning/20 to-warning/5 border-warning/30';
    } else if (utilization >= 50) {
      healthStatus = 'healthy';
      healthColor = 'from-success/20 to-success/5 border-success/30';
    } else {
      healthStatus = 'excellent';
      healthColor = 'from-primary/20 to-primary/5 border-primary/30';
    }
    
    return {
      ...campaign,
      utilization,
      healthStatus,
      healthColor,
      remaining: campaign.budget - campaign.spent
    };
  }).sort((a, b) => b.utilization - a.utilization);

  const criticalCampaigns = campaignsByHealth.filter(c => c.healthStatus === 'critical');
  const warningCampaigns = campaignsByHealth.filter(c => c.healthStatus === 'warning');
  const healthyCampaigns = campaignsByHealth.filter(c => c.healthStatus === 'healthy' || c.healthStatus === 'excellent');

  const totalAllocated = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

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
          <h1 className="text-4xl font-bold text-white mb-2">Budget health dashboard</h1>
          <p className="text-gray-400 text-lg">Monitor budget allocation and utilization across all campaigns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <span className="text-gray-300 text-sm font-semibold">Total Allocated</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalAllocated)}</p>
            <p className="text-gray-400 text-sm mt-1">Across {campaigns.length} campaigns</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-warning" />
              <span className="text-gray-300 text-sm font-semibold">Total Spent</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalSpent)}</p>
            <p className="text-warning text-sm mt-1">{formatNumber((totalSpent / totalAllocated) * 100, 1)}% utilized</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span className="text-gray-300 text-sm font-semibold">Remaining Budget</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalRemaining)}</p>
            <p className="text-success text-sm mt-1">Available to spend</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-critical/20 to-critical/5 border border-critical/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-critical" />
              <span className="text-gray-300 text-sm font-semibold">At Risk</span>
            </div>
            <p className="text-4xl font-bold text-white">{criticalCampaigns.length + warningCampaigns.length}</p>
            <p className="text-critical text-sm mt-1">{criticalCampaigns.length} critical, {warningCampaigns.length} warning</p>
          </motion.div>
        </div>

        {/* Critical Campaigns */}
        {criticalCampaigns.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-critical mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Critical - Budget Exceeded or Nearly Full ({criticalCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {criticalCampaigns.map((campaign, index) => (
                <CampaignBudgetCard 
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

        {/* Warning Campaigns */}
        {warningCampaigns.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-warning mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Warning - High Budget Utilization ({warningCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {warningCampaigns.map((campaign, index) => (
                <CampaignBudgetCard 
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

        {/* Healthy Campaigns */}
        {healthyCampaigns.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-success mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Healthy - Good Budget Health ({healthyCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {healthyCampaigns.map((campaign, index) => (
                <CampaignBudgetCard 
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
      </div>
    </motion.div>
  );
};

interface CampaignBudgetCardProps {
  campaign: any;
  index: number;
  onClick: () => void;
}

const CampaignBudgetCard: React.FC<CampaignBudgetCardProps> = ({ campaign, index, onClick }) => {
  const channelColor = getChannelColor(campaign.channel);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className={`bg-gradient-to-br ${campaign.healthColor} backdrop-blur-lg border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all`}>
        <div 
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ backgroundColor: channelColor }}
        />
        
        <h4 className="text-white font-semibold text-lg mb-2 line-clamp-2">{campaign.name}</h4>
        <p className="text-gray-400 text-sm capitalize mb-4">{campaign.channel}</p>
        
        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm">Budget Utilization</span>
            <span className={`font-bold text-lg ${
              campaign.utilization >= 95 ? 'text-critical' :
              campaign.utilization >= 80 ? 'text-warning' :
              'text-success'
            }`}>
              {formatNumber(campaign.utilization, 1)}%
            </span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                campaign.utilization >= 95 ? 'bg-critical' :
                campaign.utilization >= 80 ? 'bg-warning' :
                'bg-success'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(campaign.utilization, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
            />
          </div>
        </div>

        {/* Budget Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Allocated:</span>
            <span className="text-white font-semibold">{formatCurrency(campaign.budget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Spent:</span>
            <span className="text-white font-semibold">{formatCurrency(campaign.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Remaining:</span>
            <span className={`font-semibold ${
              campaign.remaining < campaign.budget * 0.05 ? 'text-critical' :
              campaign.remaining < campaign.budget * 0.2 ? 'text-warning' :
              'text-success'
            }`}>
              {formatCurrency(campaign.remaining)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

