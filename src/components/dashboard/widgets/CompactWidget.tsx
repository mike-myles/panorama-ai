/* cspell:disable */
import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface CompactWidgetProps {
  title: string;
  icon: ReactNode;
  primaryValue: string | number;
  primaryLabel?: string;
  accentColor?: string;
  badge?: ReactNode;
  expandedContent?: ReactNode;
  onDrillIn?: () => void;
  drillInLabel?: string;
  className?: string;
  delay?: number;
  statusIndicator?: 'success' | 'warning' | 'critical' | 'neutral';
  secondaryMetrics?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

export const CompactWidget: React.FC<CompactWidgetProps> = ({
  title,
  icon,
  primaryValue,
  primaryLabel,
  accentColor = '#a3a3a3',
  badge,
  expandedContent,
  onDrillIn,
  drillInLabel = 'View details',
  className = '',
  delay = 0,
  statusIndicator,
  secondaryMetrics
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    success: '#22C55E',
    warning: '#EAB308',
    critical: '#EF4444',
    neutral: '#6B7280'
  };

  const indicatorColor = statusIndicator ? statusColors[statusIndicator] : accentColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(14, 14, 18, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isHovered 
            ? '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
        animate={{
          scale: isHovered ? 1.02 : 1,
          borderColor: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)'
        }}
        transition={{ duration: 0.2 }}
        onClick={onDrillIn}
      >
        {/* Metallic top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Accent line at top */}
        <div 
          className="absolute top-0 left-0 h-[2px] transition-all duration-300"
          style={{ 
            background: `linear-gradient(90deg, ${indicatorColor}, transparent)`,
            width: isHovered ? '60%' : '40%'
          }}
        />

        {/* Status pulse indicator */}
        {statusIndicator && (
          <motion.div
            className="absolute top-3 right-3 w-2 h-2 rounded-full"
            style={{ backgroundColor: indicatorColor }}
            animate={statusIndicator === 'critical' ? { 
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Compact Content */}
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ color: accentColor }} className="opacity-90 [&>svg]:w-3.5 [&>svg]:h-3.5">
                  {icon}
                </div>
              </div>
              <span className="text-white/60 text-xs font-medium tracking-wide uppercase">
                {title}
              </span>
            </div>
            {badge}
          </div>

          {/* Primary metric */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white/95">{primaryValue}</span>
            {primaryLabel && (
              <span className="text-white/40 text-xs">{primaryLabel}</span>
            )}
          </div>

          {/* Secondary metrics (always visible, compact) */}
          {secondaryMetrics && secondaryMetrics.length > 0 && (
            <div className="flex gap-4 mt-2">
              {secondaryMetrics.slice(0, 3).map((metric, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="text-white/40 text-[10px]">{metric.label}:</span>
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: metric.color || '#ffffff90' }}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Content on Hover */}
        <AnimatePresence>
          {isHovered && expandedContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-white/[0.06]">
                {expandedContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drill-in hint on hover */}
        <AnimatePresence>
          {isHovered && onDrillIn && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-white/40"
            >
              <span>{drillInLabel}</span>
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover glow effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)'
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

// Mini metric tile for hero KPIs
interface MiniMetricTileProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: ReactNode;
  accentColor: string;
  subtitle?: string;
  onClick?: () => void;
  expandedContent?: ReactNode;
  delay?: number;
}

export const MiniMetricTile: React.FC<MiniMetricTileProps> = ({
  title,
  value,
  trend,
  icon,
  accentColor,
  subtitle,
  onClick,
  expandedContent,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.4 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className="relative backdrop-blur-xl rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(14, 14, 18, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        animate={{
          scale: isHovered ? 1.03 : 1,
          boxShadow: isHovered 
            ? '0 12px 40px rgba(0, 0, 0, 0.5)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Accent top line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent 70%)` }}
        />

        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ 
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`
              }}
            >
              <div style={{ color: accentColor }} className="opacity-90 [&>svg]:w-3 [&>svg]:h-3">
                {icon}
              </div>
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                trend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </div>
            )}
          </div>

          <div className="text-xl font-bold text-white/95 leading-tight">{value}</div>
          <div className="text-[10px] text-white/50 uppercase tracking-wider">{title}</div>
          {subtitle && (
            <div className="text-[10px] text-white/30 mt-0.5">{subtitle}</div>
          )}
        </div>

        {/* Expanded content on hover */}
        <AnimatePresence>
          {isHovered && expandedContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/[0.06]"
            >
              <div className="p-3 pt-2">
                {expandedContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover glow */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 60%)`
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </motion.div>
    </motion.div>
  );
};

// Status bar for quick visual scanning
interface StatusBarProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  height?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ segments, height = 4 }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex gap-0.5 rounded-full overflow-hidden" style={{ height }}>
      {segments.map((segment, idx) => (
        <motion.div
          key={idx}
          initial={{ width: 0 }}
          animate={{ width: `${(segment.value / total) * 100}%` }}
          transition={{ duration: 0.6, delay: idx * 0.1 }}
          style={{ backgroundColor: segment.color }}
          className="h-full first:rounded-l-full last:rounded-r-full"
          title={segment.label}
        />
      ))}
    </div>
  );
};

// Channel mini card
interface ChannelMiniCardProps {
  name: string;
  icon: ReactNode;
  color: string;
  roas: number;
  trend: 'up' | 'down' | 'stable';
  spend: string;
  onClick?: () => void;
}

export const ChannelMiniCard: React.FC<ChannelMiniCardProps> = ({
  name,
  icon,
  color,
  roas,
  trend,
  spend,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      <div 
        className="p-2.5 rounded-xl transition-all duration-200"
        style={{
          background: isHovered 
            ? 'linear-gradient(145deg, rgba(30, 30, 38, 0.95) 0%, rgba(20, 20, 26, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(22, 22, 28, 0.9) 0%, rgba(14, 14, 18, 0.95) 100%)',
          border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }} className="[&>svg]:w-3 [&>svg]:h-3">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/80 text-[11px] font-medium truncate">{name}</div>
            <div className="flex items-center gap-2">
              <span className="text-white/95 text-xs font-bold">{roas.toFixed(1)}x</span>
              <span className={`text-[10px] ${
                trend === 'up' ? 'text-green-400' : 
                trend === 'down' ? 'text-red-400' : 'text-white/40'
              }`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Expanded on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-white/[0.06]"
            >
              <div className="text-[10px] text-white/40">
                Spend: <span className="text-white/70">{spend}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
