import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LayerROASAnalytics: React.FC = () => {
  const { data, zoomState, setZoomLevel } = useDashboard();
  const { portfolio, campaigns, channels } = data;

  // CRITICAL: Only show at exact zoom range
  if (zoomState.level < 31 || zoomState.level > 45) {
    return null;
  }

  const opacity = zoomState.level < 35 
    ? (zoomState.level - 31) / 4
    : zoomState.level > 41
    ? Math.max(0, 1 - ((zoomState.level - 41) / 4))
    : 1;
  const blur = zoomState.level > 41 ? (zoomState.level - 41) / 4 * 6 : 
                zoomState.level < 33 ? (33 - zoomState.level) / 2 * 4 : 0;

  // Aggregate ROAS data over time from all campaigns
  const roasOverTime = campaigns[0].dailyMetrics.slice(-30).map((_, dayIndex) => {
    const date = campaigns[0].dailyMetrics.slice(-30)[dayIndex].date;
    let totalSpend = 0;
    let totalRevenue = 0;
    
    campaigns.forEach(campaign => {
      if (campaign.dailyMetrics[dayIndex]) {
        totalSpend += campaign.dailyMetrics[dayIndex].spend;
        totalRevenue += campaign.dailyMetrics[dayIndex].revenue;
      }
    });
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      roas: totalRevenue / totalSpend,
      spend: totalSpend,
      revenue: totalRevenue
    };
  });

  // Channel ROAS comparison
  const channelROAS = channels.map(channel => ({
    name: channel.name,
    roas: channel.totalRoas,
    spend: channel.totalSpend,
    revenue: channel.totalSpend * channel.totalRoas,
    color: channel.color
  }));

  // Top performing campaigns by ROAS
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5)
    .map(c => ({
      name: c.name.substring(0, 25) + (c.name.length > 25 ? '...' : ''),
      roas: c.roas,
      revenue: c.spent * c.roas
    }));

  return (
    <motion.div
      key="roas-analytics"
      className="absolute inset-0 overflow-auto p-12 pb-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: 'auto',
        zIndex: 20
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
          <h1 className="text-4xl font-bold text-white mb-2">ROAS performance analytics</h1>
          <p className="text-gray-400 text-lg">Comprehensive return on ad spend analysis across all campaigns and channels</p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-success" />
              <span className="text-gray-300 text-sm font-semibold">Average ROAS</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatNumber(portfolio.totalROAS, 2)}</p>
            <p className="text-success text-sm mt-1">+{formatNumber(portfolio.roasTrend, 1)}% vs last period</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <span className="text-gray-300 text-sm font-semibold">Total revenue</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatCurrency(portfolio.totalRevenue)}</p>
            <p className="text-gray-400 text-sm mt-1">From {formatCurrency(portfolio.totalSpend)} spend</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-warning" />
              <span className="text-gray-300 text-sm font-semibold">Best Performer</span>
            </div>
            <p className="text-2xl font-bold text-white">{topCampaigns[0]?.name}</p>
            <p className="text-warning text-sm mt-1">ROAS: {formatNumber(topCampaigns[0]?.roas || 0, 1)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-purple-400" />
              <span className="text-gray-300 text-sm font-semibold">Profit Margin</span>
            </div>
            <p className="text-4xl font-bold text-white">{formatNumber(((portfolio.totalRevenue - portfolio.totalSpend) / portfolio.totalRevenue) * 100, 1)}%</p>
            <p className="text-gray-400 text-sm mt-1">{formatCurrency(portfolio.totalRevenue - portfolio.totalSpend)} profit</p>
          </motion.div>
        </div>

        {/* ROAS Trend Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-white font-semibold text-xl mb-4">ROAS Trend - Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={roasOverTime}>
              <defs>
                <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(value: number) => formatNumber(value, 2)}
              />
              <Area type="monotone" dataKey="roas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#roasGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Channel ROAS Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-semibold text-xl mb-4">ROAS by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelROAS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                  formatter={(value: number) => formatNumber(value, 2)}
                />
                <Bar dataKey="roas" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Performing Campaigns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white font-semibold text-xl mb-4">Top 5 Campaigns by ROAS</h3>
            <div className="space-y-3">
              {topCampaigns.map((campaign, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{campaign.name}</span>
                    <span className="text-success font-bold text-lg">{formatNumber(campaign.roas, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Revenue: {formatCurrency(campaign.revenue)}</span>
                    <span className="px-2 py-1 bg-success/20 text-success rounded">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

