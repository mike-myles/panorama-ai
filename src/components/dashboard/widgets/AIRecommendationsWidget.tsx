/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, DollarSign, Zap, Users, RefreshCw } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface AIRecommendationsWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  type: 'budget' | 'performance' | 'launch' | 'audience' | 'optimization';
  icon: React.ElementType;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export const AIRecommendationsWidget: React.FC<AIRecommendationsWidgetProps> = ({
  campaigns,
  onDrillIn,
  onRecommendationClick
}) => {
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];

    // Analyze campaigns for recommendations
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);

    // Funnel analysis
    const funnelCounts = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
    const funnelSpend = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
    campaigns.forEach(c => {
      funnelCounts[c.funnelStage]++;
      funnelSpend[c.funnelStage] += c.spent;
    });

    // High ROAS campaigns that could scale
    const highRoasCampaigns = campaigns.filter(c => c.roas > 4 && (c.spent / c.budget) < 0.7);
    if (highRoasCampaigns.length >= 3) {
      const potentialRevenue = highRoasCampaigns
        .reduce((sum, c) => sum + (c.budget - c.spent) * c.roas, 0);
      recs.push({
        id: 'scale-high-roas',
        title: `Scale ${highRoasCampaigns.length} high-ROAS campaigns`,
        description: 'These campaigns have strong returns and budget headroom',
        impact: `+$${(potentialRevenue / 1000).toFixed(0)}K revenue potential`,
        confidence: 87,
        type: 'performance',
        icon: TrendingUp,
        color: '#22C55E',
        priority: 'high'
      });
    }

    // Funnel imbalance
    const awarenessPercent = (funnelCounts.awareness / campaigns.length) * 100;
    if (awarenessPercent < 25) {
      const suggestedShift = Math.round(totalSpent * 0.05);
      recs.push({
        id: 'funnel-balance',
        title: 'Shift budget to TOFU',
        description: 'Awareness campaigns are underfunded vs. recommended 30%',
        impact: `Shift ~$${(suggestedShift / 1000).toFixed(0)}K to TOFU`,
        confidence: 82,
        type: 'budget',
        icon: DollarSign,
        color: '#3B82F6',
        priority: 'high'
      });
    }

    // Low performing campaigns
    const lowRoasCampaigns = campaigns.filter(c => c.roas < 1.5 && c.spent > 10000);
    if (lowRoasCampaigns.length > 0) {
      const wastedSpend = lowRoasCampaigns.reduce((sum, c) => sum + c.spent, 0);
      recs.push({
        id: 'pause-low-roas',
        title: `Review ${lowRoasCampaigns.length} underperforming campaigns`,
        description: 'These campaigns have ROAS below 1.5x',
        impact: `Save ~$${(wastedSpend * 0.3 / 1000).toFixed(0)}K in wasted spend`,
        confidence: 78,
        type: 'optimization',
        icon: RefreshCw,
        color: '#F97316',
        priority: 'medium'
      });
    }

    // At-risk campaigns near launch
    const atRiskLaunches = campaigns.filter(c => {
      const daysToLaunch = Math.ceil(
        (new Date(c.targetLaunchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysToLaunch <= 14 && c.readinessPercent < 70;
    });
    if (atRiskLaunches.length > 0) {
      recs.push({
        id: 'fast-track-launches',
        title: `Fast-track ${atRiskLaunches.length} at-risk launches`,
        description: 'These campaigns launch soon but aren\'t ready',
        impact: 'Prevent launch delays',
        confidence: 91,
        type: 'launch',
        icon: Zap,
        color: '#EF4444',
        priority: 'high'
      });
    }

    // Audience overlap detection (simulated)
    const socialCampaigns = campaigns.filter(c => c.channel === 'social');
    if (socialCampaigns.length > 10) {
      recs.push({
        id: 'audience-overlap',
        title: 'Resolve potential audience collisions',
        description: `${socialCampaigns.length} social campaigns may have overlapping audiences`,
        impact: `Save ~$${Math.round(totalSpent * 0.02 / 1000)}K estimated waste`,
        confidence: 74,
        type: 'audience',
        icon: Users,
        color: '#8B5CF6',
        priority: 'medium'
      });
    }

    // Sort by priority and confidence
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recs.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }, [campaigns]);

  return (
    <WidgetContainer
      title="AI Recommendations"
      icon={<Sparkles className="w-4 h-4" />}
      accentColor="#8B5CF6"
      onDrillIn={onDrillIn}
      drillInLabel={`View all (${recommendations.length})`}
      badge={
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
          {recommendations.filter(r => r.priority === 'high').length} high priority
        </span>
      }
    >
      {recommendations.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-white/70 text-base">Portfolio is well optimized!</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {recommendations.slice(0, 3).map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.button
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onRecommendationClick?.(rec)}
                className="w-full text-left group"
              >
                <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 transition-all">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${rec.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: rec.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-white/90 text-base font-medium line-clamp-1 group-hover:text-white transition-colors">
                          {rec.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-white/40 text-sm line-clamp-1 mb-1.5">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: rec.color }}>
                          {rec.impact}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};
