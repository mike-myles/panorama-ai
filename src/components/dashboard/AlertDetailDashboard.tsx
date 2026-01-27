/* Alert Detail Dashboard - Full page analytics view for alerts with metallic dark UI */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Clock, DollarSign, TrendingDown, Share2, 
  Target, BarChart2,
  Layers, Activity, PieChart, GitBranch, ChevronRight,
  Sparkles, Info
} from 'lucide-react';
import { Campaign, CategorizedAlert, AlertCategory } from '../../types';
import { ALERT_CATEGORY_INFO } from '../../utils/alertCalculations';

/* cspell:words ROAS roas Roas CPM Cpm idx FC bg Incrementality misallocated underinvested ao */

interface AlertDetailDashboardProps {
  alert: CategorizedAlert | null;
  campaigns: Campaign[];
  onBack: () => void;
}

// AI Solutions for each alert category
export const AI_SOLUTIONS: Record<AlertCategory, Array<{
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
  timeframe: string;
  confidence: number;
}>> = {
  audience_overlap: [
    {
      id: 'ao-1',
      title: 'Implement Negative Audience Exclusions',
      description: 'Create audience exclusion lists between competing campaigns to eliminate self-competition. Use platform-native exclusion features to ensure ads from different campaigns don\'t target the same users.',
      expectedImpact: 'Reduce CPM by 15-25% and improve overall portfolio efficiency by eliminating bid competition between your own campaigns.',
      effort: 'Low',
      timeframe: '1-2 days',
      confidence: 92
    },
    {
      id: 'ao-2',
      title: 'Consolidate Overlapping Campaigns',
      description: 'Merge campaigns targeting similar audiences into a single, larger campaign with multiple ad sets. This improves learning efficiency and allows the algorithm to optimize across a larger budget pool.',
      expectedImpact: 'Improve ROAS by 0.3-0.5x through better algorithm learning and reduced audience fragmentation.',
      effort: 'Medium',
      timeframe: '3-5 days',
      confidence: 87
    },
    {
      id: 'ao-3',
      title: 'Implement Sequential Messaging',
      description: 'Instead of competing for the same audience, restructure campaigns into a sequential funnel where each campaign targets users at different stages of their journey.',
      expectedImpact: 'Increase conversion rates by 20-35% through coordinated messaging that guides users through the purchase journey.',
      effort: 'High',
      timeframe: '1-2 weeks',
      confidence: 78
    }
  ],
  lifecycle_stall: [
    {
      id: 'ls-1',
      title: 'Priority Resource Reallocation',
      description: 'Identify and reassign team members from lower-priority projects to unblock stalled campaigns. Focus on removing specific blockers like creative approval, technical setup, or stakeholder sign-off.',
      expectedImpact: 'Accelerate campaign launch by 40-60%, capturing time-sensitive revenue opportunities.',
      effort: 'Medium',
      timeframe: '2-3 days',
      confidence: 89
    },
    {
      id: 'ls-2',
      title: 'Streamline Approval Workflow',
      description: 'Implement parallel approval processes and set up automated reminders for pending approvals. Create fast-track procedures for campaigns with imminent deadlines.',
      expectedImpact: 'Reduce average approval time by 50%, preventing future launch delays.',
      effort: 'Medium',
      timeframe: '1 week',
      confidence: 84
    },
    {
      id: 'ls-3',
      title: 'Deploy Campaign Templates',
      description: 'Use pre-approved campaign templates for common campaign types to skip redundant approval cycles. Templates can include pre-approved creative frameworks and targeting parameters.',
      expectedImpact: 'Cut setup time by 60% for future campaigns while maintaining quality standards.',
      effort: 'High',
      timeframe: '2-3 weeks',
      confidence: 76
    }
  ],
  budget_pacing: [
    {
      id: 'bp-1',
      title: 'Implement Dynamic Budget Caps',
      description: 'Set up automated daily budget caps that adjust based on performance metrics. Campaigns exceeding efficiency thresholds get more budget, while underperformers are automatically throttled.',
      expectedImpact: 'Prevent budget overruns while maximizing spend on high-performing campaigns, improving overall ROAS by 0.2-0.4x.',
      effort: 'Low',
      timeframe: '1 day',
      confidence: 94
    },
    {
      id: 'bp-2',
      title: 'Activate Budget Reallocation Protocol',
      description: 'Pause or reduce budgets for campaigns approaching exhaustion and redistribute to campaigns with headroom and strong performance. Prioritize based on ROAS and strategic importance.',
      expectedImpact: 'Extend campaign runtime by 2-3 weeks while maintaining or improving overall portfolio performance.',
      effort: 'Low',
      timeframe: 'Immediate',
      confidence: 91
    },
    {
      id: 'bp-3',
      title: 'Request Strategic Budget Increase',
      description: 'For high-performing campaigns nearing budget limits, prepare a data-backed case for budget increase. Include projected revenue and ROAS to justify additional investment.',
      expectedImpact: 'Capture additional $25-50K revenue opportunity from proven high-performers.',
      effort: 'Medium',
      timeframe: '3-5 days',
      confidence: 82
    }
  ],
  roas_misalignment: [
    {
      id: 'rm-1',
      title: 'Audience Targeting Refinement',
      description: 'Analyze audience performance data and exclude underperforming segments. Focus budget on audiences demonstrating strong engagement and conversion signals.',
      expectedImpact: 'Improve ROAS by 0.5-1.0x by concentrating spend on proven audience segments.',
      effort: 'Low',
      timeframe: '2-3 days',
      confidence: 88
    },
    {
      id: 'rm-2',
      title: 'Creative Performance Optimization',
      description: 'Rotate in fresh creative assets and pause underperforming ad variations. A/B test new messaging angles that better resonate with the funnel stage objectives.',
      expectedImpact: 'Lift CTR by 25-40% and improve conversion rates through better creative-audience fit.',
      effort: 'Medium',
      timeframe: '1 week',
      confidence: 85
    },
    {
      id: 'rm-3',
      title: 'Bidding Strategy Adjustment',
      description: 'Switch from aggressive bidding to value-based or ROAS-target bidding. Let the algorithm optimize for profitability rather than just conversions.',
      expectedImpact: 'Align campaign performance with business objectives, potentially improving ROAS by 0.3-0.6x.',
      effort: 'Low',
      timeframe: '1-2 days',
      confidence: 83
    }
  ],
  attribution_leak: [
    {
      id: 'al-1',
      title: 'Implement Incrementality Testing',
      description: 'Set up holdout tests to measure the true incremental value of each channel. This reveals which channels are actually driving new conversions vs. claiming credit for organic traffic.',
      expectedImpact: 'Identify 15-30% of budget that may be misallocated based on flawed attribution.',
      effort: 'High',
      timeframe: '2-4 weeks',
      confidence: 79
    },
    {
      id: 'al-2',
      title: 'Review Attribution Model',
      description: 'Evaluate current attribution model (last-click, linear, data-driven) and consider switching to a model that better reflects the customer journey for your business.',
      expectedImpact: 'More accurate budget allocation decisions, potentially improving overall efficiency by 10-20%.',
      effort: 'Medium',
      timeframe: '1-2 weeks',
      confidence: 81
    },
    {
      id: 'al-3',
      title: 'Cross-Channel Budget Rebalancing',
      description: 'Based on attribution analysis, shift budget from over-credited channels to under-credited ones. Start with small percentage shifts and monitor impact.',
      expectedImpact: 'Optimize channel mix for true performance, capturing missed opportunities in underinvested channels.',
      effort: 'Medium',
      timeframe: '1-2 weeks',
      confidence: 75
    }
  ]
};

// Category-specific icons
const getCategoryIcon = (category: AlertCategory) => {
  const icons: Record<AlertCategory, React.FC<{ className?: string }>> = {
    audience_overlap: Users,
    lifecycle_stall: Clock,
    budget_pacing: DollarSign,
    roas_misalignment: TrendingDown,
    attribution_leak: Share2
  };
  return icons[category];
};

// Interactive Heatmap Component for Audience Overlap
const AudienceOverlapHeatmap: React.FC<{ campaigns: Campaign[] }> = ({ campaigns }) => {
  const [hoveredCell, setHoveredCell] = useState<{ channel: string; funnel: string } | null>(null);
  
  // Build heatmap data matrix
  const heatmapData = useMemo(() => {
    const channels = [...new Set(campaigns.map(c => c.channel))];
    const funnels = ['awareness', 'consideration', 'conversion', 'retention'];
    
    const matrix: Record<string, Record<string, { count: number; campaigns: Campaign[]; totalSpend: number; avgCtr: number }>> = {};
    
    channels.forEach(channel => {
      matrix[channel] = {};
      funnels.forEach(funnel => {
        const matching = campaigns.filter(c => c.channel === channel && c.funnelStage === funnel);
        matrix[channel][funnel] = {
          count: matching.length,
          campaigns: matching,
          totalSpend: matching.reduce((sum, c) => sum + c.spent, 0),
          avgCtr: matching.length > 0 ? matching.reduce((sum, c) => sum + c.ctr, 0) / matching.length : 0
        };
      });
    });
    
    return { channels, funnels, matrix };
  }, [campaigns]);
  
  const getHeatIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 0.2;
    if (count === 2) return 0.5;
    return Math.min(0.8, 0.3 + count * 0.15);
  };
  
  // Map count tiers to app-aligned colors: Low=Blue (1-2), Medium=Orange (3-5), High=Red (6+)
  const getTierColors = (count: number, intensity: number) => {
    // Tailwind palette alignments:
    // Blue:   #3B82F6 (59,130,246)
    // Orange: #F59E0B (245,158,11)
    // Red:    #EF4444 (239,68,68)
    if (count <= 0) {
      return {
        bg1: 'rgba(255,255,255,0.02)',
        bg2: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        glow: 'none'
      };
    }
    if (count <= 2) {
      // Low (1-2) -> Light Blue
      const bg1 = `rgba(59, 130, 246, ${Math.max(0.15, intensity)})`;
      const bg2 = `rgba(59, 130, 246, ${Math.max(0.10, intensity * 0.6)})`;
      const border = `1px solid rgba(59, 130, 246, ${0.18 + intensity * 0.25})`;
      const glow = `0 0 20px rgba(59, 130, 246, 0.28)`;
      return { bg1, bg2, border, glow };
    }
    if (count <= 5) {
      // Medium (3-5) -> Orange
      const bg1 = `rgba(245, 158, 11, ${Math.max(0.22, intensity)})`;
      const bg2 = `rgba(245, 158, 11, ${Math.max(0.14, intensity * 0.7)})`;
      const border = `1px solid rgba(245, 158, 11, ${0.22 + intensity * 0.3})`;
      const glow = `0 0 20px rgba(245, 158, 11, 0.28)`;
      return { bg1, bg2, border, glow };
    }
    // High (6+) -> Red
    const bg1 = `rgba(239, 68, 68, ${Math.max(0.28, intensity)})`;
    const bg2 = `rgba(239, 68, 68, ${Math.max(0.18, intensity * 0.75)})`;
    const border = `1px solid rgba(239, 68, 68, ${0.25 + intensity * 0.35})`;
    const glow = `0 0 20px rgba(239, 68, 68, 0.30)`;
    return { bg1, bg2, border, glow };
  };
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Channel</th>
              {heatmapData.funnels.map(funnel => (
                <th key={funnel} className="text-center text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">
                  {funnel}
                </th>
              ))}
              <th className="text-center text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.channels.map((channel) => {
              const rowTotal = heatmapData.funnels.reduce((sum, f) => sum + heatmapData.matrix[channel][f].count, 0);
              return (
                <tr key={channel} className="border-t border-white/[0.04]">
                  <td className="p-3 text-sm text-white/80 font-medium uppercase">{channel}</td>
                  {heatmapData.funnels.map((funnel) => {
                    const cell = heatmapData.matrix[channel][funnel];
                    const intensity = getHeatIntensity(cell.count);
                    const isHovered = hoveredCell?.channel === channel && hoveredCell?.funnel === funnel;
                    const tier = getTierColors(cell.count, intensity);
                    
                    return (
                      <td key={funnel} className="p-2">
                        <motion.div
                          className="relative w-full h-16 rounded-lg cursor-pointer transition-all"
                          style={{
                            background: `linear-gradient(135deg, ${tier.bg1}, ${tier.bg2})`,
                            border: tier.border,
                            boxShadow: isHovered && cell.count > 0 ? (tier.glow as string) : 'none'
                          }}
                          onMouseEnter={() => setHoveredCell({ channel, funnel })}
                          onMouseLeave={() => setHoveredCell(null)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {cell.count > 0 ? (
                              <>
                                <span className="text-lg font-bold text-white">
                                  {cell.count}
                                </span>
                                <span className="text-[10px] text-white">campaigns</span>
                              </>
                            ) : (
                              <span className="text-white">—</span>
                            )}
                          </div>
                          
                          {/* Hover tooltip */}
                          {isHovered && cell.count > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-3 bg-[#0c0c0e] border border-white/[0.1] rounded-xl shadow-2xl"
                            >
                              <div className="text-xs text-white/80 font-medium mb-2">
                                {channel.toUpperCase()} × {funnel}
                              </div>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-white/50">Campaigns:</span>
                                  <span className="text-white/90">{cell.count}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/50">Total Spend:</span>
                                  <span className="text-white/90">${Math.round(cell.totalSpend / 1000)}K</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/50">Avg CTR:</span>
                                  <span className="text-white/90">{(cell.avgCtr * 100).toFixed(2)}%</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                                {cell.campaigns.slice(0, 2).map(c => (
                                  <div key={c.id} className="text-[10px] text-white/50 truncate">• {c.name}</div>
                                ))}
                                {cell.campaigns.length > 2 && (
                                  <div className="text-[10px] text-white/40">+{cell.campaigns.length - 2} more</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center">
                    <span className="text-sm font-bold text-white/80">{rowTotal}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-white/50 pt-2">
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/[0.02] border border-white/[0.04]" />
          No overlap
        </span>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.25)' }} />
          Low (1–2)
        </span>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(245, 158, 11, 0.5)' }} />
          Medium (3–5)
        </span>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.8)' }} />
          High (6+)
        </span>
      </div>
    </div>
  );
};

export const AlertDetailDashboard: React.FC<AlertDetailDashboardProps> = ({
  alert,
  campaigns,
  onBack
}) => {
  if (!alert) return null;

  const categoryInfo = ALERT_CATEGORY_INFO[alert.category];
  const CategoryIcon = getCategoryIcon(alert.category);
  const solutions = AI_SOLUTIONS[alert.category];
  
  // Get affected campaigns data
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
    const channels = [...new Set(affectedCampaigns.map(c => c.channel))];
    // Calculate impressions and clicks from daily metrics
    const totalImpressions = affectedCampaigns.reduce((sum, c) => 
      sum + c.dailyMetrics.reduce((dSum, d) => dSum + (d.impressions || 0), 0), 0);
    const totalClicks = affectedCampaigns.reduce((sum, c) => 
      sum + c.dailyMetrics.reduce((dSum, d) => dSum + (d.clicks || 0), 0), 0);
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    
    return { totalSpend, totalBudget, avgRoas, totalConversions, avgCtr, channels, totalImpressions, totalClicks, avgCpc, avgCpm };
  }, [affectedCampaigns]);

  // Lifecycle distribution
  const lifecycleDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    affectedCampaigns.forEach(c => {
      distribution[c.lifecycleStage] = (distribution[c.lifecycleStage] || 0) + 1;
    });
    return distribution;
  }, [affectedCampaigns]);

  // Budget utilization data
  const budgetUtilization = useMemo(() => {
    return affectedCampaigns.map(c => ({
      id: c.id,
      name: c.name,
      spent: c.spent,
      budget: c.budget,
      utilization: Math.round((c.spent / c.budget) * 100),
      roas: c.roas,
      channel: c.channel,
      status: c.status
    })).sort((a, b) => b.utilization - a.utilization);
  }, [affectedCampaigns]);

  // Channel performance
  const channelPerformance = useMemo(() => {
    const byChannel: Record<string, { spend: number; roas: number; count: number; conversions: number }> = {};
    affectedCampaigns.forEach(c => {
      if (!byChannel[c.channel]) {
        byChannel[c.channel] = { spend: 0, roas: 0, count: 0, conversions: 0 };
      }
      byChannel[c.channel].spend += c.spent;
      byChannel[c.channel].roas += c.roas;
      byChannel[c.channel].count++;
      byChannel[c.channel].conversions += c.conversions;
    });
    Object.keys(byChannel).forEach(ch => {
      byChannel[ch].roas = byChannel[ch].roas / byChannel[ch].count;
    });
    return byChannel;
  }, [affectedCampaigns]);

  const severityColors = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' }
  };

  const severityStyle = severityColors[alert.severity];

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
        {/* Metallic sheen layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_100%_at_50%_-20%,_rgba(120,120,140,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_80%,_rgba(100,100,120,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_60%,_rgba(90,90,110,0.04)_0%,_transparent_40%)]" />
        {/* Subtle grid pattern */}
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
          <span className="text-white/90 font-medium">{categoryInfo.label}</span>
        </nav>

        {/* Page Title Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ 
                backgroundColor: `${categoryInfo.color}15`, 
                border: `1px solid ${categoryInfo.color}30`,
                boxShadow: `0 0 30px ${categoryInfo.color}10`,
                color: categoryInfo.color
              }}
            >
              <CategoryIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/95 mb-1">{alert.title}</h1>
              <p className="text-white/60 text-base">{alert.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${severityStyle.bg} ${severityStyle.border} ${severityStyle.text} border`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                </span>
                <span className="text-white/40 text-sm">
                  {affectedCampaigns.length} campaigns affected
                </span>
                <span className="text-white/40 text-sm">•</span>
                <span className="text-white/40 text-sm">
                  ${Math.round(metrics.totalSpend / 1000)}K at risk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KEY METRICS SECTION */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-white/50" />
            Key Performance Metrics
          </h2>
          <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
          
          <div className="grid grid-cols-6 gap-4">
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Campaigns</div>
              <div className="text-3xl font-bold text-white/95">{affectedCampaigns.length}</div>
              <div className="text-[11px] text-white/40 mt-1">affected</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Total Spend</div>
              <div className="text-3xl font-bold text-white/95">${Math.round(metrics.totalSpend / 1000)}K</div>
              <div className="text-[11px] text-white/40 mt-1">of ${Math.round(metrics.totalBudget / 1000)}K budget</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Avg ROAS</div>
              <div className="text-3xl font-bold text-white/95">{metrics.avgRoas.toFixed(1)}x</div>
              <div className={`text-[11px] mt-1 ${metrics.avgRoas >= 3 ? 'text-green-400' : metrics.avgRoas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.avgRoas >= 3 ? 'On target' : metrics.avgRoas >= 2 ? 'Below target' : 'Critical'}
              </div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Conversions</div>
              <div className="text-3xl font-bold text-white/95">{metrics.totalConversions.toLocaleString()}</div>
              <div className="text-[11px] text-white/40 mt-1">total</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Avg CTR</div>
              <div className="text-3xl font-bold text-white/95">{(metrics.avgCtr * 100).toFixed(2)}%</div>
              <div className={`text-[11px] mt-1 ${metrics.avgCtr >= 0.02 ? 'text-green-400' : metrics.avgCtr >= 0.01 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.avgCtr >= 0.02 ? 'Strong' : metrics.avgCtr >= 0.01 ? 'Average' : 'Low'}
              </div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Channels</div>
              <div className="text-3xl font-bold text-white/95">{metrics.channels.length}</div>
              <div className="text-[11px] text-white/40 mt-1">impacted</div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT - Two Column Layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left Column - Visualizations (2/3 width) */}
          <div className="col-span-2 space-y-4">
            
            {/* Category-specific visualization */}
            {alert.category === 'audience_overlap' && (
              <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-400" />
                  Audience Collision Heatmap
                </h2>
                <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
                <p className="text-white/50 text-sm mb-4">
                  This heatmap shows where your campaigns are competing for the same audience segments. 
                  Cells with higher intensity indicate more campaigns targeting the same channel × funnel combination, 
                  leading to increased bid competition and inflated costs.
                </p>
                <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
                  <AudienceOverlapHeatmap campaigns={affectedCampaigns} />
                </div>
              </section>
            )}

            {alert.category === 'budget_pacing' && (
              <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Budget Utilization Analysis
                </h2>
                <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
                <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
                  <div className="space-y-4">
                    {budgetUtilization.slice(0, 10).map((item, idx) => (
                      <div key={item.id} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white/80">{item.name}</span>
                            <span className="text-xs text-white/40 uppercase">{item.channel}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-white/50">${Math.round(item.spent / 1000)}K / ${Math.round(item.budget / 1000)}K</span>
                            <span className={`text-sm font-bold min-w-[50px] text-right ${
                              item.utilization > 90 ? 'text-red-400' : 
                              item.utilization > 70 ? 'text-orange-400' : 'text-green-400'
                            }`}>
                              {item.utilization}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(item.utilization, 100)}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className={`h-full rounded-full ${
                              item.utilization > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                              item.utilization > 70 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                              'bg-gradient-to-r from-green-600 to-green-400'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {alert.category === 'roas_misalignment' && (
              <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  ROAS Performance by Funnel Stage
                </h2>
                <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
                <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
                  <div className="grid grid-cols-4 gap-4">
                    {['awareness', 'consideration', 'conversion', 'retention'].map(stage => {
                      const stageCampaigns = affectedCampaigns.filter(c => c.funnelStage === stage);
                      const avgRoas = stageCampaigns.length > 0 
                        ? stageCampaigns.reduce((sum, c) => sum + c.roas, 0) / stageCampaigns.length 
                        : 0;
                      const benchmarks: Record<string, [number, number]> = {
                        awareness: [0.5, 2.5],
                        consideration: [1.0, 3.5],
                        conversion: [2.0, 5.0],
                        retention: [3.0, 7.0]
                      };
                      const [min, max] = benchmarks[stage];
                      const status = avgRoas < min ? 'below' : avgRoas > max ? 'above' : 'target';
                      
                      return (
                        <div key={stage} className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                          <div className="text-[11px] text-white/50 uppercase tracking-wider mb-2">{stage}</div>
                          <div className={`text-3xl font-bold ${
                            status === 'below' ? 'text-red-400' : 
                            status === 'above' ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {avgRoas.toFixed(1)}x
                          </div>
                          <div className="text-[11px] text-white/40 mt-1">Target: {min}-{max}x</div>
                          <div className="mt-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full ${
                              status === 'below' ? 'bg-red-500/20 text-red-400' :
                              status === 'above' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {status === 'below' ? '↓ Below target' : status === 'above' ? '↑ Over-optimized' : '✓ On target'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {alert.category === 'lifecycle_stall' && (
              <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  Pipeline Stage Distribution
                </h2>
                <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
                <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
                  <div className="flex items-end gap-3 h-52">
                    {['ideation', 'planning', 'development', 'qa_ready', 'launching', 'active', 'closing'].map((stage, idx) => {
                      const count = lifecycleDistribution[stage] || 0;
                      const maxCount = Math.max(...Object.values(lifecycleDistribution), 1);
                      const height = (count / maxCount) * 100;
                      const isStalled = ['ideation', 'planning', 'development', 'qa_ready'].includes(stage);
                      
                      return (
                        <motion.div 
                          key={stage} 
                          className="flex-1 flex flex-col items-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="w-full flex flex-col items-center justify-end h-44">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              className={`w-full rounded-t-lg ${
                                isStalled && count > 0 
                                  ? 'bg-gradient-to-t from-orange-600/70 to-orange-400/50' 
                                  : 'bg-gradient-to-t from-blue-600/50 to-blue-400/30'
                              }`}
                              style={{ minHeight: count > 0 ? '12px' : '0' }}
                            />
                          </div>
                          <div className="mt-3 text-[10px] text-white/50 text-center truncate w-full">
                            {stage.replace('_', ' ')}
                          </div>
                          <div className={`text-sm font-bold ${isStalled && count > 0 ? 'text-orange-400' : 'text-white/70'}`}>
                            {count}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {alert.category === 'attribution_leak' && (
              <section>
                <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  Channel Attribution Analysis
                </h2>
                <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-6" />
                <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-4">Spend Distribution</div>
                      {Object.entries(channelPerformance).map(([channel, data], idx) => {
                        const percentage = (data.spend / metrics.totalSpend) * 100;
                        return (
                          <motion.div 
                            key={channel} 
                            className="mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white/80 uppercase">{channel}</span>
                              <span className="text-sm text-white/60">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div>
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-4">Revenue Attribution</div>
                      {Object.entries(channelPerformance).map(([channel, data], idx) => {
                        const revenue = data.spend * data.roas;
                        const totalRevenue = metrics.totalSpend * metrics.avgRoas;
                        const percentage = (revenue / totalRevenue) * 100;
                        return (
                          <motion.div 
                            key={channel} 
                            className="mb-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white/80 uppercase">{channel}</span>
                              <span className="text-sm text-white/60">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* AFFECTED CAMPAIGNS TABLE */}
            <section>
              <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-white/50" />
                Affected Campaigns Detail
              </h2>
              <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-4" />
              <div className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="text-left text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Campaign</th>
                        <th className="text-left text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Channel</th>
                        <th className="text-left text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Stage</th>
                        <th className="text-right text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Spend</th>
                        <th className="text-right text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">ROAS</th>
                        <th className="text-right text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">CTR</th>
                        <th className="text-right text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Conversions</th>
                        <th className="text-center text-[11px] text-white/50 uppercase tracking-wider p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affectedCampaigns.slice(0, 12).map((campaign, idx) => (
                        <motion.tr 
                          key={campaign.id} 
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td className="p-3">
                            <span className="text-sm text-white/85 font-medium">{campaign.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-white/60 uppercase">{campaign.channel}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-white/60">{campaign.lifecycleStage}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-sm text-white/80">${Math.round(campaign.spent / 1000)}K</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`text-sm font-medium ${
                              campaign.roas >= 3 ? 'text-green-400' : 
                              campaign.roas >= 2 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {campaign.roas.toFixed(1)}x
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-sm text-white/70">{(campaign.ctr * 100).toFixed(2)}%</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-sm text-white/70">{campaign.conversions.toLocaleString()}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                              campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              campaign.status === 'at_risk' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {affectedCampaigns.length > 12 && (
                  <div className="text-center py-4 text-sm text-white/40 border-t border-white/[0.04] mt-2">
                    +{affectedCampaigns.length - 12} more campaigns
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - AI Solutions (1/3 width) */}
          <div className="space-y-4">
            {/* AI SOLUTIONS SECTION - With shimmer effect */}
            <section className="relative">
              {/* Animated gradient border */}
              <div 
                className="absolute -inset-[1px] rounded-2xl opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 4s ease infinite'
                }}
              />
              <div className="relative p-5 bg-[#0c0c0e]/95 backdrop-blur-sm rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-purple-400 relative z-10" />
                      {/* Shimmer effect */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                          animation: 'shimmer 2s ease-in-out infinite'
                        }}
                      />
                    </div>
                    <div>
                      <h2 
                        className="text-base font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F9A8D4 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        AI Recommendations
                      </h2>
                      <p className="text-xs text-white/50">Powered by Campaign Manager Agent</p>
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

                <div className="space-y-4">
                  {solutions.map((solution, idx) => (
                    <motion.div 
                      key={solution.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="p-5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
                      style={{
                        background: 'rgba(30,30,35,0.6)',
                        border: idx === 0 ? '1px solid rgba(59,130,246,0.15)' : 
                               idx === 1 ? '1px solid rgba(147,51,234,0.15)' : 
                               '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: idx === 0 ? 'rgba(59,130,246,0.15)' : 
                                       idx === 1 ? 'rgba(147,51,234,0.15)' : 
                                       'rgba(255,255,255,0.08)',
                            border: idx === 0 ? '1px solid rgba(59,130,246,0.3)' : 
                                   idx === 1 ? '1px solid rgba(147,51,234,0.3)' : 
                                   '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          <span className={`text-base font-bold ${
                            idx === 0 ? 'text-blue-400' : 
                            idx === 1 ? 'text-purple-400' : 
                            'text-gray-400'
                          }`}>{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h4 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors leading-snug">
                              {solution.title}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                solution.effort === 'Low' ? 'bg-green-500/20 text-green-300' :
                                solution.effort === 'Medium' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {solution.effort === 'Low' ? 'High' : solution.effort === 'Medium' ? 'Medium' : 'Medium'} confidence
                              </span>
                              <span className="text-[10px] text-gray-400">{solution.confidence}%</span>
                            </div>
                          </div>
                          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{solution.description}</p>
                          
                          <div className="flex items-center gap-3 text-xs flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Effort:</span>
                              <span className={`px-2 py-0.5 rounded font-semibold ${
                                solution.effort === 'Low' ? 'bg-green-500/20 text-green-300' :
                                solution.effort === 'Medium' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>{solution.effort}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-400">{solution.timeframe}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">Impact:</span>
                              <span className="text-white font-semibold">High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Share Button with glow animation - AT BOTTOM */}
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
              </div>
            </section>

            {/* Impact Summary */}
            <section className="p-6 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/90 mb-4">Impact Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-xs text-white/50">Total Campaigns</span>
                  <span className="text-sm font-bold text-white/90">{affectedCampaigns.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-xs text-white/50">Spend at Risk</span>
                  <span className="text-sm font-bold text-white/90">${Math.round(metrics.totalSpend / 1000)}K</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-xs text-white/50">Average ROAS</span>
                  <span className="text-sm font-bold text-white/90">{metrics.avgRoas.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-xs text-white/50">Total Conversions</span>
                  <span className="text-sm font-bold text-white/90">{metrics.totalConversions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-white/50">Channels Affected</span>
                  <span className="text-sm font-bold text-white/90">{metrics.channels.length}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};

export default AlertDetailDashboard;
