import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Activity, Flag, Send, Users, Clock, Share2, Sparkles, Target, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Campaign, CategorizedAlert, AlertCategory } from '../../types';
import { useDashboard } from '../../context/DashboardContext';
import { calculateCategorizedAlerts } from '../../utils/alertCalculations';
import { AI_SOLUTIONS } from '../../data/aiSolutions';

/* cspell:words ROAS roas bg FC sev */

interface CosmosDetailPanelProps {
  isOpen: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  selectedChild?: any | null;
  campaignGroup?: Campaign[] | null;
  selectedAlert?: CategorizedAlert;
  selectedCampaignId?: string | null;
}

export const CosmosDetailPanel = ({ isOpen, campaign, onClose, selectedChild, campaignGroup, selectedAlert, selectedCampaignId }: CosmosDetailPanelProps) => {
  const { setFocusedCampaign, setZoomLevel } = useDashboard();
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [flagMessage, setFlagMessage] = useState('');
  const [showFlagToast, setShowFlagToast] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const groupMode = Array.isArray(campaignGroup) && campaignGroup.length > 0;
  // Do not early-return before hooks; guard campaign access below instead.
  
  // Reset recommendations view when alert changes or panel closes
  useEffect(() => {
    setShowRecommendations(false);
  }, [selectedAlert, isOpen]);
  // Group mode aggregations
  const groupStats = useMemo(() => {
    if (!groupMode || !campaignGroup) return null;
    const count = campaignGroup.length;
    const totalSpend = campaignGroup.reduce((s, c) => s + (c.spent || 0), 0);
    const totalBudget = campaignGroup.reduce((s, c) => s + (c.budget || 0), 0);
    const avgRoas = count > 0 ? campaignGroup.reduce((s, c) => s + (c.roas || 0), 0) / count : 0;
    const alerts = campaignGroup.flatMap(c => c.alerts || []);
    const severityCounts = alerts.reduce<Record<string, number>>((acc, a) => {
      const key = a.severity;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const categorized = calculateCategorizedAlerts(campaignGroup);
    const categoryCounts = categorized.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});
    const topAlerts: CategorizedAlert[] = categorized.slice(0, 3);
    return { count, totalSpend, totalBudget, avgRoas, severityCounts, categoryCounts, topAlerts };
  }, [groupMode, campaignGroup]);

  // Check if this is a launch readiness concern (low completion with upcoming launch)
  const percentCompleteRaw = typeof ((campaign as any)?.percentComplete) === 'number' ? (campaign as any).percentComplete : 0;
  const percentComplete = Math.max(0, Math.min(100, percentCompleteRaw || (((campaign as any)?.launchDate) ? 100 : 0)));
  const targetLaunchDateRaw = (campaign as any)?.targetLaunchDate;
  const hasLaunchDate = (campaign as any)?.launchDate;
  const launchDate = hasLaunchDate as Date | null | undefined;
  const today = new Date();
  const targetLaunchDate = targetLaunchDateRaw ? new Date(targetLaunchDateRaw) : null;
  const daysUntilLaunch = targetLaunchDate && !hasLaunchDate 
    ? Math.ceil((targetLaunchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isLaunchReadinessConcern = daysUntilLaunch !== null && daysUntilLaunch <= 14 && percentComplete < 50;
  const owner = (campaign as any)?.owner as string | undefined;
  
  // Generate AI-suggested flag message
  const generateFlagMessage = () => {
    const ownerName = owner || 'Campaign Owner';
    const launchDateStr = targetLaunchDate ? targetLaunchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'soon';
    
    return `Hi ${ownerName},

This is an urgent notification regarding "${campaign?.name || 'Selected Campaign'}".

⚠️ CRITICAL CONCERN: The campaign is scheduled to launch in ${daysUntilLaunch} day${daysUntilLaunch !== 1 ? 's' : ''} (${launchDateStr}) but is currently only ${percentComplete}% complete.

📊 AI-POWERED RECOMMENDATIONS TO ACCELERATE COMPLETION:

1. Prioritize Critical Assets: Focus on finalizing creative assets and copy approval first, as these typically cause the most delays.

2. Parallelize Setup Tasks: Assign targeting, bidding, and tracking setup to different team members to work simultaneously.

3. Use Existing Templates: Leverage approved templates from previous campaigns to speed up creative production.

4. Schedule a Rapid Review: Arrange a 15-minute stakeholder alignment call today to clear any pending approvals.

5. Consider Soft Launch: If full completion isn't feasible, consider launching with core elements and iterating post-launch.

Please review and take immediate action to ensure we meet the launch deadline.

Best regards,
Campaign Management System`;
  };
  
  const handleOpenFlagDialog = () => {
    setFlagMessage(generateFlagMessage());
    setIsFlagDialogOpen(true);
  };
  
  const handleSendFlag = () => {
    setIsFlagDialogOpen(false);
    setShowFlagToast(true);
    setTimeout(() => setShowFlagToast(false), 4000);
  };

  // Calculate metrics changes
  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      Icon: change >= 0 ? TrendingUp : TrendingDown
    };
  };

  const coreMetrics = campaign ? [
    {
      label: 'ROAS',
      value: `${campaign.roas.toFixed(1)}x`,
      change: getChangeIndicator(campaign.roas, campaign.roas * 0.9)
    },
    {
      label: 'Total Spend',
      value: `$${(campaign.spent / 1000).toFixed(1)}K`,
      change: getChangeIndicator(campaign.spent, campaign.spent * 0.85)
    },
    {
      label: 'Conversions',
      value: campaign.conversions?.toString() || '0',
      change: getChangeIndicator(campaign.conversions || 0, (campaign.conversions || 0) * 0.8)
    },
    {
      label: 'CTR',
      value: `${campaign.ctr?.toFixed(2)}%` || '0%',
      change: getChangeIndicator(campaign.ctr || 0, (campaign.ctr || 0) * 0.95)
    }
  ] : [];

  // Status color
          const statusColors = {
            active: { bg: 'bg-green-500', text: 'text-green-300', dot: '#10B981' },
            at_risk: { bg: 'bg-yellow-500', text: 'text-yellow-300', dot: '#F59E0B' },
            paused: { bg: 'bg-red-500', text: 'text-red-300', dot: '#EF4444' }
          } as const;
  const statusColor = statusColors[(campaign?.status as keyof typeof statusColors) || 'paused'] || statusColors.paused;

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString();
  };
  const createdBy = (campaign as any)?.createdBy as string | undefined;
  const createdDate = (campaign as any)?.createdDate as Date | undefined;
  const endDateRaw = (campaign as any)?.endDate as Date | string | null | undefined;
  const endDate = endDateRaw ? new Date(endDateRaw) : null;
  const audiences = (campaign as any)?.audiences as Array<{ id: number; name: string; estimatedSize: number }> | undefined;

  // Campaign duration progress: from (launchDate || targetLaunchDate || createdDate) to endDate
  const durationStart = (launchDate as Date | null) || (targetLaunchDate as Date | null) || (createdDate as Date | null) || null;
  const durationPercent = (() => {
    if (!endDate || !durationStart) return null;
    const now = new Date().getTime();
    const start = new Date(durationStart).getTime();
    const end = new Date(endDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    const pct = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  })();

  const formatCompact = (n?: number) => {
    if (!n && n !== 0) return '—';
    if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
    if (n >= 1_000) return `${Math.round(n / 100) / 10}K`;
    return `${n}`;
  };

  return (
    <>
      {/* Flag Dialog - rendered via portal */}
      {createPortal(
        <AnimatePresence>
          {isFlagDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
              onClick={() => setIsFlagDialogOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dialog Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                      <Flag className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Flag to campaign owner</h3>
                      <p className="text-gray-400 text-sm">AI-generated message • Editable</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFlagDialogOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                {/* Dialog Content */}
                <div className="p-6">
                  <label className="text-white font-semibold text-sm mb-2 block">Message to {owner || 'Campaign Owner'}</label>
                  <textarea
                    value={flagMessage}
                    onChange={(e) => setFlagMessage(e.target.value)}
                    className="w-full h-64 bg-gray-800/50 border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-yellow-500/50 transition-colors"
                    placeholder="Enter your message..."
                  />
                  <p className="text-gray-500 text-xs mt-2">You can edit the AI-generated message above or add your own notes.</p>
                </div>
                
                {/* Dialog Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                  <button
                    onClick={() => setIsFlagDialogOpen(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFlag}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Notify
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      
      {/* Flag Sent Toast - rendered via portal */}
      {createPortal(
        <AnimatePresence>
          {showFlagToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed z-[9999] bg-blue-500/90 backdrop-blur-md border border-blue-400/50 rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3"
              style={{ 
                bottom: '20px', 
                left: '0',
                right: '0',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content'
              }}
            >
              <Flag className="w-5 h-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold">Informed {owner || 'campaign owner'} about the launch readiness concern</span>
              <button 
                onClick={() => setShowFlagToast(false)}
                className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Floating Panel - 50% wider than before */}
            <motion.div
              initial={{ x: 480, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 480, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-6 top-[97px] bottom-6 w-[420px] bg-black/75 backdrop-blur-md border border-white/15 rounded-xl z-50 overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* Header - Matches Filter Panel Style */}
              <div className="px-5 pt-5 pb-4 border-b border-white/10">
                {groupMode ? (
                  <div className="mb-[-12px]">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex items-center gap-2">
                        {selectedAlert ? (() => {
                          const ICONS: Record<AlertCategory, React.FC<{ className?: string }>> = {
                            audience_overlap: Users,
                            lifecycle_stall: Clock,
                            budget_pacing:   DollarSign,
                            roas_misalignment: TrendingDown,
                            attribution_leak:  Share2
                          };
                          const Icon = ICONS[selectedAlert.category];
                          const sevClass = selectedAlert.severity === 'critical'
                            ? 'text-red-400'
                            : (selectedAlert.severity === 'warning' ? 'text-orange-400' : 'text-blue-400');
                          return <Icon className={`w-4 h-4 ${sevClass}`} />;
                        })() : null}
                        <h2 className="text-white font-bold text-lg leading-tight truncate">
                          {selectedAlert ? selectedAlert.title : 'Alert set overview'}
                        </h2>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowRecommendations(v => !v)}
                        className="relative overflow-hidden w-full px-2.5 py-1 text-white text-xs font-semibold rounded-md border border-white/15 transition-colors flex items-center justify-center ai-navigator-button"
                        style={{ backgroundColor: 'rgba(17, 17, 20, 0.85)' }}
                      >
                        <div className="shimmer-overlay absolute inset-0 rounded-md pointer-events-none" />
                        <Sparkles className="w-4 h-4 mr-1.5 text-purple-400" />
                        {showRecommendations ? 'Back' : 'Recommendations'}
                      </button>
                    </div>
                  </div>
                ) : (campaign ? (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: '#3B82F6' }}
                      >
                        {campaign.channel[0].toUpperCase()}
                      </div>
                      <h2 className="text-white font-bold text-lg truncate">{campaign.name}</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                ) : null)}
              </div>

              {/* Content - Scrollable - Matches Filter Panel Layout */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {groupMode ? (
                  <>
                    {!showRecommendations ? (
                      <>
                        {/* Group Summary */}
                        <div>
                          <label className="text-white font-semibold text-sm mb-3 block">Group summary</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Avg ROAS</div>
                              <div className="text-xl font-bold text-white">{(groupStats?.avgRoas || 0).toFixed(1)}x</div>
                            </div>
                            <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Spend</div>
                              <div className="text-xl font-bold text-white">${Math.round((groupStats?.totalSpend || 0) / 1000)}K</div>
                            </div>
                            <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Budget Used</div>
                              <div className="text-xl font-bold text-white">
                                {groupStats && groupStats.totalBudget > 0 ? `${Math.round((groupStats.totalSpend / groupStats.totalBudget) * 100)}%` : '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Affected Campaigns */}
                        <div>
                          <label className="text-white font-semibold text-sm mb-3 block">
                            Affected Campaigns ({campaignGroup?.length || 0})
                          </label>
                          {campaignGroup && campaignGroup.length > 0 ? (
                            <div className="space-y-2">
                          {[...campaignGroup]
                            .sort((a, b) => {
                              // Primary: launch readiness (launched or nearest to launch first)
                              const readinessKey = (c: Campaign) => {
                                const now = new Date();
                                const launchDateRaw = (c as any).launchDate as Date | string | null | undefined;
                                const tldRaw = (c as any).targetLaunchDate as Date | string | null | undefined;
                                const launchDate = launchDateRaw ? new Date(launchDateRaw) : null;
                                const hasLaunched = !!(launchDate && !isNaN(launchDate.getTime()) && launchDate.getTime() <= now.getTime());
                                if (hasLaunched) return 0;
                                const tld = tldRaw ? new Date(tldRaw) : null;
                                if (tld && !isNaN(tld.getTime())) {
                                  const days = Math.ceil((tld.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                  return Math.max(1, days); // future targets start at 1 day
                                }
                                return Number.MAX_SAFE_INTEGER; // unknown farthest
                              };
                              const ak = readinessKey(a);
                              const bk = readinessKey(b);
                              if (ak !== bk) return ak - bk; // ascending: 0 (launched) then nearest
                              
                              // Secondary: severity counts (more severe first)
                              const countSeverity = (c: Campaign) => {
                                const counts = { critical: 0, warning: 0, info: 0 };
                                (Array.isArray((c as any).alerts) ? (c as any).alerts : []).forEach((al: any) => {
                                  const s = (al?.severity || 'info') as 'critical' | 'warning' | 'info';
                                  counts[s as keyof typeof counts] = (counts[s as keyof typeof counts] || 0) + 1;
                                });
                                return counts;
                              };
                              const ac = countSeverity(a);
                              const bc = countSeverity(b);
                              if (ac.critical !== bc.critical) return bc.critical - ac.critical;
                              if (ac.warning !== bc.warning) return bc.warning - ac.warning;
                              if (ac.info !== bc.info) return bc.info - ac.info;
                              
                              // Tertiary: performance
                              if (b.roas !== a.roas) return b.roas - a.roas;
                              return b.spent - a.spent;
                            })
                            .map((c) => {
                              const isSelected = selectedCampaignId === c.id;
                              return (
                              <div
                                key={c.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-transparent border-white/15'
                                    : 'bg-transparent hover:bg-white/5 border-white/15'
                                }`}
                                onClick={() => {
                                  try {
                                    if (isSelected) {
                                      window.dispatchEvent(new CustomEvent('cosmosResetView'));
                                    } else {
                                      window.dispatchEvent(new CustomEvent('cosmos:focusCampaignSoft', { detail: { id: c.id } }));
                                    }
                                  } catch {}
                                }}
                              >
                              <div className="mb-1 text-white font-semibold">{c.name}</div>
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 pr-3">
                                  <div className="text-xs text-gray-400 mb-1">
                                    {c.channel} • {(c as any).funnelStage || 'conversion'} • {c.status === 'at_risk' ? 'At risk' : c.status}
                                  </div>
                                  {/* Native alerts for this campaign */}
                                  {Array.isArray(c.alerts) && c.alerts.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {(() => {
                                          // Derive unique messages with their highest severity
                                          const severityRankLocal: Record<'critical' | 'warning' | 'info', number> = { critical: 3, warning: 2, info: 1 };
                                          const map = new Map<string, 'critical' | 'warning' | 'info'>();
                                          c.alerts.forEach(a => {
                                            if (!a?.message) return;
                                            const current = map.get(a.message);
                                            const nextSeverity = (a.severity || 'info') as 'critical' | 'warning' | 'info';
                                            if (!current || severityRankLocal[nextSeverity] > severityRankLocal[current]) {
                                              map.set(a.message, nextSeverity);
                                            }
                                          });
                                          const chips = Array.from(map.entries())
                                            .sort(([, severityA], [, severityB]) => severityRankLocal[severityB] - severityRankLocal[severityA]);
                                          return chips.map(([msg, severity], chipIndex) => {
                                            const dotColor =
                                              severity === 'critical' ? '#ef4444' :
                                              severity === 'warning' ? '#f59e0b' : '#3b82f6';
                                            return (
                                              <span key={msg + chipIndex} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/15 bg-transparent text-[11px] text-gray-200">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                                                {msg}
                                              </span>
                                            );
                                          });
                                        })()}
                                      </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-300 ml-3 whitespace-nowrap text-right">
                                  {(() => {
                                    const now = new Date();
                                    const tldRaw = (c as any).targetLaunchDate as Date | string | undefined;
                                    const launchDateRaw = (c as any).launchDate as Date | string | undefined;
                                    const targetLaunch = tldRaw ? new Date(tldRaw) : null;
                                    const launchDate = launchDateRaw ? new Date(launchDateRaw) : null;
                                    const hasLaunched = !!(launchDate && !isNaN(launchDate.getTime()) && launchDate.getTime() <= now.getTime());
                                    const daysToLaunch = hasLaunched
                                      ? 0
                                      : (targetLaunch && !isNaN(targetLaunch.getTime())
                                          ? Math.max(0, Math.ceil((targetLaunch.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                                          : null);
                                    return (
                                      <>
                                        {hasLaunched
                                          ? <>Launched: {launchDate?.toLocaleDateString?.() || '—'}<br /></>
                                          : <>Launch: {daysToLaunch !== null ? daysToLaunch : '—'} days<br /></>}
                                        ROAS {c.roas.toFixed(1)}x<br />${(c.spent/1000).toFixed(0)}K
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <button
                                  className="px-2.5 py-1 bg-primary hover:bg-primary/80 text-white text-xs rounded-md border border-white/15"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      setFocusedCampaign(c.id);
                                      setZoomLevel(90);
                                    } catch {}
                                  }}
                                >
                                  Focus
                                </button>
                              </div>
                            </div>
                              );
                            })}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">No campaigns in this set</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-7 h-7 rounded-lg relative overflow-hidden ai-navigator-button flex items-center justify-center">
                            <div className="shimmer-overlay absolute inset-0 rounded-lg pointer-events-none" />
                            <Sparkles className="w-4 h-4 text-purple-400 relative z-10" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">AI-Recommended Solutions</div>
                            <div className="text-xs text-white/60">Powered by campaign analysis</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {selectedAlert ? (
                            (AI_SOLUTIONS[selectedAlert.category] || []).map((solution, indexSolution) => (
                              <motion.div
                                key={solution.id}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 + indexSolution * 0.05 }}
                                className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer group"
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <div 
                                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                                      border: '1px solid rgba(139, 92, 246, 0.3)'
                                    }}
                                  >
                                    <span className="text-[10px] font-bold text-purple-400">{indexSolution + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white mb-0.5 truncate group-hover:text-white">
                                      {solution.title}
                                    </div>
                                    <div className="text-xs text-white/60 leading-relaxed">
                                      {solution.description}
                                    </div>
                                  </div>
                                </div>
                                <div className="pl-9 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-[11px] text-white/70">{solution.expectedImpact}</span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap text-[10px]">
                                    <span className={`px-1.5 py-0.5 rounded ${
                                      solution.effort === 'Low' ? 'bg-green-500/20 text-green-400' :
                                      solution.effort === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>Effort: {solution.effort}</span>
                                    <span className="flex items-center gap-1 text-white/60">
                                      <Clock className="w-3 h-3 text-white/40" /> {solution.timeframe}
                                    </span>
                                    <span className="text-blue-400">Confidence: {solution.confidence}%</span>
                                  </div>
                                  <button className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors group-hover:gap-2">
                                    Apply this solution
                                    <ArrowRight className="w-3 h-3 transition-all" />
                                  </button>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-sm text-white/60">No alert selected.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (campaign ? (
                  <>
              {/* Selected Item (if any) */}
              {selectedChild && (
                <div className="p-4 bg-transparent border border-white/15 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">Selected Item</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{(selectedChild.type || 'item').toString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedChild.name && (
                      <div className="text-gray-300"><span className="text-gray-400">Name:</span> {selectedChild.name}</div>
                    )}
                    {selectedChild.message && (
                      <div className="text-gray-300 col-span-2"><span className="text-gray-400">Message:</span> {selectedChild.message}</div>
                    )}
                    {typeof selectedChild.percentComplete === 'number' && (
                      <div className="text-gray-300"><span className="text-gray-400">Complete:</span> {selectedChild.percentComplete}%</div>
                    )}
                    {selectedChild.status && (
                      <div className="text-gray-300"><span className="text-gray-400">Status:</span> {selectedChild.status}</div>
                    )}
                    {typeof selectedChild.spend === 'number' && (
                      <div className="text-gray-300"><span className="text-gray-400">Spend:</span> ${selectedChild.spend}</div>
                    )}
                    {typeof selectedChild.roas === 'number' && (
                      <div className="text-gray-300"><span className="text-gray-400">ROAS:</span> {parseFloat(selectedChild.roas).toFixed?.(1) || selectedChild.roas}</div>
                    )}
                    {typeof selectedChild.conversions === 'number' && (
                      <div className="text-gray-300"><span className="text-gray-400">Conversions:</span> {selectedChild.conversions}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Status</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-white/15 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColor.dot }}
                    />
                            <span className="text-white text-sm capitalize">{campaign.status === 'at_risk' ? 'At risk' : campaign.status}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-white/15 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-white text-sm capitalize">{campaign.channel}</span>
                  </div>
                </div>
                {campaign.alerts.length > 0 && (
                  <>
                    <div className="mt-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-300 text-sm font-semibold">
                      {campaign.alerts.length} Active Alert{campaign.alerts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                      <div className="ml-6 space-y-1">
                        {campaign.alerts.map((a) => (
                          <div key={a.id} className="flex items-start gap-2 text-xs">
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ 
                                backgroundColor: a.severity === 'critical' ? '#ef4444' : (a.severity === 'warning' ? '#f59e0b' : '#3b82f6')
                              }}
                            />
                            <span className="text-yellow-200/80 flex-1">
                              {a.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Flag to Campaign Owner Button - only for launch readiness concerns */}
                    {isLaunchReadinessConcern && (
                      <div className="flex justify-start mt-2">
                        <button
                          onClick={handleOpenFlagDialog}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm font-semibold transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                          Flag to campaign owner
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Key Metrics */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Key Metrics</label>
                <div className="grid grid-cols-2 gap-2">
                  {coreMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="p-3 bg-transparent border border-white/15 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{metric.label}</span>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          metric.change.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <metric.change.Icon size={12} />
                          {metric.change.value}%
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audiences */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Audiences</label>
                {audiences && audiences.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {audiences.map((a) => (
                      <span
                        key={a.id}
                        className="px-3 py-1.5 bg-transparent border border-white/15 rounded-lg text-gray-200 text-sm"
                      >
                        {`${a.name} (${formatCompact(a.estimatedSize)})`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No audiences associated</div>
                )}
              </div>

              {/* Budget Utilization */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <label className="text-white font-semibold text-sm">Budget</label>
                  </div>
                  <span className="text-gray-400 text-xs">
                    ${(campaign.spent / 1000).toFixed(0)}K / ${(campaign.budget / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-300 ${
                        (campaign.spent / campaign.budget) > 0.95 ? 'bg-red-500' :
                        (campaign.spent / campaign.budget) > 0.80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500 text-xs">$0</span>
                    <span className="text-gray-500 text-xs">{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle & Ownership */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Lifecycle & Ownership</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created By</div>
                    <div className="text-sm font-semibold text-white">{createdBy || '—'}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Owner</div>
                    <div className="text-sm font-semibold text-white">{owner || '—'}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created Date</div>
                    <div className="text-sm font-semibold text-white">{formatDate(createdDate)}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Target Launch</div>
                    <div className="text-sm font-semibold text-white">{formatDate(targetLaunchDate)}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Launch Date</div>
                    <div className="text-sm font-semibold text-white">{launchDate ? formatDate(launchDate) : 'Not launched'}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">End Date</div>
                    <div className="text-sm font-semibold text-white">{formatDate(endDate)}</div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Percent Complete</div>
                      <div className="text-sm font-semibold text-white">{Math.round(percentComplete)}%</div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg ${percentComplete >= 100 ? 'bg-green-500' : (percentComplete >= 60 ? 'bg-blue-500' : 'bg-yellow-500')}`}
                        style={{ width: `${Math.max(0, Math.min(100, percentComplete))}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Campaign Duration</div>
                      <div className="text-sm font-semibold text-white">{durationPercent !== null ? `${durationPercent}%` : '—'}</div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-purple-500"
                        style={{ width: `${Math.max(0, Math.min(100, durationPercent ?? 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <label className="text-white font-semibold text-sm">Performance</label>
                </div>
                <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Overall Rating</span>
                    <div className="flex items-center gap-2">
                      {campaign.roas >= 3 ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-semibold text-green-400">Excellent</span>
                        </>
                      ) : campaign.roas >= 2 ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-sm font-semibold text-yellow-400">Good</span>
                        </>
                      ) : campaign.roas >= 1 ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-sm font-semibold text-orange-400">Fair</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-sm font-semibold text-red-400">Poor</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Modified */}
              <div>
                <div className="p-3 bg-transparent border border-white/15 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Last Modified</span>
                    <span className="text-sm font-semibold text-white">
                      {new Date(campaign.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
                  </>
                ) : null)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
