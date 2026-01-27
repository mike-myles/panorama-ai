/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Timer, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, LifecycleStage } from '../../../types';

interface VelocityTrackerWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
}

const LIFECYCLE_ORDER: LifecycleStage[] = [
  'ideation', 'planning', 'development', 'qa_ready', 'launching', 'active', 'closing'
];

const STAGE_BENCHMARK_DAYS: Record<LifecycleStage, number> = {
  ideation: 7,
  planning: 14,
  development: 21,
  qa_ready: 7,
  launching: 14,
  active: 60,
  closing: 14
};

export const VelocityTrackerWidget: React.FC<VelocityTrackerWidgetProps> = ({
  campaigns,
  onDrillIn
}) => {
  const velocityData = useMemo(() => {
    const now = new Date();

    // Calculate average time to launch for launched campaigns
    const launchedCampaigns = campaigns.filter(c => c.launchDate);
    const avgTimeToLaunch = launchedCampaigns.length > 0
      ? launchedCampaigns.reduce((sum, c) => {
          const created = new Date(c.createdDate);
          const launched = new Date(c.launchDate!);
          return sum + Math.ceil((launched.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / launchedCampaigns.length
      : 0;

    // Calculate stage averages
    const stageDurations: Record<LifecycleStage, number[]> = {
      ideation: [], planning: [], development: [], qa_ready: [], 
      launching: [], active: [], closing: []
    };

    campaigns.forEach(c => {
      const created = new Date(c.createdDate);
      const daysSinceCreation = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      // Estimate time in current stage based on creation date and lifecycle stage
      const stageIndex = LIFECYCLE_ORDER.indexOf(c.lifecycleStage);
      const estimatedDaysInStage = Math.max(1, daysSinceCreation - (stageIndex * 10));
      stageDurations[c.lifecycleStage].push(estimatedDaysInStage);
    });

    const stageAverages = LIFECYCLE_ORDER.map(stage => {
      const durations = stageDurations[stage];
      const avg = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
      return {
        stage,
        avgDays: avg,
        benchmark: STAGE_BENCHMARK_DAYS[stage],
        diff: avg - STAGE_BENCHMARK_DAYS[stage],
        count: durations.length
      };
    }).filter(s => s.count > 0);

    // Find slowest and fastest stages
    const slowest = stageAverages.reduce((max, s) => s.diff > max.diff ? s : max, stageAverages[0]);
    const fastest = stageAverages.reduce((min, s) => s.diff < min.diff ? s : min, stageAverages[0]);

    // Campaign velocity status
    const onSchedule = campaigns.filter(c => {
      const created = new Date(c.createdDate);
      const daysSinceCreation = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const expectedStageIndex = Math.min(6, Math.floor(daysSinceCreation / 14));
      const actualStageIndex = LIFECYCLE_ORDER.indexOf(c.lifecycleStage);
      return actualStageIndex >= expectedStageIndex;
    });

    const delayed = campaigns.filter(c => {
      const created = new Date(c.createdDate);
      const daysSinceCreation = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const expectedStageIndex = Math.min(6, Math.floor(daysSinceCreation / 14));
      const actualStageIndex = LIFECYCLE_ORDER.indexOf(c.lifecycleStage);
      return actualStageIndex < expectedStageIndex - 1;
    });

    const ahead = campaigns.filter(c => {
      const created = new Date(c.createdDate);
      const daysSinceCreation = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const expectedStageIndex = Math.min(6, Math.floor(daysSinceCreation / 14));
      const actualStageIndex = LIFECYCLE_ORDER.indexOf(c.lifecycleStage);
      return actualStageIndex > expectedStageIndex;
    });

    return {
      avgTimeToLaunch: Math.round(avgTimeToLaunch),
      benchmarkTimeToLaunch: 60,
      stageAverages,
      slowest,
      fastest,
      onSchedule: onSchedule.length,
      delayed: delayed.length,
      ahead: ahead.length,
      total: campaigns.length
    };
  }, [campaigns]);

  const formatStageName = (stage: LifecycleStage) => {
    const names: Record<LifecycleStage, string> = {
      ideation: 'Ideation',
      planning: 'Planning',
      development: 'Development',
      qa_ready: 'QA & Ready',
      launching: 'Launching',
      active: 'Active',
      closing: 'Closing'
    };
    return names[stage];
  };

  return (
    <WidgetContainer
      title="Lifecycle Velocity"
      icon={<Timer className="w-4 h-4" />}
      accentColor="#F97316"
      onDrillIn={onDrillIn}
      drillInLabel="View timeline"
    >
      {/* Average time to launch */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{velocityData.avgTimeToLaunch}</span>
            <span className="text-white/40 text-base">days</span>
          </div>
          <span className="text-white/50 text-sm">Avg. time to launch</span>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 ${
            velocityData.avgTimeToLaunch <= velocityData.benchmarkTimeToLaunch 
              ? 'text-green-400' : 'text-amber-400'
          }`}>
            {velocityData.avgTimeToLaunch <= velocityData.benchmarkTimeToLaunch ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-base font-semibold">
              {Math.abs(velocityData.avgTimeToLaunch - velocityData.benchmarkTimeToLaunch)}d
              {velocityData.avgTimeToLaunch <= velocityData.benchmarkTimeToLaunch ? ' faster' : ' slower'}
            </span>
          </div>
          <span className="text-white/40 text-sm">vs {velocityData.benchmarkTimeToLaunch}d benchmark</span>
        </div>
      </div>

      {/* Campaign status breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 rounded-xl p-4 text-center"
        >
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <span className="text-white font-semibold text-xl block">{velocityData.onSchedule}</span>
          <span className="text-white/50 text-sm">On schedule</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-amber-500/10 rounded-xl p-4 text-center"
        >
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-white font-semibold text-xl block">{velocityData.delayed}</span>
          <span className="text-white/50 text-sm">Delayed</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 rounded-xl p-4 text-center"
        >
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <span className="text-white font-semibold text-xl block">{velocityData.ahead}</span>
          <span className="text-white/50 text-sm">Ahead</span>
        </motion.div>
      </div>

      {/* Stage performance */}
      <div className="pt-3 border-t border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Fastest stage</span>
          <span className="text-green-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {formatStageName(velocityData.fastest?.stage || 'qa_ready')} ({Math.abs(velocityData.fastest?.diff || 0)}d faster)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Slowest stage</span>
          <span className="text-amber-400 font-medium flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            {formatStageName(velocityData.slowest?.stage || 'development')} ({velocityData.slowest?.diff || 0}d slower)
          </span>
        </div>
      </div>
    </WidgetContainer>
  );
};
