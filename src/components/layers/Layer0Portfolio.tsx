/* cspell:disable-file */
/* Dashboard Redesign v2 - Updated 2026-01-12 */
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Target, ArrowUp, ArrowDown, Search, Share2, Monitor, Mail, Video,
  Rocket, AlertTriangle, BarChart3, Users, Activity, Star, Bell,
  ChevronRight, Layers, PieChart, Sparkles, Calendar
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/helpers';
import { DataPopover } from '../DataPopover';
import { LifecycleStage, FunnelStage } from '../../types';
import { DrillInModal, CampaignList, LifecycleFilter, FunnelFilter } from '../dashboard/DrillInModal';

const iconMap: Record<string, any> = {
  Search,
  Share2,
  Monitor,
  Mail,
  Video
};

// Semantic Color System - WCAG AA compliant colors for better accessibility
const COLORS = {
  performance: '#22C55E',    // Green - ROAS, Revenue, Growth
  operational: '#3B82F6',    // Blue - Budget, Spend, Financial
  status: '#8B5CF6',         // Purple - Active campaigns, Lifecycle
  alerts: '#F87171',         // Lighter Red - Problems, At Risk, Urgent (better contrast)
  intelligence: '#FCD34D',   // Brighter Yellow - AI Actions, Recommendations (WCAG AA)
  neutral: '#9CA3AF',        // Lighter Gray - Secondary info (better contrast)
  warning: '#FBBF24',        // Bright Amber - Warnings (WCAG AA compliant)
  critical: '#FCA5A5'        // Light Red - Critical alerts (better contrast on dark)
};

// Channel Performance inspired color palette for data visualizations
const LIFECYCLE_COLORS: Record<string, string> = {
  planning: '#3B82F6',     // Blue
  development: '#F97316',  // Orange
  qa_ready: '#A855F7',     // Purple
  launching: '#EC4899',    // Pink
  active: '#10B981',       // Emerald
  closing: '#6B7280',      // Gray
  ideation: '#3B82F6'      // Blue
};

const LIFECYCLE_LABELS: Record<string, string> = {
  planning: 'Planning',
  development: 'Development',
  qa_ready: 'QA Ready',
  launching: 'Launching',
  active: 'Active',
  closing: 'Closing',
  ideation: 'Ideation'
};

// Workflow order: completion-first view (most mature stages at top)
const WORKFLOW_ORDER: LifecycleStage[] = ['closing', 'active', 'launching', 'qa_ready', 'development', 'planning'];

// Funnel colors aligned with Channel Performance palette
const FUNNEL_COLORS: Record<string, string> = {
  awareness: '#3B82F6',     // Blue
  consideration: '#A855F7', // Purple (from Channel Performance)
  conversion: '#10B981',    // Emerald (from Channel Performance)
  retention: '#F97316'      // Orange (from Channel Performance)
};

const FUNNEL_LABELS: Record<string, string> = {
  awareness: 'Awareness',
  consideration: 'Consideration',
  conversion: 'Conversion',
  retention: 'Retention'
};

const FUNNEL_BENCHMARK: Record<string, number> = {
  awareness: 30,
  consideration: 30,
  conversion: 30,
  retention: 10
};

const EXPECTED_CAPACITY_PER_PERSON = 13;

// Base Widget Card Component with consistent styling
interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
  cosmosLink?: boolean;
  insightText?: React.ReactNode;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  accentColor,
  children,
  onClick,
  badge,
  className = '',
  cosmosLink = false,
  insightText
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.005, y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="relative h-full backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
        style={{
          // Dark glassmorphic tile - light blackish with subtle transparency
          background: isHovered
            ? 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(16, 16, 20, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(20, 20, 26, 0.92) 0%, rgba(14, 14, 18, 0.96) 100%)',
          // Subtle border for definition
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.12)' 
            : '1px solid rgba(255, 255, 255, 0.07)',
          // Soft shadow for depth
          boxShadow: isHovered 
            ? '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)' 
            : '0 6px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        }}
      >
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`
                }}
              >
                <div style={{ color: accentColor }} className="[&>svg]:w-5 [&>svg]:h-5">
                  {icon}
                </div>
              </div>
              <span className="text-white text-xs font-semibold tracking-wider uppercase">
                {title}
              </span>
            </div>
            {badge}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>

          {/* Insight footer */}
          {insightText && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex-shrink-0">
              <div className="text-sm text-white/50">
                {insightText}
              </div>
            </div>
          )}

          {/* Click hint with cosmos link option */}
          {onClick && (
            <motion.div 
              className="flex items-center gap-1 mt-2 text-xs text-white/40 flex-shrink-0"
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              <span>{cosmosLink ? '🌌 View in Cosmos' : 'Click to explore'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </div>

        {/* Hover glow */}
        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${accentColor}06 0%, transparent 40%)` }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </div>
    </motion.div>
  );
};

// Hero Portfolio Health Card with Circular Gauge
const PortfolioHealthHero: React.FC<{
  healthScore: number;
  metrics: { label: string; score: number; color: string }[];
  areasNeedingAttention: number;
  onClick: () => void;
}> = ({ healthScore, metrics, areasNeedingAttention, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Portfolio Health thresholds - aligned with UX audit recommendations
  // More meaningful status labels that reflect actual performance quality
  const getScoreLabel = (score: number) => {
    if (score >= 86) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 51) return 'Needs Attention';
    return 'Critical';
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <motion.div
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.005, y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="relative h-full backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{
          // Dark glassmorphic tile - light blackish with subtle transparency
          background: isHovered
            ? 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(16, 16, 20, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(20, 20, 26, 0.92) 0%, rgba(14, 14, 18, 0.96) 100%)',
          // Subtle border for definition
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.12)' 
            : '1px solid rgba(255, 255, 255, 0.07)',
          // Soft shadow for depth
          boxShadow: isHovered 
            ? '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)' 
            : '0 6px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        }}
      >
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="p-5 h-full flex flex-col">
          {/* Header with Portfolio Health title */}
          <div className="flex items-center gap-2.5 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B15, #FBBF2420)', border: '1px solid #FBBF2430' }}
            >
              <Star className="w-5 h-5" style={{ color: '#FBBF24' }} />
            </div>
            <span className="text-white text-xs font-semibold tracking-wider uppercase">
              Portfolio Health
            </span>
          </div>
          
          <div className="flex-1 flex gap-6">
            {/* Left: Circular Gauge */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <svg width="130" height="130" viewBox="0 0 130 130">
                  {/* Gradient definition for the score arc */}
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>
                  <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle
                    cx="65" cy="65" r={radius}
                    fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    transform="rotate(-90 65 65)"
                  />
                  <circle cx="65" cy="65" r="44" fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0.15" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white"
                  >
                    {healthScore}
                  </motion.span>
                  <span className="text-white/30 text-xs">/100</span>
                </div>
              </div>
              {/* Status label placed below the circular gauge */}
              <span className="text-sm font-semibold mt-2" style={{ color: '#FBBF24' }}>
                    {getScoreLabel(healthScore)}
                  </span>
            </div>

            {/* Right: Metrics breakdown */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white/60 text-xs truncate">{metric.label}</span>
                        <span className={`text-xs font-semibold ${
                          metric.score >= 75 ? 'text-green-400' :
                          metric.score >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {metric.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ 
                            width: `${metric.score}%`,
                            background: `linear-gradient(90deg, ${metric.color}50, ${metric.color}90)`
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {areasNeedingAttention > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.warning }}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{areasNeedingAttention} area{areasNeedingAttention > 1 ? 's' : ''} need attention</span>
                  </div>
                </div>
              )}

              <motion.div 
                className="flex items-center gap-1 mt-2 text-xs text-white/40"
                animate={{ opacity: isHovered ? 1 : 0 }}
              >
                <span>View detailed report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #FBBF2406 0%, transparent 40%)' }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </div>
    </motion.div>
  );
};

// Compact KPI Card for Row 1
const KPICard: React.FC<{
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  onClick?: () => void;
  badge?: React.ReactNode;
  progressBar?: { value: number; color: string };
  subMetric?: React.ReactNode;
}> = ({ title, icon, accentColor, value, subtitle, trend, onClick, badge, progressBar, subMetric }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="relative h-full backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
        style={{
          // Dark glassmorphic tile - light blackish with subtle transparency
          background: isHovered
            ? 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(16, 16, 20, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(20, 20, 26, 0.92) 0%, rgba(14, 14, 18, 0.96) 100%)',
          // Subtle border for definition
          border: isHovered 
            ? '1px solid rgba(255, 255, 255, 0.12)' 
            : '1px solid rgba(255, 255, 255, 0.07)',
          // Soft shadow for depth
          boxShadow: isHovered 
            ? '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)' 
            : '0 6px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        }}
      >
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
              >
                <div style={{ color: accentColor }} className="[&>svg]:w-5 [&>svg]:h-5">
                  {icon}
                </div>
              </div>
              <span className="text-white text-xs font-semibold tracking-wider uppercase">
                {title}
              </span>
            </div>
            {badge}
          </div>

          {/* Value */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{value}</span>
              {trend && (
                <span className={`text-sm font-semibold flex items-center gap-0.5 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && <span className="text-xs text-white/40 mt-0.5">{subtitle}</span>}
            {subMetric && <div className="mt-1">{subMetric}</div>}
          </div>
          
          {/* Progress bar */}
          {progressBar && (
            <div className="mt-2 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, progressBar.value)}%`, background: `linear-gradient(90deg, ${progressBar.color}50, ${progressBar.color}90)` }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Mini Sparkline Component
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, height = 24 }) => {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = data[data.length - 1] > data[0];

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? COLORS.performance : COLORS.alerts}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Layer0Portfolio: React.FC = () => {
  const { data, setZoomLevel, zoomState, setFocusedChannel, setActiveView } = useDashboard();
  const { portfolio, channels, campaigns } = data;
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [popoverData, setPopoverData] = useState<any>(null);
  const [popoverPosition, _setPopoverPosition] = useState({ x: 0, y: 0 });

  const [drillInModal, setDrillInModal] = useState<{ type: string; isOpen: boolean }>({ type: '', isOpen: false });
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleStage[]>([]);
  const [funnelFilter, setFunnelFilter] = useState<FunnelStage[]>([]);

  useEffect(() => {
    const handleToggle = () => setIsTimelineExpanded(prev => !prev);
    window.addEventListener('toggleHistoricalView', handleToggle);
    return () => window.removeEventListener('toggleHistoricalView', handleToggle);
  }, []);

  useEffect(() => {
    const event = new CustomEvent('historicalViewState', { detail: { open: isTimelineExpanded } });
    window.dispatchEvent(event);
  }, [isTimelineExpanded]);

  // Compute all dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourWeeks = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    // Filter out archived campaigns for main calculations
    const activeCampaigns = campaigns.filter(c => c.lifecycleStage !== 'closing' || c.status === 'active');
    const archivedCount = campaigns.filter(c => c.lifecycleStage === 'closing' && c.status !== 'active').length;
    
    // Launch Pipeline with timeline grouping
    const upcoming = campaigns.filter(c => {
      const d = new Date(c.targetLaunchDate);
      return d >= now && d <= ninetyDays;
    });
    
    const week1 = upcoming.filter(c => new Date(c.targetLaunchDate) <= oneWeek);
    const weeks2to4 = upcoming.filter(c => {
      const d = new Date(c.targetLaunchDate);
      return d > oneWeek && d <= fourWeeks;
    });
    const months2to3 = upcoming.filter(c => {
      const d = new Date(c.targetLaunchDate);
      return d > fourWeeks && d <= ninetyDays;
    });

    const getReadinessBreakdown = (list: typeof campaigns) => ({
      atRisk: list.filter(c => c.readinessPercent < 50).length,
      needsAttention: list.filter(c => c.readinessPercent >= 50 && c.readinessPercent < 80).length,
      ready: list.filter(c => c.readinessPercent >= 80).length
    });

    // Critical launches (within 5 days at <50% ready)
    const fiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const criticalLaunches = upcoming.filter(c => 
      new Date(c.targetLaunchDate) <= fiveDays && c.readinessPercent < 50
    );

    // Lifecycle Distribution with workflow order
    const lifecycle: Record<string, number> = {};
    activeCampaigns.forEach(c => {
      lifecycle[c.lifecycleStage] = (lifecycle[c.lifecycleStage] || 0) + 1;
    });
    
    // Calculate expected per stage (equal distribution for simplicity)
    const expectedPerStage = Math.round(activeCampaigns.length / WORKFLOW_ORDER.length);
    const bottleneckStages = Object.entries(lifecycle).filter(([_, count]) => 
      count > expectedPerStage * 1.5
    );

    // Funnel Balance with benchmarks
    const funnel: Record<string, number> = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
    const funnelSpend: Record<string, number> = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
    campaigns.forEach(c => {
      funnel[c.funnelStage] = (funnel[c.funnelStage] || 0) + 1;
      funnelSpend[c.funnelStage] = (funnelSpend[c.funnelStage] || 0) + c.spent;
    });
    const funnelTotal = Object.values(funnel).reduce((a, b) => a + b, 0);
    const funnelPercentages = Object.fromEntries(
      Object.entries(funnel).map(([k, v]) => [k, Math.round((v / funnelTotal) * 100)])
    );
    const funnelImbalances = Object.entries(funnelPercentages).map(([stage, pct]) => ({
      stage,
      actual: pct,
      benchmark: FUNNEL_BENCHMARK[stage as FunnelStage],
      diff: pct - FUNNEL_BENCHMARK[stage as FunnelStage]
    })).filter(f => Math.abs(f.diff) >= 5);

    // Alerts
    const alerts = campaigns.filter(c => c.alert);
    const critical = alerts.filter(c => c.alerts?.some(a => a.severity === 'critical')).length;
    const warning = alerts.filter(c => c.alerts?.some(a => a.severity === 'warning') && !c.alerts?.some(a => a.severity === 'critical')).length;

    // ROAS Distribution
    const excellent = campaigns.filter(c => c.roas >= 4).length;
    const good = campaigns.filter(c => c.roas >= 2 && c.roas < 4).length;
    const fair = campaigns.filter(c => c.roas >= 1 && c.roas < 2).length;
    const poor = campaigns.filter(c => c.roas < 1).length;
    const roasPercentages = {
      excellent: Math.round((excellent / campaigns.length) * 100),
      good: Math.round((good / campaigns.length) * 100),
      fair: Math.round((fair / campaigns.length) * 100),
      poor: Math.round((poor / campaigns.length) * 100)
    };

    // Budget & Financials
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const avgRoas = campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length;
    const avgReadiness = campaigns.reduce((s, c) => s + c.readinessPercent, 0) / campaigns.length;
    const totalRevenue = totalSpent * avgRoas;

    // ============================================================================
    // HEALTH SCORE CALCULATION - USING PORTFOLIO VALUES DIRECTLY (SAME AS COSMOS)
    // These values are pre-computed in mockData3.ts from actual campaign data
    // This ensures 100% consistency between Cosmos sun and Dashboard widget
    // ============================================================================
    
    // 1. Portfolio ROAS Score (target > 4.0 for 100 score)
    // Using portfolio.totalROAS - computed from actual campaign spend/revenue
    const roasScore = Math.min(100, Math.round((portfolio.totalROAS / 4.0) * 100));
    
    // 2. Lifecycle Velocity Score - using portfolio.lifecycleVelocity
    // Pre-computed as % of campaigns at or beyond expected lifecycle stage
    const velocityScore = portfolio.lifecycleVelocity || 80;
    
    // 3. Alert Coverage Ratio Score - using portfolio.alertCoverageRatio
    // alertCoverageRatio is proportion (0-1) of campaigns with alerts
    const alertRatio = portfolio.alertCoverageRatio || 0;
    const alertScore = Math.max(0, Math.round(100 - (alertRatio * 333))); // <10% = 100, 30% = 0
    
    // 4. Funnel Balance Score - using portfolio.funnelCoverageBalance
    // funnelCoverageBalance is variance measure (lower is better)
    const funnelVariance = portfolio.funnelCoverageBalance || 0;
    const balanceScore = Math.max(0, Math.round(100 - (funnelVariance * 500))); // 0 = 100, 0.2 = 0
    
    // Weighted composite score - IDENTICAL WEIGHTS TO COSMOS VIEW
    const healthScore = Math.round(
      roasScore * 0.35 +      // ROAS is most important (35%)
      velocityScore * 0.25 +  // Lifecycle velocity (25%)
      alertScore * 0.25 +     // Alert coverage (25%)
      balanceScore * 0.15     // Funnel balance (15%)
    );
    
    // Budget utilization (kept separate)
    const budgetUtil = Math.round((totalSpent / totalBudget) * 100);
    
    const healthMetrics = [
      { label: 'Portfolio ROAS', score: roasScore, color: COLORS.performance },
      { label: 'Lifecycle Velocity', score: velocityScore, color: '#8B5CF6' },
      { label: 'Alert Ratio', score: alertScore, color: COLORS.intelligence },
      { label: 'Funnel Balance', score: balanceScore, color: COLORS.operational }
    ];
    const areasNeedingAttention = healthMetrics.filter(m => m.score < 75).length;

    // Team Workload
    const team: Record<string, { count: number; campaigns: typeof campaigns }> = {};
    let unassignedCount = 0;
    campaigns.forEach(c => {
      if (!c.owner || c.owner === 'Unassigned') {
        unassignedCount++;
      } else {
        if (!team[c.owner]) team[c.owner] = { count: 0, campaigns: [] };
        team[c.owner].count++;
        team[c.owner].campaigns.push(c);
      }
    });
    const teamList = Object.entries(team)
      .map(([name, data]) => ({ 
        name, 
        count: data.count,
        overCapacity: data.count > EXPECTED_CAPACITY_PER_PERSON,
        capacityPercent: Math.round((data.count / EXPECTED_CAPACITY_PER_PERSON) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    const totalCapacity = teamList.length * EXPECTED_CAPACITY_PER_PERSON;

    // Channel Performance with all 5 channels
    const channelData = channels.map(channel => {
      const channelCampaigns = campaigns.filter(c => c.channel === channel.id);
      const avgChannelRoas = channelCampaigns.length > 0
        ? channelCampaigns.reduce((sum, c) => sum + c.roas, 0) / channelCampaigns.length
        : 0;
      const trend = channel.trend;
      const trendStart = trend[0] || 0;
      const trendEnd = trend[trend.length - 1] || 0;
      const trendChange = trendStart > 0 ? Math.round(((trendEnd - trendStart) / trendStart) * 100) : 0;
      const totalChannelSpend = channelCampaigns.reduce((sum, c) => sum + c.spent, 0);

    return {
        ...channel,
        avgRoas: avgChannelRoas,
        trendChange,
        isGaining: trendChange > 5,
        isDeclining: trendChange < -5,
        campaignCount: channelCampaigns.length,
        totalSpend: totalChannelSpend,
        sparklineData: trend
      };
    });

    // Recent Activity with specific action types
    const recentActivity = campaigns
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 10)
      .map((c) => {
        const type = c.alert ? '⚠️ Alert:' : c.status === 'paused' ? '⏸️ Paused:' : '✏️ Updated:';
        return {
          campaign: c,
          type,
          actor: c.createdBy || c.owner,
          timeAgo: getTimeAgo(new Date(c.lastModified))
        };
      });

    // Quarterly Budget Pacing
    const quarterlyBudget = campaigns.reduce((acc, c) => {
      const date = new Date(c.targetLaunchDate);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      if (!acc[quarter]) acc[quarter] = { budget: 0, spent: 0, allocated: 0 };
      acc[quarter].budget += c.budget;
      acc[quarter].spent += c.spent;
      acc[quarter].allocated += c.budget;
      return acc;
    }, {} as Record<string, { budget: number; spent: number; allocated: number }>);

    return {
      pipeline: { 
        total: upcoming.length,
        week1: { campaigns: week1, ...getReadinessBreakdown(week1) },
        weeks2to4: { campaigns: weeks2to4, ...getReadinessBreakdown(weeks2to4) },
        months2to3: { campaigns: months2to3, ...getReadinessBreakdown(months2to3) },
        criticalLaunches
      },
      lifecycle,
      bottleneckStages,
      expectedPerStage,
      archivedCount,
      funnel,
      funnelPercentages,
      funnelSpend,
      funnelImbalances,
      alerts: { total: alerts.length, critical, warning },
      roas: { excellent, good, fair, poor, avg: avgRoas, percentages: roasPercentages },
      budget: { spent: totalSpent, total: totalBudget, util: budgetUtil, revenue: totalRevenue },
      health: healthScore,
      healthMetrics,
      areasNeedingAttention,
      readiness: Math.round(avgReadiness),
      team: teamList,
      unassignedCount,
      totalCapacity,
      active: campaigns.filter(c => c.status === 'active').length,
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      scaleOpps: campaigns.filter(c => c.roas > 4 && (c.spent / c.budget) < 0.7).length,
      underperformers: campaigns.filter(c => c.roas < 1.5 && c.spent > 10000).length,
      channels: channelData,
      recentActivity,
      quarterlyBudget
    };
  }, [campaigns, channels]);

  const handleChannelClick = (channelId: string) => {
    setFocusedChannel(channelId);
    setZoomLevel(75);
  };

  const openDrillIn = (type: string) => setDrillInModal({ type, isOpen: true });
  const closeDrillIn = () => {
    setDrillInModal({ type: '', isOpen: false });
    setLifecycleFilter([]);
    setFunnelFilter([]);
  };
  const navigateToCosmos = () => { closeDrillIn(); setActiveView('cosmos'); };

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    if (lifecycleFilter.length > 0) filtered = filtered.filter(c => lifecycleFilter.includes(c.lifecycleStage));
    if (funnelFilter.length > 0) filtered = filtered.filter(c => funnelFilter.includes(c.funnelStage));
    return filtered;
  }, [campaigns, lifecycleFilter, funnelFilter]);

  if (zoomState.level > 30) return null;
  const opacity = Math.max(0, 1 - (zoomState.level / 30));
  const blur = zoomState.level > 20 ? (zoomState.level - 20) / 10 * 8 : 0;

  return (
    <motion.div
      key="layer0-portfolio"
      className="h-[calc(100vh-73px)]"
      style={{ 
        opacity, 
        filter: `blur(${blur}px)`, 
        pointerEvents: 'auto', 
        zIndex: 10,
        overflow: 'auto',
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: '102px',
        paddingRight: '102px',
        paddingTop: '24px',
        paddingBottom: '40px'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Grid - Dashboard Layout with consistent spacing */}
      <div 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '100%',
          width: '100%',
          padding: '0 16px'
        }}
      >
        
        {/* ROW 1: EXECUTIVE SUMMARY - 12-col grid: 6 / 2 / 2 / 2 */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '16px', minHeight: '120px' }}>
          <div className="col-span-6">
            <PortfolioHealthHero
              healthScore={metrics.health}
              metrics={metrics.healthMetrics}
              areasNeedingAttention={metrics.areasNeedingAttention}
              onClick={() => openDrillIn('portfolio-health')}
            />
          </div>

          {/* Avg ROAS - Performance with tier breakdown */}
          <div className="col-span-2">
            <KPICard
              title="Avg ROAS"
              icon={<TrendingUp />}
              accentColor={COLORS.performance}
              value={`${metrics.roas.avg.toFixed(1)}x`}
              subtitle={formatCurrency(metrics.budget.revenue)}
              trend={{ value: portfolio.roasTrend, positive: portfolio.roasTrend >= 0 }}
              onClick={() => openDrillIn('roas-distribution')}
              subMetric={
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-green-400">{metrics.roas.excellent} excellent</span>
                  <span className="text-white/30">|</span>
                  <span className="text-red-400">{metrics.roas.poor} poor</span>
                </div>
              }
            />
          </div>

          {/* Budget Health - Operational with Pacing Context */}
          <div className="col-span-2">
            <KPICard
              title="Budget Health"
              icon={<DollarSign />}
              accentColor={COLORS.operational}
              value={`${metrics.budget.util}%`}
              subtitle={`${formatCurrency(metrics.budget.spent)} of ${formatCurrency(metrics.budget.total)}`}
              progressBar={{ value: metrics.budget.util, color: metrics.budget.util <= 85 ? COLORS.operational : '#EAB308' }}
              onClick={() => openDrillIn('budget-pacing')}
              subMetric={(() => {
              // Calculate pacing context: current day of quarter vs expected spend
              const now = new Date();
              const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
              const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
              const daysInQuarter = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
              const dayOfQuarter = Math.ceil((now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
              const expectedPct = Math.round((dayOfQuarter / daysInQuarter) * 100);
              const pacingDiff = metrics.budget.util - expectedPct;
              const isPacingAhead = pacingDiff > 5;
              const isPacingBehind = pacingDiff < -5;
              const remaining = metrics.budget.total - metrics.budget.spent;
              
              return (
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-medium ${
                    isPacingAhead ? 'text-amber-400' : isPacingBehind ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {isPacingAhead ? `↑ ${pacingDiff}% ahead` : isPacingBehind ? `↓ ${Math.abs(pacingDiff)}% behind` : '✓ On pace'} (Day {dayOfQuarter}/{daysInQuarter})
                  </span>
                  <span className="text-xs text-white/40">
                    {formatCurrency(remaining)} remaining
                  </span>
                </div>
              );
            })()}
            />
          </div>

          {/* Active & Alerts Combined - Status with Better Context */}
          <div className="col-span-2">
            <KPICard
              title="Active"
              icon={<Target />}
              accentColor={COLORS.status}
              value={metrics.active}
              subtitle={`of ${metrics.totalCampaigns} total`}
              onClick={() => setActiveView('cosmos')}
              badge={metrics.alerts.total > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-xs rounded-full font-semibold flex items-center gap-0.5" style={{ color: COLORS.critical }}>
                  <Bell className="w-2.5 h-2.5" />
                  {metrics.alerts.total}
                </span>
              )}
              subMetric={
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    {metrics.alerts.critical > 0 && (
                      <span style={{ color: COLORS.critical }} className="font-medium">
                        {metrics.alerts.critical} critical
                      </span>
                    )}
                    {metrics.alerts.warning > 0 && (
                      <span style={{ color: COLORS.warning }}>
                        {metrics.alerts.warning} warning
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <span>{metrics.lifecycle.launching || 0} launching</span>
                    <span>•</span>
                    <span>{metrics.lifecycle.closing || 0} closing</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* ROW 2: OPERATIONAL PULSE - 12-col grid: 3 / 3 / 3 / 3 */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '16px', minHeight: '200px' }}>
          {/* Launch Pipeline - Timeline Based */}
          <div className="col-span-3">
          <WidgetCard
            title="Launch Pipeline"
            icon={<Rocket />}
            accentColor={COLORS.performance}
            onClick={() => openDrillIn('launch-pipeline')}
            badge={metrics.pipeline.criticalLaunches.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full font-medium animate-pulse">
                {metrics.pipeline.criticalLaunches.length} critical
              </span>
            )}
            insightText={
              <div className="space-y-1.5">
                {metrics.pipeline.criticalLaunches.length > 0 && (
                  <span className="block font-medium" style={{ color: COLORS.critical }}>
                    ⚠️ URGENT: {metrics.pipeline.criticalLaunches.length} campaign{metrics.pipeline.criticalLaunches.length > 1 ? 's' : ''} launch in 5 days at &lt;50% ready
              </span>
            )}
                <div className="flex items-center gap-3 text-white/40 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: 'linear-gradient(135deg, #EC489960, #EC489995)' }} />At Risk</span>
                  <span className="flex items-center gap-1"><span className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#F97316]" />Needs Attention</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #10B98160, #10B98195)' }} />Ready</span>
                </div>
              </div>
            }
          >
            <div className="space-y-3.5 flex-1">
              {/* Week 1 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white/70 font-medium">Week 1 (Next 7 days)</span>
                  <span className="text-sm text-white font-semibold">{metrics.pipeline.week1.campaigns.length}</span>
                </div>
                <div className="flex gap-1 h-2.5">
                  {metrics.pipeline.week1.atRisk > 0 && (
                    <div className="rounded-sm" style={{ flex: metrics.pipeline.week1.atRisk, background: 'linear-gradient(90deg, #EC489950, #EC489990)' }} title={`${metrics.pipeline.week1.atRisk} at risk`} />
                  )}
                  {metrics.pipeline.week1.needsAttention > 0 && (
                    <div className="rounded-sm" style={{ flex: metrics.pipeline.week1.needsAttention, background: 'linear-gradient(90deg, #F9731650, #F9731690)' }} title={`${metrics.pipeline.week1.needsAttention} needs attention`} />
                  )}
                  {metrics.pipeline.week1.ready > 0 && (
                    <div className="rounded-sm" style={{ flex: metrics.pipeline.week1.ready, background: 'linear-gradient(90deg, #10B98150, #10B98190)' }} title={`${metrics.pipeline.week1.ready} ready`} />
                  )}
                  {metrics.pipeline.week1.campaigns.length === 0 && <div className="bg-white/10 rounded-sm flex-1" />}
                </div>
                {/* Readiness breakdown with shapes for colorblind accessibility */}
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="flex items-center gap-1" style={{ color: COLORS.critical }}>
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(135deg, #EC489960, #EC489995)' }} title="At Risk (&lt;50%)" />
                    <span className="font-medium">{metrics.pipeline.week1.atRisk}</span>
                  </span>
                  <span className="flex items-center gap-1" style={{ color: COLORS.warning }}>
                    <span className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#F97316]" title="Needs Attention (50-80%)" />
                    <span className="font-medium">{metrics.pipeline.week1.needsAttention}</span>
                  </span>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, #10B98160, #10B98195)' }} title="Ready (&gt;80%)" />
                    <span className="font-medium">{metrics.pipeline.week1.ready}</span>
                  </span>
                </div>
              </div>

              {/* Weeks 2-4 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white/60">Weeks 2-4</span>
                  <span className="text-sm text-white/80">{metrics.pipeline.weeks2to4.campaigns.length}</span>
                </div>
                <div className="flex gap-1 h-2.5">
                  {metrics.pipeline.weeks2to4.atRisk > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.weeks2to4.atRisk, background: 'linear-gradient(90deg, #EC489940, #EC489970)' }} />}
                  {metrics.pipeline.weeks2to4.needsAttention > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.weeks2to4.needsAttention, background: 'linear-gradient(90deg, #F9731640, #F9731670)' }} />}
                  {metrics.pipeline.weeks2to4.ready > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.weeks2to4.ready, background: 'linear-gradient(90deg, #10B98140, #10B98170)' }} />}
                  {metrics.pipeline.weeks2to4.campaigns.length === 0 && <div className="bg-white/10 rounded-sm flex-1" />}
                </div>
              </div>

              {/* Months 2-3 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white/60">Month 2-3</span>
                  <span className="text-sm text-white/80">{metrics.pipeline.months2to3.campaigns.length}</span>
                </div>
                <div className="flex gap-1 h-2.5">
                  {metrics.pipeline.months2to3.atRisk > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.months2to3.atRisk, background: 'linear-gradient(90deg, #EC489930, #EC489950)' }} />}
                  {metrics.pipeline.months2to3.needsAttention > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.months2to3.needsAttention, background: 'linear-gradient(90deg, #F9731630, #F9731650)' }} />}
                  {metrics.pipeline.months2to3.ready > 0 && <div className="rounded-sm" style={{ flex: metrics.pipeline.months2to3.ready, background: 'linear-gradient(90deg, #10B98130, #10B98150)' }} />}
                  {metrics.pipeline.months2to3.campaigns.length === 0 && <div className="bg-white/10 rounded-sm flex-1" />}
                </div>
              </div>
            </div>
          </WidgetCard>
          </div>

          {/* Campaign Workflow - Lifecycle with Bottleneck Detection */}
          <div className="col-span-3">
          <WidgetCard
            title="Campaign Workflow"
            icon={<Layers />}
            accentColor="#F97316"
            onClick={() => openDrillIn('lifecycle')}
            badge={metrics.bottleneckStages.length > 0 ? (
              <span className="px-2 py-0.5 bg-amber-500/20 text-[10px] rounded-full font-medium flex items-center gap-1" style={{ color: COLORS.warning }}>
                <AlertTriangle className="w-3 h-3" />
                Bottleneck
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full font-medium">
                ✓ Healthy
              </span>
            )}
            insightText={metrics.bottleneckStages.length > 0 ? (
              <div className="space-y-1">
                <span className="block font-medium" style={{ color: COLORS.warning }}>
                  ⚠️ {LIFECYCLE_LABELS[metrics.bottleneckStages[0][0]]}: {metrics.lifecycle[metrics.bottleneckStages[0][0]]} campaigns
                </span>
                <span className="block text-xs text-white/50">
                  Expected: ~{metrics.expectedPerStage} per stage. Consider expediting or pausing.
                </span>
              </div>
            ) : (
              <span className="text-green-400">
                ✓ Workflow balanced - no bottlenecks detected
              </span>
            )}
          >
            <div className="mb-3">
              <span className="text-4xl font-bold text-white">{metrics.activeCampaigns}</span>
              <span className="text-base text-white/40 ml-2">active campaigns</span>
            </div>
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {WORKFLOW_ORDER.map((stage) => {
                const count = metrics.lifecycle[stage] || 0;
                const isBottleneck = metrics.bottleneckStages.some(([s]) => s === stage);
                const percentOverExpected = count > 0 ? Math.round(((count - metrics.expectedPerStage) / metrics.expectedPerStage) * 100) : 0;
                
                return (
                  <div key={stage} className="flex items-center gap-2.5">
                    <span className={`text-xs w-24 truncate ${isBottleneck ? 'text-amber-400 font-medium' : 'text-white/50'}`}>
                      {LIFECYCLE_LABELS[stage]}
                    </span>
                    <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${isBottleneck ? 'bg-amber-500/20' : 'bg-white/[0.06]'}`}>
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${Math.min(100, (count / Math.max(...Object.values(metrics.lifecycle), 1)) * 100)}%`,
                          background: isBottleneck 
                            ? 'linear-gradient(90deg, #F59E0B50, #F59E0B90)' 
                            : `linear-gradient(90deg, ${LIFECYCLE_COLORS[stage]}50, ${LIFECYCLE_COLORS[stage]}90)`
                        }}
                      />
            </div>
                    <div className="flex items-center gap-1.5 w-16 justify-end">
                      <span className="text-sm text-white/70 font-medium">{count}</span>
                      {isBottleneck && (
                        <span className="text-xs text-amber-400">+{percentOverExpected}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {metrics.archivedCount > 0 && (
              <div className="text-xs text-white/30 mt-2">
                ℹ️ {metrics.archivedCount} archived campaigns not shown
              </div>
            )}
          </WidgetCard>
          </div>

          {/* Funnel Balance - Stacked Bar with Benchmarks */}
          <div className="col-span-3">
          <WidgetCard
            title="Funnel Balance"
            icon={<PieChart />}
            accentColor={COLORS.status}
            onClick={() => openDrillIn('funnel')}
            cosmosLink
            insightText={metrics.funnelImbalances.length > 0 && (
              <div className="space-y-1">
                <span className="block font-medium" style={{ color: COLORS.warning }}>
                  ⚠️ Funnel imbalance detected:
              </span>
                <div className="text-xs space-y-0.5">
                  {metrics.funnelImbalances.map(imb => (
                    <span 
                      key={imb.stage} 
                      className="block"
                      style={{ color: Math.abs(imb.diff) > 10 ? COLORS.critical : imb.diff < 0 ? '#F87171' : COLORS.warning }}
                    >
                      • {FUNNEL_LABELS[imb.stage as FunnelStage]}: {imb.diff > 0 ? '+' : ''}{imb.diff}% vs benchmark
                    </span>
                  ))}
                </div>
              </div>
            )}
          >
            {/* Stacked Horizontal Funnel Bar */}
            <div className="mb-3">
              <div className="h-10 rounded-lg overflow-hidden flex">
                {Object.entries(FUNNEL_LABELS).map(([stage]) => {
                  const pct = metrics.funnelPercentages[stage] || 0;
                  
                  return (
                    <div
                      key={stage}
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{ 
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${FUNNEL_COLORS[stage]}50, ${FUNNEL_COLORS[stage]}90)`
                      }}
                    >
                      <span className="text-xs text-white font-bold">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funnel breakdown with benchmarks */}
            <div className="space-y-2 flex-1">
              {Object.entries(FUNNEL_LABELS).map(([stage, label]) => {
                const pct = metrics.funnelPercentages[stage] || 0;
                const count = metrics.funnel[stage] || 0;
                const benchmark = FUNNEL_BENCHMARK[stage as FunnelStage];
                const diff = pct - benchmark;
                const isIdeal = Math.abs(diff) < 5;
                
                return (
                  <div key={stage} className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${FUNNEL_COLORS[stage]}60, ${FUNNEL_COLORS[stage]}95)` }} />
                    <span className="text-xs text-white/60 flex-1 truncate">{label}</span>
                    <span className="text-xs text-white/80 font-medium">{count}</span>
                    <span className={`text-xs w-14 text-right ${
                      isIdeal ? 'text-green-400' : diff > 0 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {isIdeal ? '✓' : diff > 0 ? `+${diff}%` : `${diff}%`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-white/30 mt-2 text-center">
              Benchmark: 30/30/30/10
            </div>
          </WidgetCard>
          </div>

          {/* Next Best Actions Widget - Actionable Recommendations */}
          <div className="col-span-3">
          <WidgetCard
            title="Next Best Actions"
            icon={<Sparkles />}
            accentColor={COLORS.intelligence}
            onClick={() => openDrillIn('ai-recommendations')}
            badge={
              <span className="px-2 py-0.5 bg-amber-500/20 text-[10px] rounded-full font-medium" style={{ color: COLORS.warning }}>
                {metrics.scaleOpps + metrics.underperformers} ready
              </span>
            }
          >
            <div className="space-y-3.5 flex-1">
              {/* Scale Opportunities with Impact Projection */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Scale Opportunities</span>
            </div>
                  <span className="text-xs text-green-400/70">🚀 High confidence</span>
                </div>
                <div className="text-3xl font-bold text-white">{metrics.scaleOpps}</div>
                <div className="text-xs text-white/50 mb-2">High ROAS (&gt;4x) with budget headroom</div>
                <div className="text-xs text-green-400/80 font-medium">
                  📈 Est. +{formatCurrency(metrics.scaleOpps * 45000)} revenue potential
                </div>
              </div>

              {/* Review Needed with Quick Action Hint */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5" style={{ color: COLORS.warning }} />
                    <span className="text-sm font-medium" style={{ color: COLORS.warning }}>Review Needed</span>
                </div>
                  <span className="text-xs" style={{ color: `${COLORS.warning}99` }}>⚡ Quick win</span>
                </div>
                <div className="text-3xl font-bold text-white">{metrics.underperformers}</div>
                <div className="text-xs text-white/50 mb-2">ROAS &lt;1.5x with significant spend</div>
                <div className="text-xs font-medium" style={{ color: COLORS.critical }}>
                  💰 Est. {formatCurrency(metrics.underperformers * 8500)}/mo potential savings
                </div>
              </div>
            </div>
          </WidgetCard>
          </div>
        </div>

        {/* ROW 3: PERFORMANCE INSIGHTS - 12-col grid: 6 / 3 / 3 */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '16px', minHeight: '200px' }}>
          {/* Channel Performance - Expanded with Modern Horizontal Bars */}
          <div className="col-span-6">
          <WidgetCard
            title="Channel Performance"
            icon={<BarChart3 />}
            accentColor={COLORS.operational}
            onClick={() => setActiveView('cosmos')}
            cosmosLink
            insightText={
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {metrics.channels.find(c => c.isGaining) && (
                  <span className="text-green-400 font-medium">🔥 {metrics.channels.find(c => c.isGaining)?.name} +{metrics.channels.find(c => c.isGaining)?.trendChange}%</span>
                )}
                {metrics.channels.find(c => c.isDeclining) && (
                  <span className="font-medium" style={{ color: COLORS.warning }}>⚠️ {metrics.channels.find(c => c.isDeclining)?.name} {metrics.channels.find(c => c.isDeclining)?.trendChange}%</span>
                )}
              </div>
            }
          >
            {/* Modern horizontal bar visualization with sparklines - no animations */}
            <div className="space-y-3 flex-1">
              {metrics.channels.map((channel) => {
                const Icon = iconMap[channel.icon] || Monitor;
                const maxRoas = Math.max(...metrics.channels.map(c => c.avgRoas));
                const barWidth = (channel.avgRoas / maxRoas) * 100;
                
                return (
                  <div 
                    key={channel.id}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleChannelClick(channel.id); }}
                  >
                    {/* Channel Icon */}
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${channel.color}20`, border: `1px solid ${channel.color}40` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: channel.color }} />
                      </div>
                    
                    {/* Channel Info */}
                    <div className="w-20 flex-shrink-0">
                      <div className="text-sm text-white font-medium truncate">{channel.name.split(' ')[0]}</div>
                      <div className="text-xs text-white/40">{channel.campaignCount} campaigns</div>
                    </div>
                    
                    {/* ROAS Bar - static, no animation */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-8 bg-white/[0.04] rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg"
                          style={{ 
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${channel.color}50, ${channel.color}90)`,
                          }}
                        />
                        {/* ROAS value inside bar */}
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-sm font-bold text-white drop-shadow-lg">{channel.avgRoas.toFixed(1)}x</span>
                    </div>
                      </div>
                      
                    {/* Sparkline */}
                      <div className="w-20 h-8 flex-shrink-0">
                        <Sparkline data={channel.sparklineData} color={channel.color} height={32} />
                    </div>
                      
                      {/* Trend */}
                      <div className={`w-14 text-right flex-shrink-0 text-sm font-semibold ${
                      channel.trendChange > 0 ? 'text-green-400' : 
                      channel.trendChange < 0 ? 'text-red-400' : 'text-white/40'
                    }`}>
                      {channel.trendChange > 0 ? '+' : ''}{channel.trendChange}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </WidgetCard>
          </div>

          {/* ROAS Distribution - Enhanced with more metrics */}
          <div className="col-span-3">
          <WidgetCard
            title="ROAS Tiers"
            icon={<TrendingUp />}
            accentColor={COLORS.performance}
            onClick={() => openDrillIn('roas-distribution')}
          >
            {/* Header with average and revenue */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">{metrics.roas.avg.toFixed(1)}x</span>
                  <span className="text-xs text-white/40">avg</span>
                </div>
                <span className={`text-xs font-medium ${portfolio.roasTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio.roasTrend >= 0 ? '↑' : '↓'} {Math.abs(portfolio.roasTrend)}% vs last month
              </span>
            </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{formatCurrency(metrics.budget.revenue)}</div>
                <span className="text-xs text-white/40">revenue</span>
              </div>
            </div>
            
            {/* Tier breakdown with larger bars */}
            <div className="space-y-2.5 flex-1">
              {[
                { tier: 'Excellent', range: '4.0+', count: metrics.roas.excellent, pct: metrics.roas.percentages.excellent, color: '#10B981', desc: 'High performers' },
                { tier: 'Good', range: '2-3.9', count: metrics.roas.good, pct: metrics.roas.percentages.good, color: '#3B82F6', desc: 'Profitable' },
                { tier: 'Fair', range: '1-1.9', count: metrics.roas.fair, pct: metrics.roas.percentages.fair, color: '#F97316', desc: 'Break-even' },
                { tier: 'Poor', range: '<1', count: metrics.roas.poor, pct: metrics.roas.percentages.poor, color: '#EC4899', desc: 'Losing money' }
              ].map((item) => (
                <div key={item.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${item.color}60, ${item.color}95)` }} />
                      <span className="text-xs text-white/80 font-medium">{item.tier}</span>
                      <span className="text-[10px] text-white/40">({item.range}x)</span>
                    </div>
                    <span className="text-xs text-white font-semibold">{item.count} <span className="text-white/40 font-normal">({item.pct}%)</span></span>
                    </div>
                  <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}50, ${item.color}90)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Key insights */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Scale ready (high ROAS + budget)</span>
                <span className="text-green-400 font-medium">{metrics.scaleOpps}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Need review (underperforming)</span>
                <span className="text-amber-400 font-medium">{metrics.underperformers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Target benchmark</span>
                <span className="text-white/60">3.0x ROAS</span>
              </div>
            </div>
          </WidgetCard>
          </div>

          {/* Quarterly Budget Pacing - Enhanced with more metrics */}
          <div className="col-span-3">
          <WidgetCard
            title="Budget Pacing"
            icon={<Calendar />}
            accentColor={COLORS.operational}
            onClick={() => openDrillIn('budget-pacing')}
          >
            {/* Current quarter highlight */}
            {(() => {
              const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
              const qKey = `Q${currentQuarter}`;
              const data = metrics.quarterlyBudget[qKey] || { budget: 0, spent: 0, allocated: 0 };
              const pct = data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0;
              const now = new Date();
              const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
              const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
              const daysInQuarter = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
              const dayOfQuarter = Math.ceil((now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
              const expectedPct = Math.round((dayOfQuarter / daysInQuarter) * 100);
              const pacingDiff = pct - expectedPct;
              
              return (
                <div className="mb-3 pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60 font-medium">{qKey} (Current Quarter)</span>
                    <span className={`text-sm font-bold ${pct > 90 ? 'text-amber-400' : pct > 70 ? 'text-green-400' : 'text-blue-400'}`}>{pct}%</span>
                  </div>
                  <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full relative"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, #3B82F650, #3B82F690)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{formatCurrency(data.spent)} of {formatCurrency(data.budget)}</span>
                    <span className={`font-medium ${pacingDiff > 5 ? 'text-amber-400' : pacingDiff < -5 ? 'text-red-400' : 'text-green-400'}`}>
                      {pacingDiff > 0 ? `+${pacingDiff}%` : `${pacingDiff}%`} vs expected
                    </span>
                  </div>
                </div>
              );
            })()}
            
            {/* All quarters with larger bars */}
            <div className="space-y-2.5 flex-1">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, idx) => {
                const data = metrics.quarterlyBudget[quarter] || { budget: 0, spent: 0, allocated: 0 };
                const pct = data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0;
                const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
                const isCurrentQuarter = idx + 1 === currentQuarter;
                const isPastQuarter = idx + 1 < currentQuarter;
                
                // Use Channel Performance palette colors
                let barColor = '#6B7280'; // gray for not started
                let status = 'Planned';
                if (pct > 90) { barColor = '#10B981'; status = 'Complete'; }
                else if (pct > 60) { barColor = '#3B82F6'; status = 'On track'; }
                else if (pct > 0) { barColor = '#F97316'; status = 'In progress'; }
                if (isPastQuarter && pct < 90) { barColor = '#EC4899'; status = 'Under'; }
                
                return (
                  <div key={quarter}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isCurrentQuarter ? 'text-white' : 'text-white/50'}`}>
                        {quarter} {isCurrentQuarter && '●'}
                      </span>
                      <span className="text-[10px] text-white/40">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%`, background: `linear-gradient(90deg, ${barColor}50, ${barColor}90)` }}
                        />
                    </div>
                      <span className="text-xs font-semibold w-10 text-right" style={{ color: barColor }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Total budget (annual)</span>
                <span className="text-white font-medium">{formatCurrency(metrics.budget.total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">YTD spent</span>
                <span className="text-white/80">{formatCurrency(metrics.budget.spent)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Remaining</span>
                <span className="text-white/60">{formatCurrency(metrics.budget.total - metrics.budget.spent)}</span>
              </div>
            </div>
          </WidgetCard>
          </div>
        </div>

        {/* ROW 4: TEAM & ACTIVITY - 12-col grid: 6 / 6 */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '16px', minHeight: '200px', maxHeight: '260px' }}>
          {/* Team Capacity - Enhanced with Metrics */}
          <div className="col-span-6">
          <WidgetCard
            title="Team Capacity"
            icon={<Users />}
            accentColor={COLORS.status}
            onClick={() => openDrillIn('team-workload')}
            badge={metrics.unassignedCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full font-medium">
                {metrics.unassignedCount} unassigned
              </span>
            )}
          >
            {/* Team Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-white/[0.06]">
              <div>
                <div className="text-xl font-bold text-white">{metrics.team.length}</div>
                <div className="text-xs text-white/40">team members</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{Math.round(metrics.activeCampaigns / metrics.team.length)}</div>
                <div className="text-xs text-white/40">avg/person</div>
            </div>
              <div>
                <div className={`text-xl font-bold ${metrics.team.filter(m => m.overCapacity).length > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {Math.round((metrics.activeCampaigns / metrics.totalCapacity) * 100)}%
                </div>
                <div className="text-xs text-white/40">utilization</div>
              </div>
            </div>
            
            {/* Compact Team List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {metrics.team.slice(0, 4).map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: member.overCapacity ? 'rgba(239, 68, 68, 0.3)' : 'rgba(139, 92, 246, 0.3)' }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70 truncate flex-1">{member.name}</span>
                      <span className={`text-xs font-medium ${member.overCapacity ? 'text-red-400' : 'text-white/70'}`}>
                        {member.count}/{EXPECTED_CAPACITY_PER_PERSON}
              </span>
            </div>
                    <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${Math.min(100, member.capacityPercent)}%`,
                          background: member.overCapacity 
                            ? 'linear-gradient(90deg, #EC489950, #EC489990)' 
                            : 'linear-gradient(90deg, #A855F750, #A855F790)'
                        }}
                      />
                    </div>
                  </div>
                  </div>
                ))}
              
              {/* Show more indicator */}
              {metrics.team.length > 4 && (
                <div className="text-xs text-white/30 text-center pt-1">
                  +{metrics.team.length - 4} more team members
                  </div>
              )}
                    </div>
            
            {/* Unassigned Warning */}
            {metrics.unassignedCount > 0 && (
              <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-red-400 font-medium">⚠️ {metrics.unassignedCount} unassigned</span>
                <span className="text-xs text-white/40">needs attention</span>
                </div>
              )}
          </WidgetCard>
          </div>

          {/* Recent Activity - Compact */}
          <div className="col-span-6">
          <WidgetCard
            title="Recent Activity"
            icon={<Activity />}
            accentColor={COLORS.neutral}
            onClick={() => openDrillIn('activity')}
          >
            {/* Activity Stats */}
            <div className="flex items-center gap-4 mb-3 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white">
                  {campaigns.filter(c => new Date(c.lastModified) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </span>
                <span className="text-xs text-white/40">today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white/60">
                  {campaigns.filter(c => new Date(c.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </span>
                <span className="text-xs text-white/40">this week</span>
              </div>
            </div>
            
            {/* Compact Activity List */}
            <div className="space-y-1 flex-1 overflow-y-auto">
              {metrics.recentActivity.slice(0, 5).map((activity, idx) => (
                <motion.div
                  key={`${activity.campaign.id}-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span className="text-xs text-white/50 w-14 truncate">{activity.type}</span>
                  <span className="text-xs text-white/70 flex-1 truncate">{activity.campaign.name.substring(0, 25)}</span>
                  <span className="text-[10px] text-white/30 flex-shrink-0">{activity.timeAgo}</span>
                </motion.div>
              ))}
              </div>
            
            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-white/40">by {new Set(metrics.recentActivity.map(a => a.actor)).size} team members</span>
              <button className="text-xs text-white/50 hover:text-white transition-colors">View all →</button>
            </div>
          </WidgetCard>
          </div>
        </div>
      </div>

      {/* Timeline Slider removed */}

      {/* Data Popover */}
      <DataPopover
        isOpen={!!popoverData}
        onClose={() => setPopoverData(null)}
        data={popoverData || { title: '', metrics: [] }}
        position={popoverPosition}
      />

      {/* DRILL-IN MODALS */}
      <DrillInModal
        isOpen={drillInModal.type === 'launch-pipeline'}
        onClose={closeDrillIn}
        title="Launch Pipeline"
        subtitle="Campaigns launching in the next 90 days"
        onNavigateToCosmos={navigateToCosmos}
      >
        <div className="mb-6">
          <LifecycleFilter selected={lifecycleFilter} onChange={setLifecycleFilter} />
        </div>
        <CampaignList 
          campaigns={filteredCampaigns.filter(c => {
            const days = Math.ceil((new Date(c.targetLaunchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 90;
          }).sort((a, b) => new Date(a.targetLaunchDate).getTime() - new Date(b.targetLaunchDate).getTime())}
          showReadiness={true} showRoas={false} showBudget={true}
        />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'lifecycle'}
        onClose={closeDrillIn}
        title="Campaign Workflow"
        subtitle="Lifecycle stage breakdown"
        onNavigateToCosmos={navigateToCosmos}
      >
        <div className="mb-6">
          <LifecycleFilter selected={lifecycleFilter} onChange={setLifecycleFilter} />
        </div>
        <CampaignList 
          campaigns={filteredCampaigns.sort((a, b) => {
            const order: LifecycleStage[] = ['planning', 'development', 'qa_ready', 'launching', 'active', 'closing'];
            return order.indexOf(a.lifecycleStage) - order.indexOf(b.lifecycleStage);
          })}
          showReadiness={true} showRoas={true} showBudget={false}
        />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'alerts'}
        onClose={closeDrillIn}
        title="Active Alerts"
        subtitle="Campaigns requiring attention"
        onNavigateToCosmos={navigateToCosmos}
      >
        <CampaignList 
          campaigns={campaigns.filter(c => c.alert).sort((a, b) => {
            const aMax = a.alerts.reduce((max, alert) => Math.min(max, { critical: 0, warning: 1, info: 2 }[alert.severity]), 3);
            const bMax = b.alerts.reduce((max, alert) => Math.min(max, { critical: 0, warning: 1, info: 2 }[alert.severity]), 3);
            return aMax - bMax;
          })}
          showReadiness={true} showRoas={true} showBudget={true} highlightAlerts={true}
        />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'funnel'}
        onClose={closeDrillIn}
        title="Funnel Balance"
        subtitle="Campaign distribution across funnel stages"
        onNavigateToCosmos={navigateToCosmos}
      >
        <div className="mb-6">
          <FunnelFilter selected={funnelFilter} onChange={setFunnelFilter} />
        </div>
        <CampaignList 
          campaigns={filteredCampaigns.sort((a, b) => {
            const order: FunnelStage[] = ['awareness', 'consideration', 'conversion', 'retention'];
            return order.indexOf(a.funnelStage) - order.indexOf(b.funnelStage);
          })}
          showReadiness={false} showRoas={true} showBudget={true}
        />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'portfolio-health'}
        onClose={closeDrillIn}
        title="Portfolio Health Details"
        subtitle="Comprehensive health metrics"
        onNavigateToCosmos={navigateToCosmos}
      >
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white/60 text-sm mb-2">By Readiness</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-green-400">On Track (≥80%)</span><span className="text-white font-semibold">{campaigns.filter(c => c.readinessPercent >= 80).length}</span></div>
              <div className="flex justify-between"><span className="text-amber-400">Attention (50-79%)</span><span className="text-white font-semibold">{campaigns.filter(c => c.readinessPercent >= 50 && c.readinessPercent < 80).length}</span></div>
              <div className="flex justify-between"><span className="text-red-400">At Risk (&lt;50%)</span><span className="text-white font-semibold">{campaigns.filter(c => c.readinessPercent < 50).length}</span></div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white/60 text-sm mb-2">By Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-green-400">Active</span><span className="text-white font-semibold">{campaigns.filter(c => c.status === 'active').length}</span></div>
              <div className="flex justify-between"><span className="text-amber-400">At Risk</span><span className="text-white font-semibold">{campaigns.filter(c => c.status === 'at_risk').length}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Paused</span><span className="text-white font-semibold">{campaigns.filter(c => c.status === 'paused').length}</span></div>
            </div>
          </div>
        </div>
        <CampaignList campaigns={campaigns.sort((a, b) => a.readinessPercent - b.readinessPercent)} showReadiness={true} showRoas={true} showBudget={true} />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'roas-distribution'}
        onClose={closeDrillIn}
        title="ROAS Distribution"
        subtitle="Performance by ROAS tier"
        onNavigateToCosmos={navigateToCosmos}
      >
        <CampaignList campaigns={campaigns.sort((a, b) => b.roas - a.roas)} showReadiness={false} showRoas={true} showBudget={true} />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'budget-pacing'}
        onClose={closeDrillIn}
        title="Budget Pacing"
        subtitle="Budget utilization"
        onNavigateToCosmos={navigateToCosmos}
      >
        <CampaignList campaigns={campaigns.sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget))} showReadiness={false} showRoas={true} showBudget={true} />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'team-workload'}
        onClose={closeDrillIn}
        title="Team Capacity"
        subtitle="Campaign distribution by owner"
        onNavigateToCosmos={navigateToCosmos}
      >
        <CampaignList campaigns={campaigns.sort((a, b) => a.owner.localeCompare(b.owner))} showReadiness={true} showRoas={false} showBudget={false} />
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'ai-recommendations'}
        onClose={closeDrillIn}
        title="AI Recommendations"
        subtitle="Actionable insights"
        onNavigateToCosmos={navigateToCosmos}
      >
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="text-green-400 font-medium mb-2">🚀 Scale high-ROAS campaigns</h4>
            <p className="text-white/70 text-sm mb-3">{metrics.scaleOpps} campaigns have strong returns with budget headroom.</p>
            <CampaignList campaigns={campaigns.filter(c => c.roas > 4 && (c.spent / c.budget) < 0.7).slice(0, 5)} showReadiness={false} showRoas={true} showBudget={true} />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <h4 className="text-amber-400 font-medium mb-2">⚠️ Review underperformers</h4>
            <p className="text-white/70 text-sm mb-3">{metrics.underperformers} campaigns have ROAS below 1.5x with significant spend.</p>
            <CampaignList campaigns={campaigns.filter(c => c.roas < 1.5 && c.spent > 10000).slice(0, 5)} showReadiness={false} showRoas={true} showBudget={true} />
          </div>
        </div>
      </DrillInModal>

      <DrillInModal
        isOpen={drillInModal.type === 'activity'}
        onClose={closeDrillIn}
        title="Recent Activity"
        subtitle="Latest campaign updates"
        onNavigateToCosmos={navigateToCosmos}
      >
        <CampaignList campaigns={campaigns.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 20)} showReadiness={true} showRoas={false} showBudget={false} />
      </DrillInModal>
    </motion.div>
  );
};

// Helper function for relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
