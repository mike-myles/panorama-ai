/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Rocket, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface RecentActivityWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onActivityClick?: (activity: Activity) => void;
}

interface Activity {
  id: string;
  type: 'launch' | 'alert' | 'update' | 'milestone' | 'status_change';
  title: string;
  description: string;
  timestamp: Date;
  campaignId?: string;
  campaignName?: string;
  icon: React.ElementType;
  color: string;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  campaigns,
  onDrillIn,
  onActivityClick
}) => {
  const activities = useMemo(() => {
    const activityList: Activity[] = [];
    const now = new Date();

    // Generate simulated activities based on campaign data
    campaigns.forEach((campaign, index) => {
      // Launched campaigns
      if (campaign.launchDate) {
        const launchTime = new Date(campaign.launchDate).getTime();
        const hoursSinceLaunch = (now.getTime() - launchTime) / (1000 * 60 * 60);
        
        if (hoursSinceLaunch >= 0 && hoursSinceLaunch < 168) { // Within last week
          activityList.push({
            id: `launch-${campaign.id}`,
            type: 'launch',
            title: 'Campaign launched',
            description: campaign.name,
            timestamp: new Date(campaign.launchDate),
            campaignId: campaign.id,
            campaignName: campaign.name,
            icon: Rocket,
            color: '#22C55E'
          });
        }
      }

      // Alerts
      if (campaign.alerts && campaign.alerts.length > 0) {
        campaign.alerts.forEach(alert => {
          activityList.push({
            id: `alert-${alert.id}`,
            type: 'alert',
            title: `Alert: ${alert.severity}`,
            description: `${campaign.name} - ${alert.message}`,
            timestamp: new Date(alert.timestamp),
            campaignId: campaign.id,
            campaignName: campaign.name,
            icon: AlertTriangle,
            color: alert.severity === 'critical' ? '#EF4444' : 
                   alert.severity === 'warning' ? '#EAB308' : '#3B82F6'
          });
        });
      }

      // Recent modifications (simulated)
      const modifiedTime = new Date(campaign.lastModified).getTime();
      const hoursSinceModified = (now.getTime() - modifiedTime) / (1000 * 60 * 60);
      
      if (hoursSinceModified < 48 && index % 5 === 0) { // Sample some campaigns
        activityList.push({
          id: `update-${campaign.id}`,
          type: 'update',
          title: 'Campaign updated',
          description: `${campaign.name} by ${campaign.createdBy}`,
          timestamp: new Date(campaign.lastModified),
          campaignId: campaign.id,
          campaignName: campaign.name,
          icon: Edit,
          color: '#8B5CF6'
        });
      }

      // Milestones (campaigns reaching readiness thresholds)
      if (campaign.readinessPercent >= 80 && campaign.readinessPercent < 85 && index % 3 === 0) {
        activityList.push({
          id: `milestone-${campaign.id}`,
          type: 'milestone',
          title: 'Ready for launch',
          description: `${campaign.name} reached 80% readiness`,
          timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
          campaignId: campaign.id,
          campaignName: campaign.name,
          icon: CheckCircle,
          color: '#22C55E'
        });
      }
    });

    // Sort by timestamp (most recent first)
    return activityList
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [campaigns]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <WidgetContainer
      title="Recent Activity"
      icon={<Clock className="w-4 h-4" />}
      accentColor="#6B7280"
      onDrillIn={onDrillIn}
      drillInLabel="View all activity"
    >
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/50 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {activities.slice(0, 6).map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onActivityClick?.(activity)}
                className="w-full group/activity text-left"
              >
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  {/* Timeline dot and line */}
                  <div className="relative flex flex-col items-center">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${activity.color}20` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: activity.color }} />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-full bg-white/10 absolute top-7 left-1/2 -translate-x-1/2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/80 text-sm font-medium group-hover/activity:text-white transition-colors">
                        {activity.title}
                      </span>
                      <span className="text-white/40 text-xs flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs line-clamp-1 mt-0.5">
                      {activity.description}
                    </p>
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
