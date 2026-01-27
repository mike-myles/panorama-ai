/* cspell:disable */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, Alert } from '../../../types';

interface AlertsDashboardWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
  onAlertClick?: (alert: Alert, campaign: Campaign) => void;
}

export const AlertsDashboardWidget: React.FC<AlertsDashboardWidgetProps> = ({
  campaigns,
  onDrillIn,
  onAlertClick
}) => {
  const alertsData = useMemo(() => {
    const allAlerts: { alert: Alert; campaign: Campaign }[] = [];
    
    campaigns.forEach(campaign => {
      if (campaign.alerts && campaign.alerts.length > 0) {
        campaign.alerts.forEach(alert => {
          allAlerts.push({ alert, campaign });
        });
      }
    });

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    allAlerts.sort((a, b) => {
      const severityDiff = severityOrder[a.alert.severity] - severityOrder[b.alert.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.alert.timestamp).getTime() - new Date(a.alert.timestamp).getTime();
    });

    const critical = allAlerts.filter(a => a.alert.severity === 'critical');
    const warning = allAlerts.filter(a => a.alert.severity === 'warning');
    const info = allAlerts.filter(a => a.alert.severity === 'info');

    return {
      all: allAlerts,
      critical,
      warning,
      info,
      total: allAlerts.length
    };
  }, [campaigns]);

  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return { color: '#EF4444', bgColor: 'bg-red-500/10', icon: AlertCircle, label: 'Critical' };
      case 'warning':
        return { color: '#EAB308', bgColor: 'bg-amber-500/10', icon: AlertTriangle, label: 'Warning' };
      case 'info':
        return { color: '#3B82F6', bgColor: 'bg-blue-500/10', icon: Info, label: 'Info' };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <WidgetContainer
      title="Active Alerts"
      icon={<Bell className="w-4 h-4" />}
      accentColor="#EF4444"
      onDrillIn={onDrillIn}
      drillInLabel="View all alerts"
      badge={
        alertsData.critical.length > 0 ? (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium animate-pulse">
            {alertsData.critical.length} critical
          </span>
        ) : null
      }
    >
      {alertsData.total === 0 ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-white/70 text-base">All clear! No active alerts.</p>
        </div>
      ) : (
        <>
          {/* Summary counts */}
          <div className="flex gap-4 mb-4">
            {alertsData.critical.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-red-400 text-sm font-medium">{alertsData.critical.length} Critical</span>
              </div>
            )}
            {alertsData.warning.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-amber-400 text-sm font-medium">{alertsData.warning.length} Warning</span>
              </div>
            )}
            {alertsData.info.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-blue-400 text-sm font-medium">{alertsData.info.length} Info</span>
              </div>
            )}
          </div>

          {/* Alert list (show top 4) */}
          <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {alertsData.all.slice(0, 4).map(({ alert, campaign }, index) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;
                
                return (
                  <motion.button
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onAlertClick?.(alert, campaign)}
                    className={`w-full ${config.bgColor} rounded-xl p-3.5 text-left group hover:brightness-110 transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-base font-medium truncate">
                          {campaign.name}
                        </p>
                        <p className="text-white/50 text-sm mt-0.5 line-clamp-1">
                          {alert.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-white/40 text-sm">{formatTimeAgo(alert.timestamp)}</span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* More alerts indicator */}
          {alertsData.total > 4 && (
            <div className="mt-3 text-center">
              <span className="text-white/40 text-sm">
                +{alertsData.total - 4} more alerts
              </span>
            </div>
          )}
        </>
      )}
    </WidgetContainer>
  );
};
