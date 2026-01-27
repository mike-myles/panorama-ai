/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, Search, Share2, Monitor, Mail, Video } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, Channel } from '../../../types';

interface ChannelMomentumWidgetProps {
  campaigns: Campaign[];
  channels: Channel[];
  onDrillIn?: () => void;
  onChannelClick?: (channelId: string) => void;
}

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  search: Search,
  social: Share2,
  display: Monitor,
  email: Mail,
  video: Video
};

const CHANNEL_COLORS: Record<string, string> = {
  search: '#3B82F6',
  social: '#A855F7',
  display: '#F97316',
  email: '#10B981',
  video: '#EC4899'
};

export const ChannelMomentumWidget: React.FC<ChannelMomentumWidgetProps> = ({
  campaigns,
  channels,
  onDrillIn,
  onChannelClick
}) => {
  const momentumData = useMemo(() => {
    // Calculate momentum for each channel
    const channelData = channels.map(channel => {
      const channelCampaigns = campaigns.filter(c => c.channel === channel.id);
      const avgRoas = channelCampaigns.length > 0
        ? channelCampaigns.reduce((sum, c) => sum + c.roas, 0) / channelCampaigns.length
        : 0;
      
      // Calculate trend from channel data
      const trend = channel.trend;
      const trendStart = trend[0] || 0;
      const trendEnd = trend[trend.length - 1] || 0;
      const trendChange = trendStart > 0 
        ? Math.round(((trendEnd - trendStart) / trendStart) * 100)
        : 0;

      const totalSpend = channelCampaigns.reduce((sum, c) => sum + c.spent, 0);
      const alertCount = channelCampaigns.filter(c => c.alert).length;

      return {
        id: channel.id,
        name: channel.name,
        roas: avgRoas,
        trendChange,
        trend: trendChange > 2 ? 'up' : trendChange < -2 ? 'down' : 'stable',
        totalSpend,
        campaignCount: channelCampaigns.length,
        alertCount,
        color: CHANNEL_COLORS[channel.id] || '#6B7280'
      };
    }).sort((a, b) => b.trendChange - a.trendChange);

    // Find gaining and declining channels
    const gaining = channelData.filter(c => c.trendChange > 5);
    const declining = channelData.filter(c => c.trendChange < -5);

    return {
      channels: channelData,
      gaining,
      declining,
      bestPerformer: channelData.reduce((best, c) => c.roas > best.roas ? c : best, channelData[0]),
      worstPerformer: channelData.reduce((worst, c) => c.roas < worst.roas ? c : worst, channelData[0])
    };
  }, [campaigns, channels]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <WidgetContainer
      title="Channel Momentum"
      icon={<Activity className="w-4 h-4" />}
      accentColor="#22C55E"
      onDrillIn={onDrillIn}
      drillInLabel="View channel details"
      badge={
        momentumData.gaining.length > 0 ? (
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {momentumData.gaining.length} gaining
          </span>
        ) : momentumData.declining.length > 0 ? (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {momentumData.declining.length} declining
          </span>
        ) : null
      }
    >
      {/* Channel list */}
      <div className="space-y-3">
        {momentumData.channels.map((channel, index) => {
          const Icon = CHANNEL_ICONS[channel.id] || Monitor;
          const TrendIcon = channel.trend === 'up' ? TrendingUp : 
                           channel.trend === 'down' ? TrendingDown : Minus;

          return (
            <motion.button
              key={channel.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onChannelClick?.(channel.id)}
              className="w-full group/channel"
            >
              <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                {/* Channel icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${channel.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: channel.color }} />
                </div>

                {/* Channel info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white/80 text-base font-medium group-hover/channel:text-white transition-colors">
                      {channel.name}
                    </span>
                    <span className="text-white font-semibold text-base">
                      {channel.roas.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">
                      {channel.campaignCount} campaigns • {formatCurrency(channel.totalSpend)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      channel.trend === 'up' ? 'text-green-400' :
                      channel.trend === 'down' ? 'text-red-400' : 'text-white/40'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      {channel.trendChange > 0 ? '+' : ''}{channel.trendChange}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
        {momentumData.gaining.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">🔥</span>
            <span className="text-white/70">
              <strong className="text-green-400">{momentumData.gaining[0].name}</strong> gaining momentum
            </span>
          </div>
        )}
        {momentumData.declining.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400">⚠️</span>
            <span className="text-white/70">
              <strong className="text-amber-400">{momentumData.declining[0].name}</strong> needs attention
            </span>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};
