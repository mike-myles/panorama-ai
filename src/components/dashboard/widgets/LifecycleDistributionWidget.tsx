/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, LifecycleStage } from '../../../types';

interface LifecycleDistributionWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onStageClick?: (stage: LifecycleStage) => void;
}

const LIFECYCLE_CONFIG: Record<LifecycleStage, { label: string; color: string; order: number }> = {
  'ideation': { label: 'Ideation', color: '#EC4899', order: 0 },
  'planning': { label: 'Planning', color: '#F472B6', order: 1 },
  'development': { label: 'Development', color: '#F97316', order: 2 },
  'qa_ready': { label: 'QA & Ready', color: '#A855F7', order: 3 },
  'launching': { label: 'Launching', color: '#3B82F6', order: 4 },
  'active': { label: 'Active', color: '#22C55E', order: 5 },
  'closing': { label: 'Closing', color: '#6B7280', order: 6 }
};

export const LifecycleDistributionWidget: React.FC<LifecycleDistributionWidgetProps> = ({
  campaigns,
  onDrillIn,
  onStageClick
}) => {
  const distributionData = useMemo(() => {
    const counts: Record<LifecycleStage, number> = {
      ideation: 0,
      planning: 0,
      development: 0,
      qa_ready: 0,
      launching: 0,
      active: 0,
      closing: 0
    };

    campaigns.forEach(c => {
      counts[c.lifecycleStage]++;
    });

    const total = campaigns.length;
    const maxCount = Math.max(...Object.values(counts));

    // Detect bottleneck (stage with significantly more than average)
    const avgCount = total / 7;
    const bottleneck = Object.entries(counts).find(
      ([_, count]) => count > avgCount * 1.5
    );

    // Sort by order
    const stages = (Object.keys(counts) as LifecycleStage[])
      .sort((a, b) => LIFECYCLE_CONFIG[a].order - LIFECYCLE_CONFIG[b].order)
      .map(stage => ({
        stage,
        count: counts[stage],
        percentage: total > 0 ? (counts[stage] / total) * 100 : 0,
        barWidth: maxCount > 0 ? (counts[stage] / maxCount) * 100 : 0,
        ...LIFECYCLE_CONFIG[stage]
      }));

    return {
      stages,
      total,
      bottleneck: bottleneck ? {
        stage: bottleneck[0] as LifecycleStage,
        count: bottleneck[1]
      } : null
    };
  }, [campaigns]);

  return (
    <WidgetContainer
      title="Lifecycle Distribution"
      icon={<BarChart3 className="w-4 h-4" />}
      accentColor="#A855F7"
      onDrillIn={onDrillIn}
      drillInLabel="View workflow"
      badge={
        distributionData.bottleneck ? (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Bottleneck
          </span>
        ) : null
      }
    >
      {/* Horizontal bar chart */}
      <div className="space-y-2.5">
        {distributionData.stages.map((item, index) => (
          <motion.button
            key={item.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onStageClick?.(item.stage)}
            className="w-full group/bar"
          >
            <div className="flex items-center gap-3">
              {/* Label */}
              <div className="w-24 text-left">
                <span className="text-white/70 text-xs group-hover/bar:text-white transition-colors">
                  {item.label}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.barWidth}%` }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="h-full rounded-lg relative group-hover/bar:brightness-110 transition-all"
                  style={{ backgroundColor: item.color }}
                >
                  {/* Inner highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </motion.div>

                {/* Bottleneck indicator */}
                {distributionData.bottleneck?.stage === item.stage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </motion.div>
                )}
              </div>

              {/* Count */}
              <div className="w-10 text-right">
                <span className="text-white font-semibold text-sm">{item.count}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottleneck warning */}
      {distributionData.bottleneck && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Bottleneck in{' '}
              <strong>{LIFECYCLE_CONFIG[distributionData.bottleneck.stage].label}</strong>
              {' '}({distributionData.bottleneck.count} campaigns)
            </span>
          </div>
        </motion.div>
      )}
    </WidgetContainer>
  );
};
