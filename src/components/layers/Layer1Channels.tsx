import React from 'react';
import { motion } from 'framer-motion';
import { Search, Share2, Monitor, Mail, Video, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const iconMap: Record<string, any> = {
  Search,
  Share2,
  Monitor,
  Mail,
  Video
};

export const Layer1Channels: React.FC = () => {
  const { data, zoomState, setZoomLevel, setFocusedChannel } = useDashboard();
  const { channels } = data;

  // This layer is now merged with Layer 0, so it's hidden
  const isVisible = false; // zoomState.level >= 20 && zoomState.level <= 50;
  
  // Calculate opacity - fade in from 20-30%, stay visible 30-40%, fade out 40-50%
  let opacity = 1;
  if (zoomState.level < 30) {
    opacity = (zoomState.level - 20) / 10;
  } else if (zoomState.level > 40) {
    opacity = Math.max(0, 1 - ((zoomState.level - 40) / 10));
  }

  // Scale effect
  const scale = 0.8 + (Math.min(zoomState.level, 30) - 20) / 10 * 0.2;
  
  // Only blur when moving away from this layer (after 40%)
  const blur = zoomState.level > 40 ? (zoomState.level - 40) / 10 * 8 : 
                zoomState.level < 25 ? (25 - zoomState.level) / 5 * 4 : 0;

  const handleChannelClick = (channelId: string) => {
    setFocusedChannel(channelId);
    setZoomLevel(50);
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-12"
      style={{
        opacity,
        scale,
        filter: `blur(${blur}px)`,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-7xl">
        {channels.map((channel, index) => {
          const Icon = iconMap[channel.icon] || Monitor;
          const trendData = channel.trend.map((value, i) => ({ day: i, roas: value }));
          const trendDirection = channel.trend[channel.trend.length - 1] > channel.trend[0];

          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => handleChannelClick(channel.id)}
              className="relative cursor-pointer group"
            >
              <div 
                className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden hover:border-white/30 transition-all"
                style={{ borderTopColor: channel.color }}
              >
                {/* Colored top border accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: channel.color }}
                />

                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${channel.color}20` }}
                >
                  <Icon 
                    className="w-7 h-7"
                    style={{ color: channel.color }}
                  />
                </div>

                {/* Channel name */}
                <h3 className="text-white font-semibold text-lg mb-3">
                  {channel.name}
                </h3>

                {/* Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Spend</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(channel.totalSpend)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">ROAS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {formatNumber(channel.totalRoas, 1)}
                      </span>
                      {trendDirection ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-critical" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Campaigns</span>
                    <span className="text-white font-semibold">
                      {channel.campaignCount}
                    </span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-12 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <Line 
                        type="monotone" 
                        dataKey="roas" 
                        stroke={channel.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Hover glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none rounded-2xl"
                  style={{ backgroundColor: channel.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

