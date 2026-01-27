/* Audience Fatigue Detail Dashboard - Full page analytics view for audience overlap alerts */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, ChevronRight, Share2, Download, Check,
  Layers, Activity, AlertTriangle, Target, Clock, TrendingUp,
  DollarSign, Sparkles, Brain, Info
} from 'lucide-react';
import { Campaign, CategorizedAlert } from '../../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, ReferenceLine
} from 'recharts';

/* cspell:words ROAS roas Roas CPM Cpm idx FC bg */

interface AudienceFatigueDetailDashboardProps {
  alert: CategorizedAlert | null;
  campaigns: Campaign[];
  onBack: () => void;
}

// Generate frequency trend data for the last 30 days
const generateFrequencyTrendData = () => {
  const data = [];
  const baseFrequency = 3.5;
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate frequency increasing over time (overlap starting around day 10)
    let frequency = baseFrequency;
    if (i <= 20) {
      frequency = baseFrequency + (20 - i) * 0.25;
    }
    // Add some noise
    frequency += (Math.random() - 0.5) * 0.8;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      frequency: Math.max(1, frequency),
    });
  }
  return data;
};

// Heatmap Cell Component
const HeatmapCell: React.FC<{ 
  count: number; 
  channel: string; 
  funnel: string;
  campaigns?: Campaign[];
}> = ({ count, channel, funnel, campaigns = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIntensityStyle = () => {
    if (count === 0) {
      return {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
      };
    }
    if (count <= 2) {
      return {
        background: 'rgba(59, 130, 246, 0.25)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
      };
    }
    if (count <= 5) {
      return {
        background: 'rgba(245, 158, 11, 0.4)',
        border: '2px solid rgba(245, 158, 11, 0.6)',
      };
    }
    return {
      background: 'rgba(239, 68, 68, 0.5)',
      border: '2px solid rgba(239, 68, 68, 0.7)',
    };
  };
  
  const style = getIntensityStyle();
  
  return (
    <td className="p-2">
      <motion.div
        className="relative w-full h-16 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center"
        style={style}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {count > 0 ? (
          <>
            <span className="text-lg font-bold text-white">{count}</span>
            <span className="text-[9px] text-white/70">campaigns</span>
          </>
        ) : (
          <span className="text-white/40">—</span>
        )}
        
        {/* Hover Tooltip */}
        {isHovered && count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-3 rounded-xl shadow-2xl"
            style={{
              background: '#0c0c0e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="text-xs text-white/80 font-medium mb-2">
              {channel.toUpperCase()} × {funnel}
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/50">Campaigns:</span>
                <span className="text-white/90">{count}</span>
              </div>
            </div>
            {campaigns.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                {campaigns.slice(0, 2).map(c => (
                  <div key={c.id} className="text-[10px] text-white/50 truncate">• {c.name}</div>
                ))}
                {campaigns.length > 2 && (
                  <div className="text-[10px] text-white/40">+{campaigns.length - 2} more</div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </td>
  );
};

export const AudienceFatigueDetailDashboard: React.FC<AudienceFatigueDetailDashboardProps> = ({
  alert,
  campaigns,
  onBack
}) => {
  if (!alert) return null;
  
  // Get affected campaigns
  const affectedCampaigns = useMemo(() => 
    campaigns.filter(c => alert.affectedCampaignIds.includes(c.id)),
    [campaigns, alert.affectedCampaignIds]
  );

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const totalSpend = affectedCampaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalBudget = affectedCampaigns.reduce((sum, c) => sum + c.budget, 0);
    const avgRoas = affectedCampaigns.length > 0 
      ? affectedCampaigns.reduce((sum, c) => sum + c.roas, 0) / affectedCampaigns.length 
      : 0;
    const totalConversions = affectedCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgCtr = affectedCampaigns.length > 0 
      ? affectedCampaigns.reduce((sum, c) => sum + c.ctr, 0) / affectedCampaigns.length 
      : 0;
    
    return { totalSpend, totalBudget, avgRoas, totalConversions, avgCtr };
  }, [affectedCampaigns]);

  // Build heatmap data
  const heatmapData = useMemo(() => {
    const channels = [...new Set(affectedCampaigns.map(c => c.channel))];
    const funnels = ['awareness', 'consideration', 'conversion', 'retention'];
    
    const matrix: Record<string, Record<string, { count: number; campaigns: Campaign[] }>> = {};
    
    channels.forEach(channel => {
      matrix[channel] = {};
      funnels.forEach(funnel => {
        const matching = affectedCampaigns.filter(c => c.channel === channel && c.funnelStage === funnel);
        matrix[channel][funnel] = {
          count: matching.length,
          campaigns: matching,
        };
      });
    });
    
    return { channels, funnels, matrix };
  }, [affectedCampaigns]);

  // Frequency trend data
  const frequencyData = useMemo(() => generateFrequencyTrendData(), []);

  // ROAS comparison data
  const roasComparison = useMemo(() => ({
    beforeOverlap: 3.8,
    duringOverlap: metrics.avgRoas,
    decline: Math.round(((3.8 - metrics.avgRoas) / 3.8) * 100),
    revenueLost: 67000,
  }), [metrics.avgRoas]);

  // Estimated waste breakdown
  const wasteBreakdown = useMemo(() => ({
    duplicateImpressions: 12000,
    bidInflation: 7000,
    fatigueDropoff: 4000,
    total: 23000,
  }), []);

  // AI Solutions
  const solutions = [
    {
      id: 'ao-1',
      title: 'Implement Negative Audience Exclusions',
      description: 'Create audience exclusion lists between competing campaigns to eliminate self-competition. Use platform-native exclusion features to ensure ads from different campaigns don\'t target the same users.',
      roasImprove: '+0.3-0.5x',
      estSavings: '$15-25K',
      cpmReduction: '15-25%',
      effort: 'Low' as const,
      timeframe: '1-2 days',
      confidence: 92,
      priority: 'high' as const,
    },
    {
      id: 'ao-2',
      title: 'Consolidate Overlapping Campaigns',
      description: 'Merge campaigns targeting similar audiences into a single, larger campaign with multiple ad sets. This improves learning efficiency and allows the algorithm to optimize across a larger budget pool.',
      roasImprove: '+0.3-0.5x',
      learning: 'Better',
      complexity: 'Reduced',
      effort: 'Medium' as const,
      timeframe: '3-5 days',
      confidence: 87,
      priority: 'medium' as const,
    },
    {
      id: 'ao-3',
      title: 'Implement Sequential Messaging',
      description: 'Instead of competing for the same audience, restructure campaigns into a sequential funnel where each campaign targets users at different stages of their journey.',
      conversion: '+20-35%',
      journey: 'Guided',
      timeline: '1-2 weeks',
      effort: 'High' as const,
      timeframe: '1-2 weeks',
      confidence: 78,
      priority: 'standard' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen text-white relative"
      style={{ paddingTop: '73px' }}
    >
      {/* Metallic dark background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0e] via-[#08080c] to-[#0c0c10]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_100%_at_50%_-20%,_rgba(120,120,140,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_80%,_rgba(100,100,120,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_60%,_rgba(90,90,110,0.04)_0%,_transparent_40%)]" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative p-6 max-w-[1600px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <button 
            onClick={onBack}
            className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50">Overview</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50">Alerts</span>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/90 font-medium">Audience Fatigue</span>
        </nav>

        {/* ROW 1: Header Card - KEEP AS IS */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 shadow-xl mb-4"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Icon + Title Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <Users className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {alert.title || 'Retargeting audience overlap'}
                </h1>
                <div className="flex items-center gap-3 text-gray-400">
                  <span 
                    className="px-3 py-1 rounded-md text-xs font-semibold uppercase"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#FCA5A5',
                    }}
                  >
                    {alert.severity} Severity
                  </span>
                  <span>•</span>
                  <span>{affectedCampaigns.length} campaigns affected</span>
                  <span>•</span>
                  <span>${Math.round(metrics.totalSpend / 1000)}K at risk</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Share2 className="w-4 h-4" />
                Share with Owners
              </button>
              <button 
                className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button 
                className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark Resolved
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Campaigns</div>
              <div className="text-2xl font-bold text-white">{affectedCampaigns.length}</div>
              <div className="text-xs text-gray-500">affected</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Spend</div>
              <div className="text-2xl font-bold text-white">${Math.round(metrics.totalSpend / 1000)}K</div>
              <div className="text-xs text-gray-500">of ${Math.round(metrics.totalBudget / 1000)}K budget</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg ROAS</div>
              <div className="text-2xl font-bold text-white">{metrics.avgRoas.toFixed(1)}x</div>
              <div className="text-xs text-orange-400">Below target</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Conversions</div>
              <div className="text-2xl font-bold text-white">{metrics.totalConversions.toLocaleString()}</div>
              <div className="text-xs text-gray-500">total</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg CTR</div>
              <div className="text-2xl font-bold text-white">{(metrics.avgCtr * 100).toFixed(2)}%</div>
              <div className="text-xs text-green-400">Strong</div>
            </div>
          </div>
        </motion.div>

        {/* ROW 2: Affected Campaigns Detail (LEFT 60%) + Estimated Waste Breakdown (RIGHT 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-4">
          {/* LEFT: Affected Campaigns Detail (6 columns = 60% - matches rows 3,4,5 left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-6 rounded-2xl p-6 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold text-lg">Affected Campaigns Detail</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium py-2.5 px-2">CAMPAIGN</th>
                    <th className="text-center text-gray-400 font-medium py-2.5 px-2">CHANNEL</th>
                    <th className="text-right text-gray-400 font-medium py-2.5 px-2">SPEND</th>
                    <th className="text-right text-gray-400 font-medium py-2.5 px-2">ROAS</th>
                    <th className="text-center text-gray-400 font-medium py-2.5 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {affectedCampaigns.map((campaign, index) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-2">
                        <div className="font-medium text-white">{campaign.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Overlap with coffee subscribers
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span 
                          className="px-2.5 py-1 rounded text-xs uppercase font-semibold"
                          style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#C4B5FD' }}
                        >
                          {campaign.channel}
                        </span>
                      </td>
                      <td className="text-right text-white font-semibold py-3 px-2">
                        ${Math.round(campaign.spent / 1000)}K
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className={`font-semibold ${
                          campaign.roas >= 3 ? 'text-green-400' : 
                          campaign.roas >= 2 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {campaign.roas.toFixed(1)}x
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span 
                          className="px-2 py-1 rounded-md text-xs font-semibold"
                          style={{
                            background: campaign.status === 'at_risk' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            border: `1px solid ${campaign.status === 'at_risk' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                            color: campaign.status === 'at_risk' ? '#FDBA74' : '#86EFAC',
                          }}
                        >
                          {campaign.status === 'at_risk' ? 'at_risk' : campaign.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-400">{affectedCampaigns.length} campaigns total</span>
              <span className="text-white font-semibold">${Math.round(metrics.totalSpend / 1000)}K total spend</span>
            </div>
          </motion.div>

          {/* RIGHT: Estimated Waste Breakdown (4 columns = 40% - matches Recommended Solutions width) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 rounded-2xl p-6 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Estimated Waste Breakdown
              </h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Donut chart visualization */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  {/* Duplicate impressions - 52% */}
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="12" 
                    strokeDasharray="130.88" strokeDashoffset="0"
                  />
                  {/* Bid inflation - 30% */}
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="12" 
                    strokeDasharray="75.4" strokeDashoffset="-130.88"
                  />
                  {/* Fatigue dropoff - 18% */}
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="12" 
                    strokeDasharray="45.2" strokeDashoffset="-206.28"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">${Math.round(wasteBreakdown.total / 1000)}K</div>
                  <div className="text-[10px] text-gray-400">estimated waste</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-400">Duplicate impressions</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  ${Math.round(wasteBreakdown.duplicateImpressions / 1000)}K (52%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-400">Bid inflation</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  ${Math.round(wasteBreakdown.bidInflation / 1000)}K (30%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-400">Fatigue-induced drop-off</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  ${Math.round(wasteBreakdown.fatigueDropoff / 1000)}K (18%)
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ROWS 3-5: Left Widgets (60%) + Right AI Solutions (40%, spans all 3 rows) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* LEFT COLUMN: 3 stacked widgets (6 columns = 60%) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* ROW 3 LEFT: Frequency Trend */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6 shadow-xl transition-colors hover:border-primary/50"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Frequency Trend (Last 30 Days)</h3>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={frequencyData}>
                  <defs>
                    <linearGradient id="frequencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}x`, 'Frequency']}
                  />
                  <ReferenceLine 
                    y={5.0} 
                    stroke="#10B981" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Healthy (5x)', fill: '#10B981', fontSize: 10, position: 'right' }} 
                  />
                  <Area type="monotone" dataKey="frequency" stroke="#F59E0B" fill="url(#frequencyGradient)" strokeWidth={2} />
                  <Line type="monotone" dataKey="frequency" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <div className="text-gray-400">Current Avg Frequency</div>
                  <div className="text-2xl font-bold text-orange-400">8.2x / week</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">Healthy Range</div>
                  <div className="text-lg font-semibold text-green-400">3-5x / week</div>
                </div>
              </div>
            </motion.div>

            {/* ROW 4 LEFT: Audience Collision Heatmap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6 shadow-xl transition-colors hover:border-primary/50"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Audience Collision Heatmap
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <p className="text-sm text-gray-400 mb-4">
                This heatmap shows where your campaigns are competing for the same audience segments. 
                Cells with higher intensity indicate more campaigns targeting the same channel × funnel combination.
              </p>

              {/* Heatmap Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium p-2">CHANNEL</th>
                      {heatmapData.funnels.map(funnel => (
                        <th key={funnel} className="text-center text-gray-400 font-medium p-2 uppercase">
                          {funnel}
                        </th>
                      ))}
                      <th className="text-center text-gray-400 font-medium p-2">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.channels.map((channel) => {
                      const rowTotal = heatmapData.funnels.reduce(
                        (sum, f) => sum + heatmapData.matrix[channel][f].count, 0
                      );
                      return (
                        <tr key={channel} className="border-b border-white/5">
                          <td className="p-2 text-sm text-white/80 font-medium uppercase">{channel}</td>
                          {heatmapData.funnels.map((funnel) => {
                            const cell = heatmapData.matrix[channel][funnel];
                            return (
                              <HeatmapCell
                                key={funnel}
                                count={cell.count}
                                channel={channel}
                                funnel={funnel}
                                campaigns={cell.campaigns}
                              />
                            );
                          })}
                          <td className="p-2 text-center">
                            <span 
                              className="px-3 py-1 rounded font-semibold"
                              style={{
                                background: rowTotal > 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: rowTotal > 2 ? '#FDBA74' : '#fff',
                              }}
                            >
                              {rowTotal}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs flex-wrap">
                <span className="text-gray-400">Overlap intensity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(255, 255, 255, 0.02)' }} />
                  <span className="text-gray-500">No overlap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.3)' }} />
                  <span className="text-blue-300">Low (1-2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(245, 158, 11, 0.4)' }} />
                  <span className="text-orange-300">Medium (3-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.5)' }} />
                  <span className="text-red-300">High (6+)</span>
                </div>
              </div>
            </motion.div>

            {/* ROW 5 LEFT: ROAS Impact Analysis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6 shadow-xl transition-colors hover:border-primary/50 flex-1"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  ROAS Impact Analysis
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Before Overlap (Day 1-10)</span>
                    <span className="text-lg font-bold text-green-400">{roasComparison.beforeOverlap}x</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: '76%',
                        background: 'linear-gradient(to right, #10B981, #34D399)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">During Overlap (Day 11-30)</span>
                    <span className="text-lg font-bold text-orange-400">{roasComparison.duringOverlap.toFixed(1)}x</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(roasComparison.duringOverlap / 5) * 100}%`,
                        background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">ROAS Decline</div>
                      <div className="text-2xl font-bold text-red-400">-{roasComparison.decline}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Revenue Lost</div>
                      <div className="text-2xl font-bold text-red-400">~${Math.round(roasComparison.revenueLost / 1000)}K</div>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="mt-4 p-3 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300">
                    ROAS dropped by {roasComparison.decline}% once all three campaigns began competing for the same audience segment. 
                    This indicates severe audience fatigue and internal bid competition.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: AI Recommended Solutions (4 columns = 40%) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 rounded-2xl p-5 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundImage: `
                linear-gradient(rgba(18,18,20,0.85), rgba(18,18,20,0.85)),
                linear-gradient(135deg, 
                  rgba(59,130,246,0.15) 0%,
                  rgba(147,51,234,0.15) 50%,
                  rgba(236,72,153,0.15) 100%
                )
              `,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            {/* Header with AI branding */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.15) 100%)',
                    border: '1px solid rgba(59,130,246,0.3)',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 
                    className="font-semibold text-base"
                    style={{
                      background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F9A8D4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    AI Recommendations
                  </h3>
                  <p className="text-xs text-gray-400">
                    Powered by Campaign Manager Agent
                  </p>
                </div>
              </div>

              <div 
                className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase"
                style={{
                  background: 'linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.15) 100%)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#93C5FD',
                }}
              >
                {solutions.length} options
              </div>
            </div>

            {/* Solutions List */}
            <div className="space-y-4">
              {/* Solution 1: High Priority */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl p-5 transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(30,30,35,0.6)',
                  border: '1px solid rgba(59,130,246,0.15)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(59,130,246,0.15)',
                      border: '1px solid rgba(59,130,246,0.3)',
                    }}
                  >
                    <span className="text-base font-bold text-blue-400">1</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-white font-semibold text-base leading-snug">
                        {solutions[0].title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 text-[10px] font-semibold">
                          High
                        </span>
                        <span className="text-[10px] text-gray-400">{solutions[0].confidence}%</span>
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-300 mb-3 leading-relaxed">
                      {solutions[0].description}
                    </p>

                    {/* Impact Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-[10px] text-gray-400">ROAS</span>
                        </div>
                        <div className="text-sm font-bold text-green-400">{solutions[0].roasImprove}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="w-3 h-3 text-green-400" />
                          <span className="text-[10px] text-gray-400">Savings</span>
                        </div>
                        <div className="text-sm font-bold text-green-400">{solutions[0].estSavings}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-gray-400">CPM</span>
                        </div>
                        <div className="text-sm font-bold text-blue-400">{solutions[0].cpmReduction}</div>
                      </div>
                    </div>

                    {/* Implementation Details */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Effort:</span>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 font-semibold">
                          {solutions[0].effort}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">{solutions[0].timeframe}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Impact:</span>
                        <span className="text-white font-semibold">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Solution 2: Medium Priority */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl p-5 transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(30,30,35,0.6)',
                  border: '1px solid rgba(147,51,234,0.15)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(147,51,234,0.15)',
                      border: '1px solid rgba(147,51,234,0.3)',
                    }}
                  >
                    <span className="text-base font-bold text-purple-400">2</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-white font-semibold text-base leading-snug">
                        {solutions[1].title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-semibold">
                          Medium
                        </span>
                        <span className="text-[10px] text-gray-400">{solutions[1].confidence}%</span>
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-300 mb-3 leading-relaxed">
                      {solutions[1].description}
                    </p>

                    {/* Impact Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-[10px] text-gray-400">ROAS</span>
                        </div>
                        <div className="text-sm font-bold text-green-400">{solutions[1].roasImprove}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Brain className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] text-gray-400">Learning</span>
                        </div>
                        <div className="text-sm font-bold text-purple-400">{solutions[1].learning}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-gray-400">Complexity</span>
                        </div>
                        <div className="text-sm font-bold text-blue-400">{solutions[1].complexity}</div>
                      </div>
                    </div>

                    {/* Implementation Details */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Effort:</span>
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold">
                          {solutions[1].effort}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">{solutions[1].timeframe}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Impact:</span>
                        <span className="text-white font-semibold">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Solution 3: Standard Priority */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl p-5 transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(30,30,35,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <span className="text-base font-bold text-gray-400">3</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-white font-semibold text-base leading-snug">
                        {solutions[2].title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                          Medium
                        </span>
                        <span className="text-[10px] text-gray-400">{solutions[2].confidence}%</span>
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-300 mb-3 leading-relaxed">
                      {solutions[2].description}
                    </p>

                    {/* Impact Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-[10px] text-gray-400">Conversion</span>
                        </div>
                        <div className="text-sm font-bold text-green-400">{solutions[2].conversion}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-gray-400">Journey</span>
                        </div>
                        <div className="text-sm font-bold text-blue-400">{solutions[2].journey}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <span className="text-[10px] text-gray-400">Timeline</span>
                        </div>
                        <div className="text-sm font-bold text-orange-400">{solutions[2].timeline}</div>
                      </div>
                    </div>

                    {/* Implementation Details */}
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Effort:</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">
                          {solutions[2].effort}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">{solutions[2].timeframe}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Impact:</span>
                        <span className="text-white font-semibold">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Share with Stakeholders Button - AT BOTTOM with glow animation */}
            <motion.button 
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(147,51,234,0.25) 100%)',
                border: '1px solid rgba(59,130,246,0.4)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.3) 100%)',
                  filter: 'blur(8px)',
                }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Share2 className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Share with Campaign Owners</span>
            </motion.button>

            {/* Info callout at bottom */}
            <div 
              className="mt-3 p-2.5 rounded-lg"
              style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.15)',
              }}
            >
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-gray-400 leading-relaxed">
                  Campaign owners will receive detailed implementation steps and access to apply these solutions directly in their campaigns.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudienceFatigueDetailDashboard;
