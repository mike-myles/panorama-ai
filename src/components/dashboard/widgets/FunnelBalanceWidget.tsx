/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, FunnelStage } from '../../../types';

interface FunnelBalanceWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onStageClick?: (stage: FunnelStage) => void;
}

const FUNNEL_CONFIG: Record<FunnelStage, { 
  label: string; 
  color: string; 
  recommended: number;
  description: string;
}> = {
  'awareness': { 
    label: 'Awareness', 
    color: '#3B82F6', 
    recommended: 30,
    description: 'Top of funnel'
  },
  'consideration': { 
    label: 'Consideration', 
    color: '#8B5CF6', 
    recommended: 30,
    description: 'Mid funnel'
  },
  'conversion': { 
    label: 'Conversion', 
    color: '#22C55E', 
    recommended: 30,
    description: 'Bottom of funnel'
  },
  'retention': { 
    label: 'Retention', 
    color: '#F97316', 
    recommended: 10,
    description: 'Post-conversion'
  }
};

export const FunnelBalanceWidget: React.FC<FunnelBalanceWidgetProps> = ({
  campaigns,
  onDrillIn,
  onStageClick
}) => {
  const funnelData = useMemo(() => {
    const counts: Record<FunnelStage, number> = {
      awareness: 0,
      consideration: 0,
      conversion: 0,
      retention: 0
    };

    const spend: Record<FunnelStage, number> = {
      awareness: 0,
      consideration: 0,
      conversion: 0,
      retention: 0
    };

    campaigns.forEach(c => {
      counts[c.funnelStage]++;
      spend[c.funnelStage] += c.spent;
    });

    const total = campaigns.length;
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);

    const stages = (Object.keys(counts) as FunnelStage[]).map(stage => {
      const actual = total > 0 ? Math.round((counts[stage] / total) * 100) : 0;
      const recommended = FUNNEL_CONFIG[stage].recommended;
      const diff = actual - recommended;
      const spendPercentage = totalSpend > 0 ? (spend[stage] / totalSpend) * 100 : 0;

      return {
        stage,
        count: counts[stage],
        actual,
        diff,
        spend: spend[stage],
        spendPercentage,
        label: FUNNEL_CONFIG[stage].label,
        color: FUNNEL_CONFIG[stage].color,
        recommended: FUNNEL_CONFIG[stage].recommended,
        description: FUNNEL_CONFIG[stage].description
      };
    });

    // Calculate balance score (0-100, 100 is perfectly balanced)
    const maxVariance = stages.reduce((sum, s) => sum + Math.abs(s.diff), 0);
    const balanceScore = Math.max(0, Math.round(100 - maxVariance));

    // Find most imbalanced stage
    const mostImbalanced = stages.reduce((max, s) => 
      Math.abs(s.diff) > Math.abs(max.diff) ? s : max
    );

    return {
      stages,
      total,
      totalSpend,
      balanceScore,
      mostImbalanced: Math.abs(mostImbalanced.diff) >= 5 ? mostImbalanced : null
    };
  }, [campaigns]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <WidgetContainer
      title="Funnel Coverage"
      icon={<Target className="w-4 h-4" />}
      accentColor="#8B5CF6"
      onDrillIn={onDrillIn}
      drillInLabel="View funnel analysis"
    >
      {/* Balance score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{funnelData.balanceScore}</span>
            <span className="text-white/40 text-base">/100</span>
          </div>
          <span className="text-white/50 text-sm">Balance score</span>
        </div>
        <div className="text-right">
          <span className="text-white/70 text-base">{formatCurrency(funnelData.totalSpend)}</span>
          <p className="text-white/40 text-sm">Total spend</p>
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-3.5">
        {funnelData.stages.map((item, index) => (
          <motion.button
            key={item.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onStageClick?.(item.stage)}
            className="w-full group/stage"
          >
            <div className="flex items-center gap-3">
              {/* Stage indicator */}
              <div 
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              
              {/* Label and counts */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-base group-hover/stage:text-white transition-colors">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      {item.actual}%
                    </span>
                    <span className={`text-sm flex items-center gap-0.5 ${
                      item.diff > 0 ? 'text-green-400' : 
                      item.diff < 0 ? 'text-red-400' : 'text-white/40'
                    }`}>
                      {item.diff > 0 ? (
                        <><TrendingUp className="w-4 h-4" />+{item.diff}%</>
                      ) : item.diff < 0 ? (
                        <><TrendingDown className="w-4 h-4" />{item.diff}%</>
                      ) : (
                        <><Minus className="w-4 h-4" />0%</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar with recommended marker */}
                <div className="relative h-2.5 bg-white/10 rounded-full overflow-visible">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.actual, 100)}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {/* Recommended marker */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/40"
                    style={{ left: `${item.recommended}%` }}
                  />
                </div>
              </div>

              {/* Campaign count */}
              <div className="text-right w-14 flex-shrink-0">
                <span className="text-white/50 text-sm">{item.count}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Imbalance warning */}
      {funnelData.mostImbalanced && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className={funnelData.mostImbalanced.diff < 0 ? 'text-red-400' : 'text-amber-400'}>
              ⚠️ {funnelData.mostImbalanced.label} {funnelData.mostImbalanced.diff < 0 ? 'underfunded' : 'overfunded'} by {Math.abs(funnelData.mostImbalanced.diff)}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Recommended distribution hint */}
      <div className="mt-3 text-white/30 text-sm text-center">
        Recommended: 30/30/30/10
      </div>
    </WidgetContainer>
  );
};
