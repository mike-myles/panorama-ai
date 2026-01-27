/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Rocket, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface LaunchPipelineWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
}

export const LaunchPipelineWidget: React.FC<LaunchPipelineWidgetProps> = ({
  campaigns,
  onDrillIn
}) => {
  const pipelineData = useMemo(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    // Filter campaigns launching in next 90 days
    const upcomingCampaigns = campaigns.filter(c => {
      const targetDate = new Date(c.targetLaunchDate);
      return targetDate >= now && targetDate <= ninetyDaysFromNow;
    });

    // Group by readiness
    const ready = upcomingCampaigns.filter(c => c.readinessPercent >= 80);
    const needsAttention = upcomingCampaigns.filter(c => c.readinessPercent >= 50 && c.readinessPercent < 80);
    const atRisk = upcomingCampaigns.filter(c => c.readinessPercent < 50);

    // Calculate average readiness
    const avgReadiness = upcomingCampaigns.length > 0
      ? Math.round(upcomingCampaigns.reduce((sum, c) => sum + c.readinessPercent, 0) / upcomingCampaigns.length)
      : 0;

    // Find campaigns launching this week
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const launchingThisWeek = upcomingCampaigns.filter(c => {
      const targetDate = new Date(c.targetLaunchDate);
      return targetDate <= oneWeekFromNow;
    });

    return {
      total: upcomingCampaigns.length,
      ready,
      needsAttention,
      atRisk,
      avgReadiness,
      launchingThisWeek
    };
  }, [campaigns]);

  const StatusRow: React.FC<{
    label: string;
    count: number;
    color: string;
    icon: React.ReactNode;
    percentage: number;
  }> = ({ label, count, color, icon, percentage }) => (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.05]"
        >
          <div style={{ color }} className="opacity-80 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
        </div>
        <span className="text-white/60 text-base">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-28 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-white/80 font-semibold text-base w-10 text-right">{count}</span>
      </div>
    </div>
  );

  return (
    <WidgetContainer
      title="Launch Pipeline"
      icon={<Rocket className="w-4 h-4" />}
      accentColor="#22C55E"
      onDrillIn={onDrillIn}
      drillInLabel="View timeline"
      badge={
        pipelineData.launchingThisWeek.length > 0 ? (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
            {pipelineData.launchingThisWeek.length} this week
          </span>
        ) : null
      }
    >
      {/* Summary header */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-bold text-white/90">{pipelineData.total}</span>
        <span className="text-white/40 text-base">campaigns in next 90 days</span>
      </div>

      {/* Status breakdown */}
      <div className="space-y-1">
        <StatusRow
          label="Ready to launch"
          count={pipelineData.ready.length}
          color="#22C55E"
          icon={<CheckCircle className="w-4 h-4" />}
          percentage={pipelineData.total > 0 ? (pipelineData.ready.length / pipelineData.total) * 100 : 0}
        />
        <StatusRow
          label="Needs attention"
          count={pipelineData.needsAttention.length}
          color="#EAB308"
          icon={<Clock className="w-4 h-4" />}
          percentage={pipelineData.total > 0 ? (pipelineData.needsAttention.length / pipelineData.total) * 100 : 0}
        />
        <StatusRow
          label="At risk"
          count={pipelineData.atRisk.length}
          color="#EF4444"
          icon={<AlertTriangle className="w-4 h-4" />}
          percentage={pipelineData.total > 0 ? (pipelineData.atRisk.length / pipelineData.total) * 100 : 0}
        />
      </div>

      {/* Average readiness indicator */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Avg. readiness</span>
          <span className={`text-base font-semibold ${
            pipelineData.avgReadiness >= 80 ? 'text-green-400' :
            pipelineData.avgReadiness >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {pipelineData.avgReadiness}%
          </span>
        </div>
      </div>
    </WidgetContainer>
  );
};
