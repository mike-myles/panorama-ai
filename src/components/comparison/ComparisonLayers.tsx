import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Share2, Monitor, Mail, Video, AlertCircle } from 'lucide-react';
import { CampaignData } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const iconMap: Record<string, any> = { Search, Share2, Monitor, Mail, Video };

interface LayerProps {
  data: CampaignData;
  focusedCampaignId?: string;
  focusedChannelId?: string;
  onCampaignClick?: (id: string) => void;
  onChannelClick?: (id: string) => void;
}

export const ComparisonLayer0: React.FC<LayerProps> = ({ data }) => {
  const { portfolio } = data;
  
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
        {/* Total ROAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-success/20 to-success/5 backdrop-blur-lg border border-success/30 rounded-2xl p-6"
        >
          <h3 className="text-gray-300 font-semibold mb-2">Total ROAS</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-white">{formatNumber(portfolio.totalROAS, 1)}</span>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg font-semibold">{formatNumber(portfolio.roasTrend, 1)}%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">{formatCurrency(portfolio.totalRevenue)} revenue</p>
        </motion.div>

        {/* Budget Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${
            portfolio.budgetHealth >= 80 ? 'from-success/20 to-success/5' : 'from-warning/20 to-warning/5'
          } backdrop-blur-lg border ${
            portfolio.budgetHealth >= 80 ? 'border-success/30' : 'border-warning/30'
          } rounded-2xl p-6 relative`}
        >
          <h3 className="text-gray-300 font-semibold mb-2">Budget health</h3>
          <div className="flex items-center justify-between">
            <span className="text-5xl font-bold text-white">{portfolio.budgetHealth}%</span>
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={portfolio.budgetHealth >= 80 ? '#10B981' : '#F59E0B'}
                strokeWidth="8"
                strokeDasharray={`${portfolio.budgetHealth * 2.51} ${251}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mt-2">{formatCurrency(portfolio.totalSpend)} spent</p>
        </motion.div>

        {/* Active Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/30 rounded-2xl p-6"
        >
          <h3 className="text-gray-300 font-semibold mb-2">Active campaigns</h3>
          <span className="text-5xl font-bold text-white">{portfolio.activeCampaigns}</span>
          <p className="text-gray-400 text-sm mt-2">{portfolio.alerts.length} active alerts</p>
        </motion.div>
      </div>
    </div>
  );
};

export const ComparisonLayer1: React.FC<LayerProps> = ({ data, onChannelClick }) => {
  return (
    <div className="p-8">
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {data.channels.map((channel, index) => {
          const Icon = iconMap[channel.icon] || Monitor;
          const trendData = channel.trend.map((value, i) => ({ day: i, roas: value }));
          const isGrowing = channel.trend[channel.trend.length - 1] > channel.trend[0];
          
          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onChannelClick?.(channel.id)}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-white/30 transition-all"
              style={{ borderTopColor: channel.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${channel.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: channel.color }} />
                </div>
                <h3 className="text-white font-semibold text-lg">{channel.name}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Spend</span>
                  <span className="text-white font-semibold">{formatCurrency(channel.totalSpend)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">ROAS</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{formatNumber(channel.totalRoas, 1)}</span>
                    {isGrowing ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-critical" />
                    )}
                  </div>
                </div>
              </div>

              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line type="monotone" dataKey="roas" stroke={channel.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const ComparisonLayer2: React.FC<LayerProps> = ({ data, focusedChannelId, onCampaignClick }) => {
  const campaigns = focusedChannelId 
    ? data.campaigns.filter(c => c.channel === focusedChannelId)
    : data.campaigns;

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onCampaignClick?.(campaign.id)}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold text-base line-clamp-2">{campaign.name}</h3>
              {campaign.alerts.length > 0 && (
                <AlertCircle className="w-5 h-5 text-critical flex-shrink-0" />
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">ROAS</p>
                <p className="text-white font-bold text-lg">{formatNumber(campaign.roas, 1)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Spent</p>
                <p className="text-white font-bold text-lg">{formatCurrency(campaign.spent / 1000)}K</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Conv.</p>
                <p className="text-white font-bold text-lg">{campaign.conversions}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const ComparisonLayer3: React.FC<LayerProps> = ({ data, focusedCampaignId }) => {
  const campaign = data.campaigns.find(c => c.id === focusedCampaignId);
  
  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Select a campaign to view diagnostics</p>
      </div>
    );
  }

  const dailyData = campaign.dailyMetrics.slice(-7).map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spend: m.spend,
    roas: m.roas,
    conversions: m.conversions
  }));

  return (
    <div className="p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Campaign Header */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{campaign.name}</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Channel: <span className="text-white capitalize">{campaign.channel}</span></span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Budget: <span className="text-white">{formatCurrency(campaign.budget)}</span></span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Spent: <span className="text-white">{formatCurrency(campaign.spent)}</span></span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3">Daily spend (last 7 days)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3">ROAS Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="roas" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'ROAS', value: formatNumber(campaign.roas, 2), color: 'success' },
            { label: 'Conversions', value: campaign.conversions, color: 'primary' },
            { label: 'CTR', value: formatNumber(campaign.ctr, 2) + '%', color: 'warning' },
            { label: 'Budget used', value: Math.round((campaign.spent / campaign.budget) * 100) + '%', color: 'critical' }
          ].map((metric, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{metric.label}</p>
              <p className="text-white font-bold text-2xl">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ComparisonLayer4: React.FC<LayerProps> = ({ data, focusedCampaignId }) => {
  const campaign = data.campaigns.find(c => c.id === focusedCampaignId);
  
  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Select a campaign to view detailed analytics</p>
      </div>
    );
  }

  return (
    <div className="p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{campaign.name} - Granular Analytics</h2>
        
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Spend</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">ROAS</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Conv.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {campaign.dailyMetrics.slice(-14).reverse().map((metric, index) => (
                <tr key={index} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">
                    {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right">{formatCurrency(metric.spend)}</td>
                  <td className="px-4 py-3 text-sm text-white text-right">{formatCurrency(metric.revenue)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right">
                    <span className={metric.roas >= 4 ? 'text-success' : metric.roas >= 2 ? 'text-white' : 'text-critical'}>
                      {formatNumber(metric.roas, 2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right">{metric.conversions}</td>
                  <td className="px-4 py-3 text-sm text-white text-right">{formatNumber(metric.ctr, 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

