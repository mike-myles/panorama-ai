/* Audience Fatigue Detail Panel - Right panel view for audience overlap alerts */
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Target, Sparkles, Info, LayoutDashboard, Clock, Share2
} from 'lucide-react';
import { Campaign, CategorizedAlert } from '../../../types';
import { useDashboard } from '../../../context/DashboardContext';
import { AI_SOLUTIONS } from '../../dashboard/AlertDetailDashboard';
import { ALERT_CATEGORY_INFO } from '../../../utils/alertCalculations';

/* cspell:words ROAS roas Roas bg sev */

interface AudienceFatigueDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alert: CategorizedAlert | null;
  campaigns: Campaign[];
}

// Audience fatigue specific data interface
interface AudienceFatigueData {
  overlapPercentage: number;
  estimatedReach: number;
  avgFrequency: number;
  industryThreshold: string;
  estimatedSavings: number;
}

export const AudienceFatigueDetailPanel: React.FC<AudienceFatigueDetailPanelProps> = ({
  isOpen,
  onClose,
  alert,
  campaigns
}) => {
  const { openAlertDetailView, setFocusedCampaign, setActiveView, setZoomLevel } = useDashboard();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  React.useEffect(() => {
    if (!isOpen) setSelectedCampaignId(null);
  }, [isOpen]);
  
  // Solutions for this alert category (used when showing AI Recommendations)
  const solutions = useMemo(() => {
    if (!alert) return [];
    return (AI_SOLUTIONS[alert.category] || []);
  }, [alert]);

  // Get affected campaigns
  const affectedCampaigns = useMemo(() => {
    if (!alert) return [];
    return campaigns.filter(c => alert.affectedCampaignIds.includes(c.id));
  }, [alert, campaigns]);

  // Calculate audience fatigue metrics
  const fatigueData: AudienceFatigueData = useMemo(() => {
    // Extract overlap % from alert metrics if available
    const overlapMetric = alert?.metrics?.find(m => m.label.toLowerCase().includes('overlap'));
    const overlapPercentage = overlapMetric 
      ? (typeof overlapMetric.value === 'number' ? overlapMetric.value : parseInt(String(overlapMetric.value)) || 67)
      : 67;

    return {
      overlapPercentage,
      estimatedReach: 45000,
      avgFrequency: 8.2,
      industryThreshold: '3-5x per week',
      estimatedSavings: 23000
    };
  }, [alert]);

  // Calculate group metrics
  const groupMetrics = useMemo(() => {
    const totalSpend = affectedCampaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalBudget = affectedCampaigns.reduce((sum, c) => sum + c.budget, 0);
    const avgRoas = affectedCampaigns.length > 0
      ? affectedCampaigns.reduce((sum, c) => sum + c.roas, 0) / affectedCampaigns.length
      : 0;
    const budgetUsed = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

    return { totalSpend, totalBudget, avgRoas, budgetUsed };
  }, [affectedCampaigns]);

  // Handle Open in Dashboard
  const handleOpenInDashboard = () => {
    if (alert) {
      openAlertDetailView(alert);
    }
  };

  if (!alert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 480, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-6 top-[97px] bottom-6 w-[420px] rounded-2xl z-50 overflow-hidden flex flex-col pointer-events-auto"
          style={{
            // Glassmorphism - MATCHING LEFT PANEL EXACTLY
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(18, 18, 20, 0.92) 8%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {/* Header Section with Action Buttons */}
          <div 
            className="px-5 pt-5 pb-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Top Row: Title + Close */}
            <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                  className="w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
                }}
              >
                  <Users className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                  <h2 
                    className="font-semibold text-base tracking-wide truncate"
                    style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                  >
                  {alert.title || 'Retargeting audience overlap'}
                </h2>
                  <p 
                    className="text-xs uppercase tracking-wider truncate mt-0.5"
                    style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                  >
                    {ALERT_CATEGORY_INFO[alert.category].label}
                  </p>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg transition-colors flex-shrink-0 ml-2"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            </div>

            {/* Action Buttons Row - Clean Two-Button Layout */}
            <div className="flex items-center gap-3 mt-4">
              {/* AI Suggestions Button with Animated Gradient */}
              <motion.button
                onClick={() => setShowRecommendations(v => !v)}
                className="flex-1 h-8 px-4 rounded-xl font-semibold text-[11px] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ 
                  color: 'white',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated gradient background */}
                <div 
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 3s ease infinite',
                  }}
                />
                {/* Subtle shimmer overlay */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{showRecommendations ? 'Back' : 'AI Recommendations'}</span>
              </motion.button>

              {/* View in Dashboard Button - Solid Blue CTA */}
              <button
                onClick={handleOpenInDashboard}
                className="flex-1 h-8 px-4 rounded-xl font-semibold text-[11px] transition-all duration-200 flex items-center justify-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                Open in Dashboard
              </button>
            </div>

            {/* CSS Keyframes for animations */}
            <style>{`
              @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>

          {/* Severity & Quick Stats Bar */}
          {!showRecommendations && (
          <>
            <div 
              className="px-5 py-3 flex items-center gap-3 flex-wrap"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
            >
              <span 
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  background: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : (alert.severity === 'warning' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(96, 165, 250, 0.12)'),
                  border: alert.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.4)' : (alert.severity === 'warning' ? '1px solid rgba(251, 146, 60, 0.3)' : '1px solid rgba(96, 165, 250, 0.25)'),
                  color: '#FFFFFF',
                }}
              >
                {alert.severity === 'critical' ? 'CRITICAL' : alert.severity === 'warning' ? 'WARNING' : 'INFO'}
              </span>
              <span 
                className="text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {affectedCampaigns.length} campaigns affected • ${Math.round(groupMetrics.totalSpend / 1000)}K at risk
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.02)' }}>
              <div className="p-4 space-y-4">
              
              {/* Group Summary Cards - Improved Typography */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className="p-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div 
                    className="text-[10px] mb-1.5 uppercase tracking-wider font-medium"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    AVG ROAS
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                  >
                    {groupMetrics.avgRoas.toFixed(1)}x
                  </div>
                  <div className="text-[11px] text-orange-400 mt-1 font-medium">Below target</div>
                </div>

                <div 
                  className="p-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div 
                    className="text-[10px] mb-1.5 uppercase tracking-wider font-medium"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    TOTAL SPEND
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                  >
                    ${Math.round(groupMetrics.totalSpend / 1000)}K
                  </div>
                  <div 
                    className="text-[11px] mt-1"
                    style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                  >
                    of ${Math.round(groupMetrics.totalBudget / 1000)}K budget
                  </div>
                </div>

                <div 
                  className="p-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div 
                    className="text-[10px] mb-1.5 uppercase tracking-wider font-medium"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    BUDGET USED
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                  >
                    {groupMetrics.budgetUsed}%
                  </div>
                </div>
              </div>

              {/* Overlap Severity Visualization - Only for audience overlap */}
              {alert.category === 'audience_overlap' && (
                <div 
                  className="p-4 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Left accent line */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                    style={{ background: 'rgba(239, 68, 68, 0.8)' }}
                  />
                  
                  <h3 
                    className="text-xs font-semibold mb-3.5 flex items-center gap-2 uppercase tracking-wide"
                    style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                  >
                    <Target className="w-4 h-4 text-gray-400" />
                    Audience Overlap Analysis
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Overlap Severity</span>
                        <span className="text-red-400 font-semibold">{fatigueData.overlapPercentage}% High</span>
                      </div>
                      <div 
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${fatigueData.overlapPercentage}%`,
                            background: 'linear-gradient(to right, #EF4444, #F87171)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Estimated Audience Reach</span>
                      <span 
                        className="font-semibold"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        ~{(fatigueData.estimatedReach / 1000).toFixed(0)}K unique users
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Avg Frequency (per user)</span>
                        <span className="text-orange-400 font-semibold">{fatigueData.avgFrequency}x / week</span>
                      </div>
                      <p 
                        className="text-[11px] mt-1.5"
                        style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                      >
                        Industry threshold: {fatigueData.industryThreshold}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Affected Campaigns List - Redesigned without orange accent */}
              <div>
                <h3 
                  className="text-xs font-semibold mb-3 uppercase tracking-wide"
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  Affected Campaigns ({affectedCampaigns.length})
                </h3>

                <div className="space-y-2.5">
                  {affectedCampaigns.slice(0, 5).map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="rounded-xl transition-all duration-200 cursor-pointer overflow-hidden"
                      style={{
                        background: (selectedCampaignId === campaign.id) ? 'rgba(45, 45, 55, 0.6)' : 'rgba(40, 40, 48, 0.5)',
                        border: (selectedCampaignId === campaign.id) ? '1px solid rgba(96, 165, 250, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCampaignId === campaign.id) return;
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)';
                        e.currentTarget.style.background = 'rgba(45, 45, 55, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCampaignId === campaign.id) return;
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.background = 'rgba(40, 40, 48, 0.5)';
                      }}
                      onClick={() => {
                        try {
                          if (selectedCampaignId === campaign.id) {
                            setSelectedCampaignId(null);
                            window.dispatchEvent(new CustomEvent('cosmosResetView'));
                          } else {
                            setSelectedCampaignId(campaign.id);
                            window.dispatchEvent(new CustomEvent('cosmos:focusCampaignSoft', { detail: { id: campaign.id } }));
                          }
                        } catch {}
                      }}
                    >
                      {/* Campaign Header */}
                      <div 
                        className="px-3.5 py-2.5 flex items-center justify-between"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Campaign Number Badge */}
                          <div 
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#FCA5A5',
                            }}
                          >
                            {index + 1}
                          </div>
                        <div className="flex-1 min-w-0">
                            <h4 
                              className="text-[13px] font-medium truncate"
                              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                            {campaign.name}
                          </h4>
                          </div>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                          style={{ 
                            background: campaign.status === 'at_risk' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                            color: campaign.status === 'at_risk' ? '#FDBA74' : '#86EFAC' 
                          }}
                        >
                          {campaign.status === 'at_risk' ? 'At risk' : campaign.status}
                        </span>
                      </div>

                      {/* Campaign Details */}
                      <div className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2 text-[11px] mb-2.5 flex-wrap">
                            <span 
                            className="px-2 py-0.5 rounded font-medium"
                              style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#C4B5FD' }}
                            >
                              {campaign.channel}
                            </span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
                            <span 
                            className="capitalize"
                            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                          >
                            {campaign.funnelStage || 'Consideration'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[11px]">
                          <div>
                            <div 
                              className="uppercase font-medium mb-0.5"
                              style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                            >
                              ROAS
                            </div>
                            <div 
                              className="font-semibold"
                              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {campaign.roas.toFixed(1)}x
                            </div>
                          </div>
                          <div>
                            <div 
                              className="uppercase font-medium mb-0.5"
                              style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                            >
                              SPEND
                            </div>
                            <div 
                              className="font-semibold"
                              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              ${Math.round(campaign.spent / 1000)}K
                        </div>
                      </div>
                        <div>
                            <div 
                              className="uppercase font-medium mb-0.5"
                              style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                            >
                              CTR
                            </div>
                            <div 
                              className="font-semibold"
                              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {(campaign.ctr * 100).toFixed(2)}%
                        </div>
                        </div>
                      </div>

                      {/* Footer row: icon button (left) + text (right) with 8px spacing */}
                      <div 
                        className="mt-2.5 pt-2.5 text-[11px] flex items-start gap-2"
                        style={{ 
                          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                          color: 'rgba(255, 255, 255, 0.55)'
                        }}
                      >
                        <span className="flex-1">
                          Retargeting audience overlap: <span className="text-red-400 font-semibold">{fatigueData.overlapPercentage}%</span> of coffee subscribers targeted by multiple campaigns
                        </span>
                        <button
                          className="p-1.5 rounded-md border border-white/15 bg-transparent hover:bg-white/10 transition-colors"
                          title="Open in Dashboard"
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              setFocusedCampaign(campaign.id);
                              setZoomLevel(90);
                              setActiveView('dashboard');
                            } catch {}
                          }}
                        >
                          <LayoutDashboard className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
                  {affectedCampaigns.length > 5 && (
                    <div 
                      className="text-center text-xs py-2.5"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      +{affectedCampaigns.length - 5} more campaigns
                    </div>
                  )}
                </div>
              </div>

              {/* AI Quick Fix tile REMOVED per user request */}

              </div>
            </div>
          </>
          )}

          {showRecommendations && (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.02)' }}>
              <div className="p-4">
                <div className="relative p-4 rounded-2xl" style={{ background: 'rgba(12,12,14,0.95)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))' }}
                      >
                        <Sparkles className="w-4 h-4 text-purple-400 relative z-10" />
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                            animation: 'shimmer 2s ease-in-out infinite'
                          }}
                        />
                      </div>
                      <div>
                        <h2 
                          className="text-base font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F9A8D4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          AI Recommendations
                        </h2>
                        <p className="text-xs text-white/50">Powered by Campaign Manager Agent</p>
                      </div>
                    </div>
                    <div 
                      className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase"
                      style={{
                        background: 'linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.15) 100%)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: '#93C5FD',
                      }}
                    >
                      {solutions.length} options
                    </div>
                  </div>

                  <div className="space-y-3">
                    {solutions.map((solution, idx) => (
                      <motion.div 
                        key={solution.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + idx * 0.05 }}
                        className="p-4 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer"
                        style={{
                          background: 'rgba(30,30,35,0.6)',
                          border: idx === 0 ? '1px solid rgba(59,130,246,0.15)' : 
                                 idx === 1 ? '1px solid rgba(147,51,234,0.15)' : 
                                 '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: idx === 0 ? 'rgba(59,130,246,0.15)' : 
                                         idx === 1 ? 'rgba(147,51,234,0.15)' : 
                                         'rgba(255,255,255,0.08)',
                              border: idx === 0 ? '1px solid rgba(59,130,246,0.3)' : 
                                     idx === 1 ? '1px solid rgba(147,51,234,0.3)' : 
                                     '1px solid rgba(255,255,255,0.15)',
                            }}
                          >
                            <span className={`text-base font-bold ${
                              idx === 0 ? 'text-blue-400' : 
                              idx === 1 ? 'text-purple-400' : 
                              'text-gray-400'
                            }`}>{idx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1.5 gap-2">
                              <h4 className="text-sm font-semibold text-white/90 leading-snug">
                                {solution.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  solution.effort === 'Low' ? 'bg-green-500/20 text-green-300' :
                                  solution.effort === 'Medium' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {solution.effort}
                                </span>
                                <span className="text-[10px] text-gray-400">{solution.confidence}%</span>
                              </div>
                            </div>
                            <p className="text-[12px] text-gray-300 leading-relaxed mb-2">{solution.description}</p>
                            <div className="flex items-center gap-3 text-[11px] flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">Impact:</span>
                                <span className="text-white font-semibold">High</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400">{solution.timeframe}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-white/70">{solution.expectedImpact}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Share Button */}
                  <motion.button 
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(147,51,234,0.25) 100%)',
                      border: '1px solid rgba(59,130,246,0.4)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Share with Campaign Owners</span>
                  </motion.button>

                  {/* Info callout */}
                  <div 
                    className="mt-3 p-2.5 rounded-lg"
                    style={{
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.15)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[10px] text-gray-400 leading-relaxed">
                        Campaign owners will receive detailed implementation steps and access to apply these solutions directly in their campaigns.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudienceFatigueDetailPanel;
