import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert } from '../types';
import { getAlertBgColor, getPulseAnimation } from '../utils/helpers';
import { useDashboard } from '../context/DashboardContext';

interface AlertBadgeProps {
  alert: Alert;
  size?: number;
  showCount?: boolean;
  count?: number;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ 
  alert, 
  size = 24,
  showCount = false,
  count = 1
}) => {
  const { openQuickActionsPanel, setFocusedCampaign, setZoomLevel } = useDashboard();

  const handleClick = () => {
    if (alert.campaignId) {
      setFocusedCampaign(alert.campaignId);
      // Navigate to the appropriate layer
      if (alert.layer >= 2) {
        setZoomLevel(alert.layer * 20 + 10);
      }
    }
    openQuickActionsPanel(alert.id);
  };

  const Icon = alert.severity === 'critical' 
    ? AlertCircle 
    : alert.severity === 'warning' 
    ? AlertTriangle 
    : Info;

  const bgColor = getAlertBgColor(alert.severity);
  const pulseClass = getPulseAnimation(alert.severity);

  return (
    <motion.button
      onClick={handleClick}
      className={`relative ${bgColor} ${pulseClass} rounded-full p-2 shadow-lg hover:scale-110 transition-transform`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={alert.message}
    >
      <Icon className="w-full h-full text-white" />
      {showCount && count > 1 && (
        <div className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-gray-900">
          {count}
        </div>
      )}
      <div className={`absolute inset-0 ${bgColor} rounded-full blur-md ${pulseClass}`} style={{ zIndex: -1 }} />
    </motion.button>
  );
};

interface AlertBadgeGroupProps {
  alerts: Alert[];
  maxVisible?: number;
}

export const AlertBadgeGroup: React.FC<AlertBadgeGroupProps> = ({ 
  alerts, 
  maxVisible = 3 
}) => {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const remainingCount = Math.max(0, alerts.length - maxVisible);

  return (
    <div className="flex items-center gap-2">
      {visibleAlerts.map((alert) => (
        <AlertBadge key={alert.id} alert={alert} />
      ))}
      {remainingCount > 0 && (
        <div className="bg-gray-700 text-white text-xs font-semibold rounded-full px-3 py-1">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

