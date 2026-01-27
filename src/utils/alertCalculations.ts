/* cspell:disable-file */
import { Campaign, CategorizedAlert, AlertCategory, FunnelStage } from '../types';

// ROAS benchmarks per funnel stage
const ROAS_BENCHMARKS: Record<FunnelStage, [number, number]> = {
  awareness: [0.5, 2.5],
  consideration: [1.0, 3.5],
  conversion: [2.0, 5.0],
  retention: [3.0, 7.0]
};

// Expected days per lifecycle stage
const EXPECTED_DAYS: Record<string, number> = {
  ideation: 14,
  planning: 21,
  development: 28,
  qa_ready: 7,
  launching: 14,
  active: 90,
  closing: 14
};

// Category display info
export const ALERT_CATEGORY_INFO: Record<AlertCategory, { label: string; color: string; icon: string }> = {
  audience_overlap: { label: 'Audience Fatigue', color: '#F59E0B', icon: 'Users' },
  lifecycle_stall: { label: 'Lifecycle Stall', color: '#8B5CF6', icon: 'Clock' },
  budget_pacing: { label: 'Budget Pacing', color: '#3B82F6', icon: 'DollarSign' },
  roas_misalignment: { label: 'ROAS Misalignment', color: '#EF4444', icon: 'TrendingDown' },
  attribution_leak: { label: 'Attribution Leak', color: '#10B981', icon: 'Share2' }
};

/**
 * Calculate all categorized alerts from campaign data
 */
export function calculateCategorizedAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  
  // 1. Audience Overlap (Self-Competition)
  alerts.push(...calculateAudienceOverlapAlerts(campaigns));
  
  // 2. Lifecycle Stall (Velocity Blockers)
  alerts.push(...calculateLifecycleStallAlerts(campaigns));
  
  // 3. Budget Pacing Anomaly
  alerts.push(...calculateBudgetPacingAlerts(campaigns));
  
  // 4. ROAS-Funnel Misalignment
  alerts.push(...calculateRoasMisalignmentAlerts(campaigns));
  
  // 5. Cross-Channel Attribution Leak
  alerts.push(...calculateAttributionLeakAlerts(campaigns));
  
  // Sort by severity and impact
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.affectedCampaignIds.length - a.affectedCampaignIds.length;
  });
}

/**
 * 1. Audience Overlap Detection
 * Groups campaigns by channel+funnelStage and detects overlapping targeting
 */
function calculateAudienceOverlapAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  const activeCampaigns = campaigns.filter(c => c.lifecycleStage !== 'closing' && c.status !== 'paused');
  
  // Group by channel + funnelStage
  const groups: Record<string, Campaign[]> = {};
  activeCampaigns.forEach(c => {
    const key = `${c.channel}-${c.funnelStage}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  
  // Detect overlaps within groups
  Object.entries(groups).forEach(([key, groupCampaigns]) => {
    if (groupCampaigns.length < 2) return;
    
    // Find campaigns with similar naming patterns (Brand, Retargeting, Prospecting, etc.)
    const patterns = ['brand', 'retarget', 'prospect', 'awareness', 'conversion', 'sale', 'promo'];
    
    patterns.forEach(pattern => {
      const matching = groupCampaigns.filter(c => 
        c.name.toLowerCase().includes(pattern)
      );
      
      if (matching.length >= 2) {
        const totalSpent = matching.reduce((sum, c) => sum + c.spent, 0);
        const overlapScore = matching.length / groupCampaigns.length;
        
        if (totalSpent > 30000 || overlapScore > 0.4) {
          const [channel, funnel] = key.split('-');
          alerts.push({
            id: `ao-${key}-${pattern}`,
            category: 'audience_overlap',
            title: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Audience Collision`,
            description: `${matching.length} campaigns in ${channel.toUpperCase()} ${funnel} stage targeting similar "${pattern}" audiences`,
            impact: `Est. $${Math.round(totalSpent * 0.15 / 1000)}K in inflated bid costs`,
            severity: totalSpent > 50000 ? 'critical' : 'warning',
            affectedCampaignIds: matching.map(c => c.id),
            metrics: [
              { value: matching.length, label: 'Overlapping Campaigns' },
              { value: `${Math.round(overlapScore * 100)}%`, label: 'Overlap Score' },
              { value: `$${Math.round(totalSpent / 1000)}K`, label: 'Combined Spend' }
            ],
            recommendation: 'Consolidate audiences or implement negative targeting exclusions',
            timestamp: new Date()
          });
        }
      }
    });
  });
  
  // Also check for same-channel overlap regardless of funnel stage
  const channelGroups: Record<string, Campaign[]> = {};
  activeCampaigns.forEach(c => {
    if (!channelGroups[c.channel]) channelGroups[c.channel] = [];
    channelGroups[c.channel].push(c);
  });
  
  Object.entries(channelGroups).forEach(([, channelCampaigns]) => {
    // Check for campaigns with very similar names
    for (let i = 0; i < channelCampaigns.length; i++) {
      for (let j = i + 1; j < channelCampaigns.length; j++) {
        const c1 = channelCampaigns[i];
        const c2 = channelCampaigns[j];
        
        // Check if names share significant words
        const words1 = c1.name.toLowerCase().split(/[\s-]+/);
        const words2 = c2.name.toLowerCase().split(/[\s-]+/);
        const shared = words1.filter(w => words2.includes(w) && w.length > 3);
        
        if (shared.length >= 2 && (c1.spent + c2.spent) > 40000) {
          const existingAlert = alerts.find(a => 
            a.affectedCampaignIds.includes(c1.id) && a.affectedCampaignIds.includes(c2.id)
          );
          if (!existingAlert) {
            alerts.push({
              id: `ao-pair-${c1.id}-${c2.id}`,
              category: 'audience_overlap',
              title: 'Campaign Pair Collision',
              description: `"${c1.name}" and "${c2.name}" may be competing for same audience`,
              impact: `Shared keywords: ${shared.join(', ')}`,
              severity: 'warning',
              affectedCampaignIds: [c1.id, c2.id],
              metrics: [
                { value: `$${Math.round((c1.spent + c2.spent) / 1000)}K`, label: 'Combined Spend' },
                { value: shared.length, label: 'Shared Terms' }
              ],
              recommendation: 'Review targeting overlap and consider audience exclusions',
              timestamp: new Date()
            });
          }
        }
      }
    }
  });
  
  return alerts;
}

/**
 * 2. Lifecycle Stall Detection
 * Identifies campaigns stuck in early stages past expected timelines
 */
function calculateLifecycleStallAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  const now = new Date();
  
  const earlyStages = ['planning', 'development', 'qa_ready', 'ideation'];
  const stalledCampaigns = campaigns.filter(c => {
    if (!earlyStages.includes(c.lifecycleStage)) return false;
    
    const createdDate = new Date(c.createdDate);
    const daysOld = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = EXPECTED_DAYS[c.lifecycleStage] || 21;
    
    return daysOld > expectedDays + 7 && c.readinessPercent < 70;
  });
  
  // Group stalled campaigns by lifecycle stage
  const stageGroups: Record<string, Campaign[]> = {};
  stalledCampaigns.forEach(c => {
    if (!stageGroups[c.lifecycleStage]) stageGroups[c.lifecycleStage] = [];
    stageGroups[c.lifecycleStage].push(c);
  });
  
  Object.entries(stageGroups).forEach(([stage, stageCampaigns]) => {
    // Check for upcoming launch deadlines
    const urgentCampaigns = stageCampaigns.filter(c => {
      const launchDate = new Date(c.targetLaunchDate);
      const daysUntilLaunch = Math.floor((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilLaunch < 14 && daysUntilLaunch > -7;
    });
    
    if (urgentCampaigns.length > 0) {
      alerts.push({
        id: `ls-urgent-${stage}`,
        category: 'lifecycle_stall',
        title: `Urgent: ${stage.replace('_', ' ').toUpperCase()} Stage Blocked`,
        description: `${urgentCampaigns.length} campaigns with imminent launch dates stalled in ${stage}`,
        impact: `Launch delays impacting funnel activation`,
        severity: 'critical',
        affectedCampaignIds: urgentCampaigns.map(c => c.id),
        metrics: [
          { value: urgentCampaigns.length, label: 'Blocked Campaigns' },
          { value: `<14 days`, label: 'Until Launch' },
          { value: `${Math.round(urgentCampaigns.reduce((sum, c) => sum + c.readinessPercent, 0) / urgentCampaigns.length)}%`, label: 'Avg Readiness' }
        ],
        recommendation: 'Prioritize unblocking resources and escalate to stakeholders',
        timestamp: new Date()
      });
    }
    
    const nonUrgent = stageCampaigns.filter(c => !urgentCampaigns.includes(c));
    if (nonUrgent.length > 0) {
      alerts.push({
        id: `ls-stall-${stage}`,
        category: 'lifecycle_stall',
        title: `${stage.replace('_', ' ').charAt(0).toUpperCase() + stage.replace('_', ' ').slice(1)} Stage Velocity Drop`,
        description: `${nonUrgent.length} campaigns stalled beyond expected timeline`,
        impact: `Funnel coverage gaps widening`,
        severity: 'warning',
        affectedCampaignIds: nonUrgent.map(c => c.id),
        metrics: [
          { value: nonUrgent.length, label: 'Stalled Campaigns' },
          { value: `+${Math.round((EXPECTED_DAYS[stage] || 21) * 0.5)} days`, label: 'Over Expected' }
        ],
        recommendation: 'Review blockers and reallocate resources',
        timestamp: new Date()
      });
    }
  });
  
  return alerts;
}

/**
 * 3. Budget Pacing Anomaly Detection
 * Identifies campaigns with abnormal spend rates for their lifecycle stage
 */
function calculateBudgetPacingAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  
  // Expected weekly pace by stage
  const expectedPace: Record<string, number> = {
    launching: 0.15, // 15% per week
    active: 0.04,    // 4% per week  
    closing: 0.20    // 20% per week of remaining
  };
  
  const overspenders: Campaign[] = [];
  const underspenders: Campaign[] = [];
  
  campaigns.forEach(c => {
    if (!['launching', 'active', 'closing'].includes(c.lifecycleStage)) return;
    
    const paceRatio = c.budget > 0 ? c.spent / c.budget : 0;
    const expectedWeeklyPace = expectedPace[c.lifecycleStage] || 0.04;
    
    // Estimate weeks in stage (simplified)
    const weeksInStage = c.lifecycleStage === 'active' ? 4 : 2;
    const expectedSpentRatio = expectedWeeklyPace * weeksInStage;
    const actualPaceRatio = paceRatio / Math.max(expectedSpentRatio, 0.01);
    
    if (actualPaceRatio > 1.3 && paceRatio > 0.5) {
      overspenders.push(c);
    } else if (actualPaceRatio < 0.4 && c.lifecycleStage === 'active' && paceRatio < 0.3) {
      underspenders.push(c);
    }
  });
  
  // Group overspenders by severity
  const criticalOverspend = overspenders.filter(c => c.spent / c.budget > 0.9);
  const warningOverspend = overspenders.filter(c => c.spent / c.budget <= 0.9);
  
  if (criticalOverspend.length > 0) {
    alerts.push({
      id: 'bp-overspend-critical',
      category: 'budget_pacing',
      title: 'Critical Budget Overrun',
      description: `${criticalOverspend.length} campaigns at >90% budget with accelerated pace`,
      impact: `$${Math.round(criticalOverspend.reduce((sum, c) => sum + (c.spent - c.budget * 0.8), 0) / 1000)}K over planned spend`,
      severity: 'critical',
      affectedCampaignIds: criticalOverspend.map(c => c.id),
      metrics: [
        { value: criticalOverspend.length, label: 'Campaigns at Risk' },
        { value: `>90%`, label: 'Budget Used' },
        { value: `$${Math.round(criticalOverspend.reduce((sum, c) => sum + c.spent, 0) / 1000)}K`, label: 'Total Spent' }
      ],
      recommendation: 'Pause or reduce daily caps immediately',
      timestamp: new Date()
    });
  }
  
  if (warningOverspend.length > 0) {
    alerts.push({
      id: 'bp-overspend-warning',
      category: 'budget_pacing',
      title: 'Elevated Spend Trajectory',
      description: `${warningOverspend.length} campaigns pacing ahead of schedule`,
      impact: `May exhaust budget before campaign end dates`,
      severity: 'warning',
      affectedCampaignIds: warningOverspend.map(c => c.id),
      metrics: [
        { value: warningOverspend.length, label: 'Campaigns' },
        { value: `130%+`, label: 'Of Expected Pace' }
      ],
      recommendation: 'Review and adjust daily caps',
      timestamp: new Date()
    });
  }
  
  if (underspenders.length > 0) {
    alerts.push({
      id: 'bp-underspend',
      category: 'budget_pacing',
      title: 'Budget Underutilization',
      description: `${underspenders.length} active campaigns significantly underspending`,
      impact: `Opportunity cost: untapped budget capacity`,
      severity: 'info',
      affectedCampaignIds: underspenders.map(c => c.id),
      metrics: [
        { value: underspenders.length, label: 'Campaigns' },
        { value: `<30%`, label: 'Budget Used' },
        { value: `$${Math.round(underspenders.reduce((sum, c) => sum + (c.budget - c.spent), 0) / 1000)}K`, label: 'Unused Budget' }
      ],
      recommendation: 'Consider scaling or reallocating to higher performers',
      timestamp: new Date()
    });
  }
  
  return alerts;
}

/**
 * 4. ROAS-Funnel Misalignment Detection
 * Identifies campaigns with ROAS outside expected range for their funnel stage
 */
function calculateRoasMisalignmentAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  
  const misalignedCampaigns = campaigns.filter(c => {
    if (c.lifecycleStage === 'closing' || c.lifecycleStage === 'ideation') return false;
    
    const [min, max] = ROAS_BENCHMARKS[c.funnelStage];
    return c.roas < min || c.roas > max;
  });
  
  // Group by type of misalignment
  const underperformers: Record<FunnelStage, Campaign[]> = {
    awareness: [], consideration: [], conversion: [], retention: []
  };
  const overperformers: Record<FunnelStage, Campaign[]> = {
    awareness: [], consideration: [], conversion: [], retention: []
  };
  
  misalignedCampaigns.forEach(c => {
    const [min, max] = ROAS_BENCHMARKS[c.funnelStage];
    if (c.roas < min) {
      underperformers[c.funnelStage].push(c);
    } else if (c.roas > max) {
      overperformers[c.funnelStage].push(c);
    }
  });
  
  // Create alerts for underperformers by stage
  Object.entries(underperformers).forEach(([stage, stageCampaigns]) => {
    if (stageCampaigns.length === 0) return;
    
    const highBudget = stageCampaigns.filter(c => c.budget > 30000);
    const severity = highBudget.length > 0 ? 'critical' : 'warning';
    
    alerts.push({
      id: `rm-under-${stage}`,
      category: 'roas_misalignment',
      title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} ROAS Below Target`,
      description: `${stageCampaigns.length} campaigns underperforming for ${stage} objectives`,
      impact: `Below ${ROAS_BENCHMARKS[stage as FunnelStage][0]}x minimum benchmark`,
      severity,
      affectedCampaignIds: stageCampaigns.map(c => c.id),
      metrics: [
        { value: stageCampaigns.length, label: 'Underperforming' },
        { value: `${(stageCampaigns.reduce((sum, c) => sum + c.roas, 0) / stageCampaigns.length).toFixed(1)}x`, label: 'Avg ROAS' },
        { value: `${ROAS_BENCHMARKS[stage as FunnelStage][0]}x`, label: 'Target Min' }
      ],
      recommendation: 'Review targeting and creative strategy',
      timestamp: new Date()
    });
  });
  
  // Create alerts for overperformers (TOFU over-optimization)
  const awarenessOver = overperformers.awareness;
  if (awarenessOver.length > 0) {
    alerts.push({
      id: 'rm-over-awareness',
      category: 'roas_misalignment',
      title: 'TOFU Over-Optimization Risk',
      description: `${awarenessOver.length} awareness campaigns exceeding ROAS ceiling`,
      impact: `May be cannibalizing conversion stage performance`,
      severity: 'warning',
      affectedCampaignIds: awarenessOver.map(c => c.id),
      metrics: [
        { value: awarenessOver.length, label: 'Over-Optimized' },
        { value: `${(awarenessOver.reduce((sum, c) => sum + c.roas, 0) / awarenessOver.length).toFixed(1)}x`, label: 'Avg ROAS' },
        { value: `${ROAS_BENCHMARKS.awareness[1]}x`, label: 'Target Max' }
      ],
      recommendation: 'Rebalance toward broader reach objectives',
      timestamp: new Date()
    });
  }
  
  return alerts;
}

/**
 * 5. Cross-Channel Attribution Leak Detection
 * Identifies channels with disproportionate revenue vs spend share
 */
function calculateAttributionLeakAlerts(campaigns: Campaign[]): CategorizedAlert[] {
  const alerts: CategorizedAlert[] = [];
  
  // Aggregate by channel
  const channelStats: Record<string, { spend: number; revenue: number; campaigns: Campaign[] }> = {};
  let totalSpend = 0;
  let totalRevenue = 0;
  
  campaigns.forEach(c => {
    if (c.lifecycleStage === 'closing') return;
    
    if (!channelStats[c.channel]) {
      channelStats[c.channel] = { spend: 0, revenue: 0, campaigns: [] };
    }
    const revenue = c.spent * c.roas;
    channelStats[c.channel].spend += c.spent;
    channelStats[c.channel].revenue += revenue;
    channelStats[c.channel].campaigns.push(c);
    totalSpend += c.spent;
    totalRevenue += revenue;
  });
  
  // Detect attribution leaks
  Object.entries(channelStats).forEach(([channel, stats]) => {
    const spendShare = stats.spend / totalSpend;
    const revenueShare = stats.revenue / totalRevenue;
    const disparity = revenueShare / spendShare;
    
    if (disparity > 1.5 && stats.campaigns.length >= 3) {
      // This channel is getting more credit than its spend share
      alerts.push({
        id: `al-dominant-${channel}`,
        category: 'attribution_leak',
        title: `${channel.charAt(0).toUpperCase() + channel.slice(1)} Attribution Concentration`,
        description: `${channel} capturing ${Math.round(revenueShare * 100)}% of revenue on ${Math.round(spendShare * 100)}% of spend`,
        impact: `Other channels may be undervalued in attribution`,
        severity: disparity > 2 ? 'warning' : 'info',
        affectedCampaignIds: stats.campaigns.map(c => c.id),
        metrics: [
          { value: `${Math.round(revenueShare * 100)}%`, label: 'Revenue Share' },
          { value: `${Math.round(spendShare * 100)}%`, label: 'Spend Share' },
          { value: `${disparity.toFixed(1)}x`, label: 'Disparity Ratio' }
        ],
        recommendation: 'Test incrementality and review attribution model',
        timestamp: new Date()
      });
    } else if (disparity < 0.5 && stats.campaigns.length >= 3 && stats.spend > 50000) {
      // This channel is underperforming its spend share
      alerts.push({
        id: `al-undervalued-${channel}`,
        category: 'attribution_leak',
        title: `${channel.charAt(0).toUpperCase() + channel.slice(1)} Attribution Gap`,
        description: `${channel} generating only ${Math.round(revenueShare * 100)}% revenue on ${Math.round(spendShare * 100)}% spend`,
        impact: `$${Math.round(stats.spend / 1000)}K invested with below-average returns`,
        severity: 'warning',
        affectedCampaignIds: stats.campaigns.map(c => c.id),
        metrics: [
          { value: `${Math.round(revenueShare * 100)}%`, label: 'Revenue Share' },
          { value: `${Math.round(spendShare * 100)}%`, label: 'Spend Share' },
          { value: stats.campaigns.length, label: 'Campaigns' }
        ],
        recommendation: 'Review channel strategy and consider reallocation',
        timestamp: new Date()
      });
    }
  });
  
  return alerts;
}
