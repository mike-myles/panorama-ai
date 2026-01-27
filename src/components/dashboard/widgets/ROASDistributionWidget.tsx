/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface ROASDistributionWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onTierClick?: (tier: string) => void;
}

const ROAS_TIERS = [
  { id: 'excellent', label: 'Excellent', range: '4.0+', min: 4.0, max: Infinity, color: '#22C55E' },
  { id: 'good', label: 'Good', range: '2.0-4.0', min: 2.0, max: 4.0, color: '#3B82F6' },
  { id: 'fair', label: 'Fair', range: '1.0-2.0', min: 1.0, max: 2.0, color: '#EAB308' },
  { id: 'poor', label: 'Poor', range: '<1.0', min: 0, max: 1.0, color: '#EF4444' }
];

export const ROASDistributionWidget: React.FC<ROASDistributionWidgetProps> = ({
  campaigns,
  onDrillIn,
  onTierClick
}) => {
  const distributionData = useMemo(() => {
    const total = campaigns.length;
    const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / total;
    const portfolioRoas = campaigns.reduce((sum, c) => sum + c.spent * c.roas, 0) / 
                          campaigns.reduce((sum, c) => sum + c.spent, 0);

    // Calculate distribution
    const distribution = ROAS_TIERS.map(tier => {
      const tierCampaigns = campaigns.filter(c => c.roas >= tier.min && c.roas < tier.max);
      const count = tierCampaigns.length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      const spend = tierCampaigns.reduce((sum, c) => sum + c.spent, 0);
      const revenue = tierCampaigns.reduce((sum, c) => sum + c.spent * c.roas, 0);

      return {
        ...tier,
        count,
        percentage,
        spend,
        revenue,
        avgRoas: count > 0 ? tierCampaigns.reduce((sum, c) => sum + c.roas, 0) / count : 0
      };
    });

    // Top performers
    const topPerformers = campaigns
      .filter(c => c.roas >= 4.0)
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 3);

    // Calculate trend (simulated)
    const trend = Math.round((Math.random() * 10 - 3) * 10) / 10;

    // Industry benchmark
    const benchmark = 2.8;

    return {
      distribution,
      total,
      avgRoas,
      portfolioRoas,
      topPerformers,
      trend,
      benchmark,
      aboveBenchmark: portfolioRoas >= benchmark
    };
  }, [campaigns]);

  const maxPercentage = Math.max(...distributionData.distribution.map(d => d.percentage));

  return (
    <WidgetContainer
      title="ROAS Distribution"
      icon={<BarChart2 className="w-4 h-4" />}
      accentColor="#3B82F6"
      onDrillIn={onDrillIn}
      drillInLabel="View performance details"
    >
      {/* Portfolio ROAS */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{distributionData.portfolioRoas.toFixed(1)}</span>
            <span className="text-white/40 text-base">ROAS</span>
          </div>
          <span className="text-white/50 text-sm">Portfolio weighted average</span>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 ${
            distributionData.trend >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {distributionData.trend >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-base font-semibold">
              {distributionData.trend >= 0 ? '+' : ''}{distributionData.trend}%
            </span>
          </div>
          <span className={`text-sm ${
            distributionData.aboveBenchmark ? 'text-green-400' : 'text-amber-400'
          }`}>
            {distributionData.aboveBenchmark ? '✓' : '⚠️'} vs {distributionData.benchmark} benchmark
          </span>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-3.5 mb-4">
        {distributionData.distribution.map((tier, index) => (
          <motion.button
            key={tier.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTierClick?.(tier.id)}
            className="w-full group/tier"
          >
            <div className="flex items-center gap-3">
              {/* Tier info */}
              <div className="w-24 text-left">
                <span className="text-white/70 text-sm group-hover/tier:text-white transition-colors">
                  {tier.label}
                </span>
                <span className="text-white/40 text-xs block">
                  {tier.range}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(tier.percentage / maxPercentage) * 100}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="h-full rounded-lg relative overflow-hidden group-hover/tier:brightness-110 transition-all"
                  style={{ backgroundColor: tier.color }}
                >
                  {/* Inner gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </motion.div>

                {/* Percentage label inside bar */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-white/90 text-sm font-semibold">
                    {tier.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Count */}
              <div className="w-14 text-right">
                <span className="text-white font-semibold text-base">{tier.count}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Top performers */}
      {distributionData.topPerformers.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <span className="text-white/40 text-sm mb-2 block">Top performers</span>
          <div className="space-y-2">
            {distributionData.topPerformers.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-white/70 text-sm truncate flex-1 mr-2">
                  {campaign.name}
                </span>
                <span className="text-green-400 text-sm font-semibold">
                  {campaign.roas.toFixed(1)}x
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </WidgetContainer>
  );
};
