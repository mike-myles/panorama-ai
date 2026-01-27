/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface TeamWorkloadWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onTeamMemberClick?: (owner: string) => void;
}

export const TeamWorkloadWidget: React.FC<TeamWorkloadWidgetProps> = ({
  campaigns,
  onDrillIn,
  onTeamMemberClick
}) => {
  const workloadData = useMemo(() => {
    // Group campaigns by owner
    const byOwner: Record<string, Campaign[]> = {};
    campaigns.forEach(c => {
      const owner = c.owner || 'Unassigned';
      if (!byOwner[owner]) byOwner[owner] = [];
      byOwner[owner].push(c);
    });

    const teamMembers = Object.entries(byOwner).map(([owner, ownerCampaigns]) => {
      const activeCount = ownerCampaigns.filter(c => c.status === 'active').length;
      const atRiskCount = ownerCampaigns.filter(c => c.readinessPercent < 50).length;
      const alertCount = ownerCampaigns.filter(c => c.alert).length;

      return {
        name: owner,
        total: ownerCampaigns.length,
        active: activeCount,
        atRisk: atRiskCount,
        alerts: alertCount,
        campaigns: ownerCampaigns
      };
    }).sort((a, b) => b.total - a.total);

    // Calculate averages
    const avgWorkload = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.total, 0) / teamMembers.length)
      : 0;

    // Find overloaded team members (30% above average)
    const overloadedThreshold = avgWorkload * 1.3;
    const overloaded = teamMembers.filter(m => m.total > overloadedThreshold);

    // Find underutilized team members (30% below average)
    const underutilizedThreshold = avgWorkload * 0.7;
    const underutilized = teamMembers.filter(m => m.total < underutilizedThreshold && m.total > 0);

    const maxWorkload = Math.max(...teamMembers.map(m => m.total));

    return {
      teamMembers,
      avgWorkload,
      overloaded,
      underutilized,
      maxWorkload,
      totalTeamSize: teamMembers.length
    };
  }, [campaigns]);

  const getWorkloadColor = (count: number, avg: number) => {
    if (count > avg * 1.3) return '#EF4444'; // Red - overloaded
    if (count > avg * 1.1) return '#EAB308'; // Yellow - near capacity
    if (count < avg * 0.7) return '#3B82F6'; // Blue - underutilized
    return '#22C55E'; // Green - balanced
  };

  return (
    <WidgetContainer
      title="Team Capacity"
      icon={<Users className="w-4 h-4" />}
      accentColor="#8B5CF6"
      onDrillIn={onDrillIn}
      drillInLabel="View team details"
      badge={
        workloadData.overloaded.length > 0 ? (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {workloadData.overloaded.length} overloaded
          </span>
        ) : null
      }
    >
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-white/50 text-xs">Team average</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">~{workloadData.avgWorkload}</span>
            <span className="text-white/40 text-xs">campaigns</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-white/50 text-xs">{workloadData.totalTeamSize} teams</span>
        </div>
      </div>

      {/* Team member bars */}
      <div className="space-y-2.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
        {workloadData.teamMembers.slice(0, 5).map((member, index) => {
          const barColor = getWorkloadColor(member.total, workloadData.avgWorkload);
          const isOverloaded = member.total > workloadData.avgWorkload * 1.3;

          return (
            <motion.button
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTeamMemberClick?.(member.name)}
              className="w-full group/member"
            >
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: `${barColor}40` }}
                >
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                {/* Name and bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs truncate group-hover/member:text-white transition-colors">
                      {member.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {isOverloaded && (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                      <span className="text-white font-semibold text-xs">{member.total}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(member.total / workloadData.maxWorkload) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Rebalancing suggestion */}
      {workloadData.overloaded.length > 0 && workloadData.underutilized.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <span>💡 Reassign from</span>
            <span className="font-medium">{workloadData.overloaded[0]?.name}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium">{workloadData.underutilized[0]?.name}</span>
          </div>
        </motion.div>
      )}
    </WidgetContainer>
  );
};
