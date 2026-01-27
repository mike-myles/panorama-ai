/* cspell:disable-file */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, X, Users, Clock, DollarSign, TrendingDown, Share2, ChevronDown,
  Target, Timer, ArrowUpDown
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { ALERT_CATEGORY_INFO } from '../../utils/alertCalculations';
import { AlertCategory, Campaign, Alert } from '../../types';

/* cspell:words FC roas bg cmp sev */

// Sort options for alerts
type SortOption = 'launch_date' | 'severity' | 'impact' | 'category';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'launch_date', label: 'Launch Date' },
  { value: 'severity', label: 'Severity' },
  { value: 'impact', label: 'Impact' },
  { value: 'category', label: 'Category' },
];

// Interface for individual granular alerts
interface GranularAlert {
  id: string;
  category: AlertCategory;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  impactMetric: string;
  impactLabel: string;
  affectedCampaignIds: string[];
  affectedCampaignNames: string[];
  recommendation: string;
  urgencyLabel?: string;
  daysToLaunch?: number; // For sorting by launch date
}

interface CosmosAlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchOpen?: boolean;
  onFilterCampaigns?: (campaignIds: string[] | null) => void;
  onSelectAlert?: (alert: GranularAlert | null) => void;
}

// Icon mapping for categories
const CategoryIcon: Record<AlertCategory, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  audience_overlap: Users,
  lifecycle_stall: Clock,
  budget_pacing: DollarSign,
  roas_misalignment: TrendingDown,
  attribution_leak: Share2
};

// Enhanced severity styles with glassmorphic treatment and clear selected state affordance
const getSeverityStyles = (severity: 'critical' | 'warning' | 'info', isActive: boolean) => {
  const styles = {
    critical: {
      // Selected style matches right-panel campaign card selection
      cardBg: isActive ? 'rgba(45, 45, 55, 0.6)' : 'rgba(30, 30, 35, 0.6)',
      cardBorder: isActive ? 'rgba(96, 165, 250, 0.5)' : 'rgba(239, 68, 68, 0.25)',
      cardShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      // Keep left accent subtle when not selected; no special accent when selected
      leftAccentColor: isActive ? 'rgba(96, 165, 250, 0.0)' : 'rgba(239, 68, 68, 0.8)',
      leftAccentWidth: isActive ? '0px' : '3px',
      scale: isActive ? 1.02 : 1,
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconBorder: 'rgba(239, 68, 68, 0.35)',
      iconColor: '#FCA5A5',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
      badgeBorder: 'rgba(239, 68, 68, 0.4)',
      badgeText: '#FFFFFF',
    },
    warning: {
      cardBg: isActive ? 'rgba(45, 45, 55, 0.6)' : 'rgba(30, 30, 35, 0.6)',
      cardBorder: isActive ? 'rgba(96, 165, 250, 0.5)' : 'rgba(251, 146, 60, 0.2)',
      cardShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      leftAccentColor: isActive ? 'rgba(96, 165, 250, 0.0)' : 'rgba(251, 146, 60, 0.7)',
      leftAccentWidth: isActive ? '0px' : '3px',
      scale: isActive ? 1.02 : 1,
      iconBg: 'rgba(251, 146, 60, 0.15)',
      iconBorder: 'rgba(251, 146, 60, 0.3)',
      iconColor: '#FDBA74',
      badgeBg: 'rgba(251, 146, 60, 0.15)',
      badgeBorder: 'rgba(251, 146, 60, 0.3)',
      badgeText: '#FFFFFF',
    },
    info: {
      cardBg: isActive ? 'rgba(45, 45, 55, 0.6)' : 'rgba(30, 30, 35, 0.6)',
      cardBorder: isActive ? 'rgba(96, 165, 250, 0.5)' : 'rgba(96, 165, 250, 0.15)',
      cardShadow: '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      leftAccentColor: isActive ? 'rgba(96, 165, 250, 0.0)' : 'rgba(96, 165, 250, 0.6)',
      leftAccentWidth: isActive ? '0px' : '3px',
      scale: isActive ? 1.02 : 1,
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconBorder: 'rgba(96, 165, 250, 0.25)',
      iconColor: '#93C5FD',
      badgeBg: 'rgba(96, 165, 250, 0.12)',
      badgeBorder: 'rgba(96, 165, 250, 0.25)',
      badgeText: '#FFFFFF',
    },
  };
  return styles[severity];
};

// Helper to determine alert category from alert message
const categorizeAlert = (alert: Alert, campaign: Campaign): AlertCategory => {
  const msg = alert.message?.toLowerCase() || '';
  if (msg.includes('audience') || msg.includes('overlap') || msg.includes('retarget') || msg.includes('fatigue')) {
    return 'audience_overlap';
  }
  if (msg.includes('budget') || msg.includes('spend') || msg.includes('burning') || msg.includes('overspend') || msg.includes('cpc')) {
    return 'budget_pacing';
  }
  if (msg.includes('roas') || msg.includes('performance') || msg.includes('below') || msg.includes('underperform')) {
    return 'roas_misalignment';
  }
  if (msg.includes('stuck') || msg.includes('stall') || msg.includes('planning') || msg.includes('qa') || msg.includes('incomplete') || msg.includes('blocked')) {
    return 'lifecycle_stall';
  }
  if (msg.includes('attribution') || msg.includes('assist') || msg.includes('credit')) {
    return 'attribution_leak';
  }
  // Default based on campaign status
  if (campaign.status === 'at_risk') return 'budget_pacing';
  if (campaign.status === 'paused') return 'lifecycle_stall';
  return 'roas_misalignment';
};

// Helper to generate actionable recommendation (kept concise for 2-line max display)
const generateRecommendation = (category: AlertCategory, _severity: 'critical' | 'warning' | 'info', campaignNames: string[]): string => {
  const mainCampaign = campaignNames[0]?.replace(/^(SOCIAL|VIDEO|SEARCH|DISPLAY|EMAIL)\s*-\s*/i, '') || 'Campaign';
  
  const recommendations: Record<AlertCategory, string> = {
    audience_overlap: `Consolidate audiences or exclude overlaps from lower performers`,
    budget_pacing: `Reduce daily cap on "${mainCampaign}" to prevent budget exhaustion`,
    roas_misalignment: `Shift budget to higher ROAS campaigns or pause underperformers`,
    lifecycle_stall: `Escalate blockers to team lead and assign clear owners`,
    attribution_leak: `Switch to multi-touch attribution for accurate measurement`,
  };
  
  return recommendations[category];
};

// Helper to generate urgency label
const generateUrgencyLabel = (severity: 'critical' | 'warning' | 'info', category: AlertCategory): string | undefined => {
  if (severity === 'critical') {
    if (category === 'budget_pacing') return '⏰ Act within 24h';
    if (category === 'lifecycle_stall') return '📅 Launch at risk';
    return '⚠️ Immediate action';
  }
  if (severity === 'warning') {
    if (category === 'audience_overlap') return '📊 Weekly review';
    return undefined;
  }
  return undefined;
};

export const CosmosAlertsPanel: React.FC<CosmosAlertsPanelProps> = ({ 
  isOpen, 
  onClose, 
  searchOpen = false,
  onFilterCampaigns,
  onSelectAlert
}) => {
  const { data } = useDashboard();
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('launch_date');
  
  // Custom select states (must be top-level to keep hooks order stable)
  const selectContainerRef = useRef<HTMLDivElement | null>(null);
  const sortSelectContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [sortSelectOpen, setSortSelectOpen] = useState(false);
  
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      // Close filter dropdown
      if (selectOpen && selectContainerRef.current && t && !selectContainerRef.current.contains(t)) {
        setSelectOpen(false);
      }
      // Close sort dropdown
      if (sortSelectOpen && sortSelectContainerRef.current && t && !sortSelectContainerRef.current.contains(t)) {
        setSortSelectOpen(false);
      }
    };
    window.addEventListener('mousedown', onDocClick);
    return () => window.removeEventListener('mousedown', onDocClick);
  }, [selectOpen, sortSelectOpen]);
  
  // Generate granular alerts from campaign data
  // Each alert is specific, affecting 2-4 campaigns max
  const granularAlerts = useMemo(() => {
    const alerts: GranularAlert[] = [];
    
    // Get all campaigns with native alerts
    const campaignsWithAlerts = data.campaigns.filter(c => 
      c.alert === true || (Array.isArray(c.alerts) && c.alerts.length > 0)
    );
    
    // Group by alert message similarity (clustering)
    const alertClusters = new Map<string, { campaigns: Campaign[]; alert: Alert; severity: 'critical' | 'warning' | 'info' }>();
    
    campaignsWithAlerts.forEach(campaign => {
      if (!Array.isArray(campaign.alerts)) return;
      
      campaign.alerts.forEach(alert => {
        if (!alert?.message) return;
        
        // Create cluster key based on message pattern
        const clusterKey = alert.message.toLowerCase()
          .replace(/\d+%/g, 'X%')
          .replace(/\$[\d,]+k?/gi, '$X')
          .replace(/"[^"]+"/g, '"CAMPAIGN"')
          .replace(/\d+ days?/g, 'N days');
        
        const existing = alertClusters.get(clusterKey);
        if (existing) {
          existing.campaigns.push(campaign);
          // Escalate severity if needed
          const sevRank = { critical: 3, warning: 2, info: 1 };
          const alertSev = (alert.severity || 'info') as 'critical' | 'warning' | 'info';
          if (sevRank[alertSev] > sevRank[existing.severity]) {
            existing.severity = alertSev;
          }
        } else {
          alertClusters.set(clusterKey, {
            campaigns: [campaign],
            alert,
            severity: (alert.severity || 'info') as 'critical' | 'warning' | 'info'
          });
        }
      });
    });
    
    // Convert clusters to granular alerts
    let alertIndex = 0;
    alertClusters.forEach((cluster, _key) => {
      const { campaigns, alert, severity } = cluster;
      if (campaigns.length === 0) return;
      
      const category = categorizeAlert(alert, campaigns[0]);
      const campaignNames = campaigns.map(c => c.name);
      const campaignIds = campaigns.map(c => c.id);
      
      // Generate impact metric based on category
      let impactMetric = '';
      let impactLabel = '';
      
      if (category === 'budget_pacing') {
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
        const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
        const spendRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        
        // Check if alert message mentions accelerated or high spend
        const isOverspend = alert.message?.toLowerCase().includes('overspend') || 
                           alert.message?.toLowerCase().includes('accelerat') ||
                           alert.message?.toLowerCase().includes('burning') ||
                           alert.message?.toLowerCase().includes('spike') ||
                           spendRate > 85;
        
        if (isOverspend) {
          const remaining = totalBudget - totalSpent;
          impactMetric = remaining > 0 ? `$${Math.round(remaining / 1000)}K` : `${Math.round(spendRate)}%`;
          impactLabel = remaining > 0 ? 'budget remaining' : 'spent';
        } else {
          impactMetric = `${Math.round(spendRate)}%`;
          impactLabel = 'budget utilized';
        }
      } else if (category === 'roas_misalignment') {
        const avgRoas = campaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / campaigns.length;
        impactMetric = `${avgRoas.toFixed(1)}x`;
        impactLabel = 'avg ROAS';
      } else if (category === 'audience_overlap') {
        // Extract overlap % from message if available
        const match = alert.message?.match(/(\d+)%/);
        impactMetric = match ? `${match[1]}%` : '45%';
        impactLabel = 'audience overlap';
      } else if (category === 'lifecycle_stall') {
        const match = alert.message?.match(/(\d+)\s*days/);
        impactMetric = match ? `${match[1]}` : '30+';
        impactLabel = 'days stalled';
      } else if (category === 'attribution_leak') {
        impactMetric = '~20%';
        impactLabel = 'credit misattributed';
      }
      
      // Generate title from alert message
      let title = alert.message || 'Alert detected';
      // Clean up the title
      title = title.split(':')[0].trim();
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      const recommendation = generateRecommendation(category, severity, campaignNames);
      const urgencyLabel = generateUrgencyLabel(severity, category);
      
      // Calculate days to launch (minimum across affected campaigns)
      const daysToLaunch = campaigns.reduce((min, c) => {
        const targetDate = (c as any).targetLaunchDate;
        if (!targetDate) return min;
        const target = new Date(targetDate);
        const today = new Date();
        const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays < min ? diffDays : min;
      }, 999);
      
      alerts.push({
        id: `granular-alert-${alertIndex++}`,
        category,
        severity,
        title,
        impactMetric,
        impactLabel,
        affectedCampaignIds: campaignIds,
        affectedCampaignNames: campaignNames,
        recommendation,
        urgencyLabel,
        daysToLaunch: daysToLaunch < 999 ? daysToLaunch : undefined,
      });
    });
    
    // Sort by severity (critical first) then by campaign count
    const sevRank = { critical: 3, warning: 2, info: 1 };
    return alerts.sort((a, b) => {
      const sevDiff = sevRank[b.severity] - sevRank[a.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.affectedCampaignIds.length - a.affectedCampaignIds.length;
    });
  }, [data.campaigns]);
  
  // Get counts by category
  const alertCounts = useMemo(() => {
    const counts: Record<AlertCategory | 'all', number> = {
      all: granularAlerts.length,
      audience_overlap: 0,
      lifecycle_stall: 0,
      budget_pacing: 0,
      roas_misalignment: 0,
      attribution_leak: 0
    };
    granularAlerts.forEach(a => {
      counts[a.category]++;
    });
    return counts;
  }, [granularAlerts]);
  
  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let alerts = selectedCategory === 'all' 
      ? [...granularAlerts] 
      : granularAlerts.filter(a => a.category === selectedCategory);
    
    // Apply sorting
    const sevRank = { critical: 3, warning: 2, info: 1 };
    const catRank: Record<AlertCategory, number> = { 
      audience_overlap: 5, 
      budget_pacing: 4, 
      roas_misalignment: 3, 
      lifecycle_stall: 2, 
      attribution_leak: 1 
    };
    
    switch (sortBy) {
      case 'launch_date':
        // Sort by days to launch (ascending - closest first)
        alerts.sort((a, b) => {
          const aDays = a.daysToLaunch ?? 999;
          const bDays = b.daysToLaunch ?? 999;
          return aDays - bDays;
        });
        break;
      case 'severity':
        alerts.sort((a, b) => sevRank[b.severity] - sevRank[a.severity]);
        break;
      case 'impact':
        // Sort by campaign count (more campaigns = higher impact)
        alerts.sort((a, b) => b.affectedCampaignIds.length - a.affectedCampaignIds.length);
        break;
      case 'category':
        alerts.sort((a, b) => catRank[b.category] - catRank[a.category]);
        break;
    }
    
    return alerts;
  }, [granularAlerts, selectedCategory, sortBy]);
  
  // Total affected campaigns count
  const totalAffectedCampaigns = useMemo(() => {
    const ids = new Set<string>();
    granularAlerts.forEach(a => a.affectedCampaignIds.forEach(id => ids.add(id)));
    return ids.size;
  }, [granularAlerts]);
  
  // Handle alert tile click - filter campaigns in Cosmos view
  const handleAlertClick = (alert: GranularAlert) => {
    if (activeAlertId === alert.id) {
      setActiveAlertId(null);
      onFilterCampaigns?.(null);
      onSelectAlert?.(null);
    } else {
      setActiveAlertId(alert.id);
      onFilterCampaigns?.(alert.affectedCampaignIds);
      onSelectAlert?.(alert);
    }
  };
  
  // Clear filter and close
  const handleClose = () => {
    setActiveAlertId(null);
    onFilterCampaigns?.(null);
    onSelectAlert?.(null);
    onClose();
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1, top: searchOpen ? 242 : 97 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-24 bottom-6 w-[360px] rounded-2xl z-[60] overflow-hidden flex flex-col"
          style={{ 
            top: searchOpen ? 242 : 97,
            // Glassmorphism - matching Launch Readiness Panel exactly
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
          {/* Header - matching Launch Readiness Panel */}
          <div 
            className="flex items-center justify-between p-5 pb-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-9 h-9 min-w-[36px] rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
                }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-semibold text-sm tracking-wide">Portfolio Alerts</h2>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {totalAffectedCampaigns} campaign{totalAffectedCampaigns !== 1 ? 's' : ''} • {granularAlerts.length} alert{granularAlerts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="p-2 rounded-lg transition-all duration-200 flex-shrink-0 ml-2 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* Filter & Sort Row */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div className="flex items-center gap-2">
              {/* Filter Dropdown */}
              <div ref={selectContainerRef} className="relative inline-block flex-1">
                <button
                  type="button"
                  onClick={() => { setSelectOpen(o => !o); setSortSelectOpen(false); }}
                  className="w-full pr-7 text-left text-[12px] rounded-lg px-2.5 py-1.5 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(35, 35, 40, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 30, 35, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {selectedCategory === 'all'
                    ? `All (${alertCounts.all})`
                    : `${ALERT_CATEGORY_INFO[selectedCategory].label} (${alertCounts[selectedCategory]})`}
                </button>
                <ChevronDown 
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-transform duration-200"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    transform: selectOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                  }}
                />
                {selectOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 top-full mt-2 w-full rounded-xl shadow-2xl z-[1000] overflow-hidden"
                    style={{
                      background: 'rgba(24, 24, 28, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <ul className="py-1.5 max-h-64 overflow-auto">
                      <li>
                        <button
                          type="button"
                          onClick={() => { setSelectedCategory('all'); setSelectOpen(false); }}
                          className="w-full text-left px-3 py-2 text-[12px] transition-all duration-150"
                          style={{
                            background: selectedCategory === 'all' ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                            color: selectedCategory === 'all' ? '#93C5FD' : 'rgba(255, 255, 255, 0.85)',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedCategory !== 'all') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedCategory !== 'all') e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          All Alerts ({alertCounts.all})
                        </button>
                      </li>
                      {(Object.keys(ALERT_CATEGORY_INFO) as AlertCategory[]).map((category) => {
                        const count = alertCounts[category];
                        if (count === 0) return null;
                        const label = ALERT_CATEGORY_INFO[category].label;
                        const active = selectedCategory === category;
                        return (
                          <li key={category}>
                            <button
                              type="button"
                              onClick={() => { setSelectedCategory(category); setSelectOpen(false); }}
                              className="w-full text-left px-3 py-2 text-[12px] transition-all duration-150"
                              style={{
                                background: active ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                                color: active ? '#93C5FD' : 'rgba(255, 255, 255, 0.85)',
                              }}
                              onMouseEnter={(e) => {
                                if (!active) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                if (!active) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {label} ({count})
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div ref={sortSelectContainerRef} className="relative inline-block">
                <button
                  type="button"
                  onClick={() => { setSortSelectOpen(o => !o); setSelectOpen(false); }}
                  className="pr-7 text-left text-[12px] rounded-lg px-2.5 py-1.5 outline-none transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(35, 35, 40, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 30, 35, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
                </button>
                <ChevronDown 
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-transform duration-200"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    transform: sortSelectOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                  }}
                />
                {sortSelectOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-2 w-36 rounded-xl shadow-2xl z-[1000] overflow-hidden"
                    style={{
                      background: 'rgba(24, 24, 28, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <ul className="py-1.5">
                      {SORT_OPTIONS.map((option) => {
                        const active = sortBy === option.value;
                        return (
                          <li key={option.value}>
                            <button
                              type="button"
                              onClick={() => { setSortBy(option.value); setSortSelectOpen(false); }}
                              className="w-full text-left px-3 py-2 text-[12px] transition-all duration-150"
                              style={{
                                background: active ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                                color: active ? '#93C5FD' : 'rgba(255, 255, 255, 0.85)',
                              }}
                              onMouseEnter={(e) => {
                                if (!active) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                if (!active) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {option.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Granular Alert Tiles - Individual actionable alerts */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.02)' }}>
            <div className="p-3 space-y-2.5">
              {filteredAlerts.length === 0 && (
                <div className="text-gray-400 text-sm text-center py-8">
                  No alerts in this category
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {filteredAlerts.map((alert, index) => {
                  const categoryInfo = ALERT_CATEGORY_INFO[alert.category];
                  const IconComponent = CategoryIcon[alert.category];
                  const isActive = activeAlertId === alert.id;
                  const severityStyles = getSeverityStyles(alert.severity, isActive);
                  
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: severityStyles.scale,
                      }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{
                        layout: { type: 'spring', damping: 25, stiffness: 200 },
                        opacity: { duration: 0.3, delay: index * 0.03 },
                        y: { duration: 0.3, delay: index * 0.03 },
                        scale: { duration: 0.2 },
                      }}
                      whileHover={{ 
                        y: isActive ? 0 : -2,
                        boxShadow: isActive 
                          ? severityStyles.cardShadow 
                          : '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      }}
                      whileTap={{ y: 0, scale: 0.99 }}
                      className="relative rounded-xl cursor-pointer transition-colors duration-200 overflow-hidden"
                      role="button"
                      tabIndex={0}
                      aria-label={`${alert.category} alert: ${alert.title}`}
                      aria-selected={isActive}
                      style={{
                        background: severityStyles.cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${severityStyles.cardBorder}`,
                        boxShadow: severityStyles.cardShadow,
                      }}
                      onClick={() => handleAlertClick(alert)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAlertClick(alert); }}
                    >
                      <div className="p-3.5">
                        {/* Header Row: Icon + Title + Severity Badge (matching right panel hierarchy) */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Category Icon */}
                            <div 
                              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background: severityStyles.iconBg,
                                border: `1px solid ${severityStyles.iconBorder}`,
                              }}
                            >
                              <IconComponent 
                                className="w-3 h-3"
                                style={{ color: severityStyles.iconColor }}
                              />
                            </div>
                            {/* Alert Title - MAIN HEADING (matches right panel) */}
                            <h3 
                              className="text-[14px] font-semibold leading-snug flex-1 min-w-0"
                              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                            >
                              {alert.title}
                            </h3>
                          </div>
                          {/* Severity badge */}
                          <div 
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                            style={{
                              background: severityStyles.badgeBg,
                              border: `1px solid ${severityStyles.badgeBorder}`,
                              color: severityStyles.badgeText,
                            }}
                          >
                            {alert.severity}
                          </div>
                        </div>
                        
                        {/* Category label - SUBHEADING below title (matches right panel) */}
                        <div 
                          className="text-[11px] uppercase tracking-wider font-medium mb-2.5 ml-[34px]"
                          style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                        >
                          {categoryInfo.label}
                        </div>
                        
                        {/* Impact Metric Row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-baseline gap-2">
                            <span 
                              className="text-xl font-bold"
                              style={{ color: severityStyles.iconColor }}
                            >
                              {alert.impactMetric}
                            </span>
                            <span 
                              className="text-[11px]"
                              style={{ color: 'rgba(255, 255, 255, 0.55)' }}
                            >
                              {alert.impactLabel}
                            </span>
                          </div>
                          {alert.urgencyLabel && (
                            <div 
                              className="ml-auto px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1.5"
                              style={{
                                background: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                                color: alert.severity === 'critical' ? '#FCA5A5' : '#FDBA74',
                              }}
                            >
                              <Timer className="w-3 h-3" />
                              {alert.urgencyLabel.replace(/[⏰📅⚠️📊🔄]/g, '').trim()}
                            </div>
                          )}
                        </div>
                        
                        {/* Affected Campaigns - Tags with campaign count inline */}
                        <div className="mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Campaign count badge - inline with tags */}
                            <span 
                              className="px-2 py-1 rounded-md text-[11px] font-bold"
                              style={{
                                background: severityStyles.badgeBg,
                                border: `1px solid ${severityStyles.badgeBorder}`,
                                color: severityStyles.badgeText,
                              }}
                            >
                              {alert.affectedCampaignIds.length}
                            </span>
                            {alert.affectedCampaignNames.slice(0, 3).map((name, i) => {
                              // Extract short name (remove channel prefix)
                              const shortName = name.replace(/^(SOCIAL|VIDEO|SEARCH|DISPLAY|EMAIL)\s*-\s*/i, '');
                              return (
                                <span 
                                  key={i}
                                  className="px-2 py-1 rounded-md text-[11px] truncate max-w-[120px] hover:bg-white/10 transition-colors"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                  }}
                                  title={name}
                                >
                                  {shortName}
                                </span>
                              );
                            })}
                            {alert.affectedCampaignNames.length > 3 && (
                              <span 
                                className="px-2 py-1 rounded-md text-[11px]"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                }}
                              >
                                +{alert.affectedCampaignNames.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Recommendation text - max 2 lines */}
                        <div className="flex items-start gap-2">
                          <Target 
                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" 
                            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                          />
                          <span 
                            className="text-[11px] leading-relaxed"
                            style={{
                              color: 'rgba(255, 255, 255, 0.65)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {alert.recommendation}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
