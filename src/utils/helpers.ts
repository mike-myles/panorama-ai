import { AlertSeverity } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

export const getAlertColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'text-critical';
    case 'warning':
      return 'text-warning';
    case 'info':
      return 'text-primary';
  }
};

export const getAlertBgColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-critical';
    case 'warning':
      return 'bg-warning';
    case 'info':
      return 'bg-primary';
  }
};

export const getStatusColor = (status: 'active' | 'paused' | 'at_risk'): string => {
  switch (status) {
    case 'active':
      return 'text-success';
    case 'paused':
      return 'text-gray-400';
    case 'at_risk':
      return 'text-warning';
  }
};

export const getChannelColor = (channel: string): string => {
  const colors: Record<string, string> = {
    search: '#3B82F6',
    social: '#A855F7',
    display: '#F97316',
    email: '#10B981',
    video: '#EC4899'
  };
  return colors[channel] || '#6B7280';
};

export const getDepthBlurClass = (layerDistance: number): string => {
  // Reduced blur amounts for better readability
  if (layerDistance === 0) return '';
  if (layerDistance === 1) return 'blur-[1px] opacity-85';
  if (layerDistance === 2) return 'blur-[3px] opacity-65';
  return 'blur-[6px] opacity-40';
};

export const getAlertSize = (severity: AlertSeverity, currentLayer: number, alertLayer: number): number => {
  const baseSize = severity === 'critical' ? 24 : severity === 'warning' ? 20 : 16;
  const layerDistance = Math.abs(currentLayer - alertLayer);
  return baseSize + (3 - layerDistance) * 4;
};

export const getPulseAnimation = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'animate-pulse-fast';
    case 'warning':
      return 'animate-pulse-medium';
    case 'info':
      return 'animate-pulse-slow';
  }
};

export const getParallaxSpeed = (layer: number): number => {
  return 1 - (layer * 0.2);
};

