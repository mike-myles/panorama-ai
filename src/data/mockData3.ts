// @ts-nocheck
/* cspell:disable-file */
import { CampaignData, Alert, Campaign, Channel, DailyMetric, CampaignStatus, Audience, FunnelStage, LifecycleStage } from '../types';

// Fixed "today" and ranges for lifecycle fields per requirements
const TODAY_ANCHOR = new Date('2025-11-25T00:00:00Z');
const TARGET_START = new Date('2025-01-01T00:00:00Z');
const TARGET_END = new Date('2026-01-01T00:00:00Z');
const CREATED_MIN = new Date('2024-01-01T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// NEW FRAMEWORK: Marketing Funnel Stage, Lifecycle Stage, Readiness Percent
// ============================================================================

// Funnel Stage: Determines which orbital plane (angle) a campaign appears on
// Uses campaign ID to force even distribution across all 4 stages
const determineFunnelStage = (campaignId: string, channel: string, name: string): FunnelStage => {
  const stages: FunnelStage[] = ['awareness', 'consideration', 'conversion', 'retention'];
  const idNum = parseInt(campaignId.replace(/\D/g, ''), 10) || 0;
  
  // Use campaign ID mod 4 to ensure even distribution across all 4 funnel stages
  const stageIndex = idNum % 4;
  return stages[stageIndex];
};

// Lifecycle Stage: Determines which ring a campaign appears on (distance from sun)
// Uses campaign ID to force distribution across all 7 stages
const determineLifecycleStage = (campaignId: string): LifecycleStage => {
  const stages: LifecycleStage[] = ['ideation', 'planning', 'development', 'qa_ready', 'launching', 'active', 'closing'];
  const idNum = parseInt(campaignId.replace(/\D/g, ''), 10) || 0;
  
  // Use campaign ID mod 7 to ensure distribution across all 7 lifecycle stages
  const stageIndex = idNum % 7;
  return stages[stageIndex];
};

// Readiness Percent: Determines planet color (green/blue/red)
// ALIGNED WITH STATUS: status displayed in panel matches planet color
// - 'active' → 80-98% (GREEN/On Track) - healthy campaigns
// - 'at_risk' → 10-48% (RED/At Risk) - campaigns needing attention show as red
// - 'paused' → 50-78% (BLUE/Needs Attention) - paused campaigns in middle tier
const calculateReadinessFromStatus = (status: 'active' | 'at_risk' | 'paused', campaignId: string): number => {
  const seededVal = seededRandom(campaignId + ':readiness');
  
  if (status === 'active') {
    // GREEN: 80-98% readiness (On Track)
    return Math.round(80 + seededVal * 18);
  } else if (status === 'at_risk') {
    // RED: 10-48% readiness (At Risk) - matches "At Risk" label in panel
    return Math.round(10 + seededVal * 38);
  } else {
    // BLUE: 50-78% readiness (Needs Attention) - paused campaigns
    return Math.round(50 + seededVal * 28);
  }
};

// Legacy function for backwards compatibility - uses campaign ID mod 3
const calculateReadinessPercent = (campaignId: string): number => {
  const idNum = parseInt(campaignId.replace(/\D/g, ''), 10) || 0;
  const category = idNum % 3;
  const seededVal = seededRandom(campaignId + ':readiness');
  
  if (category === 0) {
    // ~33% RED: 10-48% readiness
    return Math.round(10 + seededVal * 38);
  } else if (category === 1) {
    // ~33% YELLOW: 52-78% readiness
    return Math.round(52 + seededVal * 26);
  } else {
    // ~34% GREEN: 82-98% readiness
    return Math.round(82 + seededVal * 16);
  }
};

const CREATED_BY_NAMES = [
  'Kai Adams',
  'Lena Davies',
  'Omar Hassan',
  'Priya Johnson',
  'Samuel Lee',
  'Sophia Chen',
  'Ethan Kim',
  'Chloe Garcia',
  'David Miller',
  'Olivia Smith',
  'Noah Williams',
  'Emma Brown'
];

// Generate daily metrics for the last 30 days
const generateDailyMetrics = (baseSpend: number, baseRoas: number, variance: number = 0.2, seedKey: string = 'metrics'): DailyMetric[] => {
  const metrics: DailyMetric[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const rSpend = seededRandom(`${seedKey}:spend:${i}`);
    const rRoas = seededRandom(`${seedKey}:roas:${i}`);
    const spend = baseSpend * (1 + (rSpend - 0.5) * variance);
    const roas = baseRoas * (1 + (rRoas - 0.5) * variance);
    const revenue = spend * roas;
    const conversions = Math.floor(revenue / 50); // Assume $50 per conversion
    const clicks = Math.floor(spend / 2); // Assume $2 CPC
    const impressions = clicks * 100; // Assume 1% CTR
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      conversions,
      clicks,
      impressions,
      ctr: 1.0,
      cpc: 2.0
    });
  }
  
  return metrics;
};

// Deterministic pseudo-random in [0,1) based on a string key (hoisted for early use)
function seededRandom(key: string): number {
  let h = 2166136261 >>> 0; // FNV-1a base
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return (h % 100000) / 100000; // 0..0.99999
}

// Critical alerts - Frescopà Coffee Brand
const alerts: Alert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    message: 'Budget overspend on Holiday Indulgence: $15K over in 5 days',
    layer: 2,
    campaignId: 'camp-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    percentComplete: 35,
    suggestedActions: [
      {
        id: 'action-1',
        title: 'Pause Campaign',
        expectedOutcome: 'Stop $3K/day spend immediately',
        confidence: 95,
        type: 'pause'
      },
      {
        id: 'action-2',
        title: 'Reduce Daily Cap to $2K',
        expectedOutcome: 'Limit spend while maintaining coffee brand presence',
        confidence: 85,
        type: 'budget_adjust',
        params: { newDailyCap: 2000 }
      }
    ]
  },
  {
    id: 'alert-2',
    severity: 'warning',
    message: 'ROAS dropped 30% on cart abandonment retargeting in last 7 days',
    layer: 3,
    campaignId: 'camp-3',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    percentComplete: 62,
    suggestedActions: [
      {
        id: 'action-3',
        title: 'Review Targeting',
        expectedOutcome: 'Identify underperforming coffee subscriber segments',
        confidence: 75,
        type: 'custom'
      },
      {
        id: 'action-4',
        title: 'Test New Creatives',
        expectedOutcome: 'Improve engagement with fresh seasonal imagery',
        confidence: 70,
        type: 'creative_swap'
      }
    ]
  },
  {
    id: 'alert-3',
    severity: 'critical',
    message: 'CTR dropped 40% on Limited Brew Drop launch',
    layer: 3,
    campaignId: 'camp-5',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    percentComplete: 18,
    suggestedActions: [
      {
        id: 'action-5',
        title: 'Swap Creative',
        expectedOutcome: 'Restore CTR with new seasonal blend imagery',
        confidence: 80,
        type: 'creative_swap'
      }
    ]
  },
  {
    id: 'alert-4',
    severity: 'info',
    message: 'Budget utilization at 65% on Frescopà Favorites - room to scale',
    layer: 2,
    campaignId: 'camp-6',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    percentComplete: 77,
    suggestedActions: [
      {
        id: 'action-6',
        title: 'Increase Budget by 25%',
        expectedOutcome: '+$12K coffee subscription revenue, maintain 4.2 ROAS',
        confidence: 88,
        type: 'budget_adjust',
        params: { increase: 0.25 }
      }
    ]
  }
];

// Mock campaigns (seed set) - Frescopà Coffee Brand
const baseCampaigns: Array<Omit<Campaign, 'targetLaunchDate' | 'launchDate' | 'createdDate' | 'percentComplete' | 'createdBy' | 'owner' | 'audiences' | 'endDate'>> = [
  {
    id: 'camp-1',
    name: 'Holiday Indulgence - Search Brand',
    channel: 'search',
    budget: 50000,
    spent: 48500,
    roas: 3.2,
    status: 'active', // UPDATED: ROAS 3.2 >= 2.8 threshold - On Track
    alert: false, // Removed alert - campaign is performing well
    alerts: [],
    dailyMetrics: generateDailyMetrics(1620, 3.2, 0.25),
    creatives: [],
    conversions: 1556,
    ctr: 3.5,
    lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'camp-2',
    name: 'Seasonal Sips - Social Prospecting',
    channel: 'social',
    budget: 30000,
    spent: 22100,
    roas: 4.5,
    status: 'active',
    alert: false,
    alerts: [],
    dailyMetrics: generateDailyMetrics(736, 4.5, 0.15),
    creatives: [
      {
        id: 'creative-1',
        name: 'Carousel - Coffee Collection',
        thumbnail: 'https://via.placeholder.com/400x300/8B5CF6/ffffff',
        type: 'carousel',
        spend: 12000,
        roas: 5.2,
        conversions: 1248,
        status: 'active',
        // percentComplete not part of Creative type; omit to satisfy types
      },
      {
        id: 'creative-2',
        name: 'Video - From Farm to Cup',
        thumbnail: 'https://via.placeholder.com/400x300/A855F7/ffffff',
        type: 'video',
        spend: 10100,
        roas: 3.8,
        conversions: 768,
        status: 'active',
        // percentComplete not part of Creative type; omit to satisfy types
      }
    ],
    conversions: 1992,
    ctr: 2.8,
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'camp-3',
    name: 'Your Cup Awaits - Display Retargeting',
    channel: 'display',
    budget: 20000,
    spent: 18900,
    roas: 2.8,
    status: 'active', // UPDATED: ROAS 2.8 >= 2.8 threshold - On Track
    alert: false, // Removed alert - campaign meets threshold
    alerts: [],
    dailyMetrics: generateDailyMetrics(630, 2.8, 0.3),
    creatives: [],
    conversions: 1058,
    ctr: 1.2,
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'camp-4',
    name: 'We Miss Your Mug - Email Win-Back',
    channel: 'email',
    budget: 5000,
    spent: 4200,
    roas: 6.2,
    status: 'active',
    alert: false,
    alerts: [],
    dailyMetrics: generateDailyMetrics(140, 6.2, 0.1),
    creatives: [],
    conversions: 522,
    ctr: 8.5,
    lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 'camp-5',
    name: 'Limited Brew Drop - Instagram Stories',
    channel: 'social',
    budget: 25000,
    spent: 16800,
    roas: 3.1,
    status: 'active', // UPDATED: ROAS 3.1 >= 2.8 threshold - On Track
    alert: false, // Removed alert - campaign is performing well
    alerts: [],
    dailyMetrics: generateDailyMetrics(560, 3.1, 0.35),
    creatives: [],
    conversions: 1042,
    ctr: 1.8,
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'camp-6',
    name: 'Frescopà Favorites - Shopping Ads',
    channel: 'search',
    budget: 40000,
    spent: 26000,
    roas: 4.8,
    status: 'active',
    alert: true,
    alerts: [alerts[3]],
    dailyMetrics: generateDailyMetrics(866, 4.8, 0.12),
    creatives: [],
    conversions: 2496,
    ctr: 4.2,
    lastModified: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: 'camp-7',
    name: 'From Farm to Cup - YouTube Brand',
    channel: 'video',
    budget: 35000,
    spent: 31500,
    roas: 2.2,
    status: 'active',
    alert: false,
    alerts: [],
    dailyMetrics: generateDailyMetrics(1050, 2.2, 0.18),
    creatives: [],
    conversions: 1386,
    ctr: 0.9,
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'camp-8',
    name: 'Corporate Coffee Program - LinkedIn B2B',
    channel: 'social',
    budget: 15000,
    spent: 12600,
    roas: 5.5,
    status: 'active',
    alert: false,
    alerts: [],
    dailyMetrics: generateDailyMetrics(420, 5.5, 0.15),
    creatives: [],
    conversions: 1386,
    ctr: 2.1,
    lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

// Generate additional campaigns to reach a total of 125 - Frescopà Coffee Brand
const additionalCampaigns: Array<Omit<Campaign, 'targetLaunchDate' | 'launchDate' | 'createdDate' | 'percentComplete' | 'createdBy' | 'owner' | 'audiences' | 'endDate'>> = Array.from({ length: 117 }, (_, i) => {
  const idx = i + 9;
  const channelIds = ['search', 'social', 'display', 'email', 'video'] as const;
  
  // Frescopà-themed campaign types by channel
  const campaignThemes: Record<string, string[]> = {
    search: ['Morning Ritual', 'Coffee Subscription', 'Best Beans', 'Café Finder', 'Brew Gear', 'Single Origin', 'Espresso Lovers', 'Cold Brew', 'Coffee Gifts', 'Loyalty Program'],
    social: ['Rise & Grind', 'Coffee Culture', 'Latte Art', 'Barista Life', 'Bean Journey', 'Café Vibes', 'Brew Community', 'Coffee Moments', 'Sustainable Sips', 'Third Place'],
    display: ['Brew Discovery', 'Coffee Lovers', 'Café Experience', 'Morning Person', 'Coffee Break', 'Your Daily Cup', 'Roast Profile', 'Bean Selection', 'Subscription Renewal', 'Loyalty Rewards'],
    email: ['Brew More Earn More', 'Birthday Cup', 'Subscription Renewal', 'Weekly Roast', 'Gold Cup Members', 'First Sip', 'Coffee DNA', 'Taste Remembered', 'Inner Circle', 'Sip Rewards'],
    video: ['Bean Story', 'Barista Craft', 'Sustainable Sourcing', 'Farm Partners', 'Roasting Process', 'Coffee Origins', 'Café Culture', 'Morning Ritual', 'Community Stories', 'Brew Methods']
  };
  
  const channel = channelIds[i % channelIds.length];
  const themes = campaignThemes[channel];
  const type = themes[i % themes.length];

  // Wider distribution across $2K–$500K
  const budget = Math.round(2000 + seededRandom(`camp-${idx}:budget`) * (500000 - 2000));
  // Drive ROAS to produce a more varied (roughly uniform) ring distribution
  const ringIndexUniform = Math.floor(seededRandom(`camp-${idx}:ring`) * 6); // 0..5
  const radiusTarget = 20 + ringIndexUniform * 15 + (seededRandom(`camp-${idx}:radiusJitter`) - 0.5) * 8; // small jitter per ring
  const roas = parseFloat(Math.max(0.8, Math.min(7.0, radiusTarget / 20)).toFixed(1));
  const spent = Math.min(budget, Math.round(budget * (0.3 + seededRandom(`camp-${idx}:spent`) * 0.9)));
  // REDUCED AT_RISK: Threshold adjusted to halve at_risk campaigns
  // Active (GREEN): ROAS >= 2.8 (was 3.5) - more campaigns on track
  // At Risk (RED): ROAS 1.5-2.8 (narrower range) - ~50% fewer at_risk
  // Paused (BLUE): ROAS < 1.5 (was 2.0) - needs attention tier
  const status: Campaign['status'] = roas >= 2.8 ? 'active' : (roas >= 1.5 ? 'at_risk' : 'paused');

  const baseDailySpend = Math.max(80, Math.min(2000, budget / 30));
  const variance = 0.2 + seededRandom(`camp-${idx}:variance`) * 0.25;
  const metrics = generateDailyMetrics(baseDailySpend, roas, variance, `camp-${idx}`);
  const conversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const ctr = parseFloat((0.5 + seededRandom(`camp-${idx}:ctr`) * 5.0).toFixed(1));
  const lastModified = new Date(Date.now() - Math.floor(seededRandom(`camp-${idx}:lastMod`) * 10 * 24 * 60 * 60 * 1000));

  // Generate a few creatives per campaign (0-3)
  const creativeCount = Math.floor(seededRandom(`camp-${idx}:creativeCount`) * 4); // 0..3
  const creativeTypes: Array<'image' | 'video' | 'carousel'> = ['image', 'video', 'carousel'];
  const creatives = Array.from({ length: creativeCount }, (_, cIdx) => {
    const cType = creativeTypes[(i + cIdx) % creativeTypes.length];
    const cSpend = Math.round((spent / Math.max(1, creativeCount || 1)) * (0.6 + seededRandom(`camp-${idx}:creative:${cIdx}:spend`) * 0.8));
    const cRoas = parseFloat(Math.max(0.6, roas * (0.7 + seededRandom(`camp-${idx}:creative:${cIdx}:roas`) * 0.8)).toFixed(1));
    const cConvs = Math.max(0, Math.floor((cSpend * cRoas) / 50));
    const cStatus: Campaign['status'] = roas >= 2.8 ? 'active' : (roas >= 1.5 ? 'at_risk' : 'paused');
    const palette = ['8B5CF6', 'A855F7', '6366F1', '10B981', 'F59E0B', '3B82F6', 'EF4444'];
    const colorHex = palette[(i + cIdx) % palette.length];
    return {
      id: `creative-${idx}-${cIdx + 1}`,
      name: `${cType.toUpperCase()} – Variant ${cIdx + 1}`,
      thumbnail: `https://via.placeholder.com/400x300/${colorHex}/ffffff`,
      type: cType,
      spend: cSpend,
      roas: cRoas,
      conversions: cConvs,
      status: cStatus
    };
  });

  // Generate 0-2 alerts for some campaigns
  const alertsChance = seededRandom(`camp-${idx}:alertsChance`);
  // Reduce percentage of campaigns with alerts by ~2/3 (≈14% have any)
  const alertCount = alertsChance > 0.93 ? 2 : (alertsChance > 0.86 ? 1 : 0);
  const alerts: Alert[] = Array.from({ length: alertCount }, (_, aIdx) => {
    const severity: Alert['severity'] = roas < 2.0 ? (seededRandom(`camp-${idx}:alert:${aIdx}:sev`) > 0.4 ? 'critical' : 'warning') : 'warning';
    const messages = severity === 'critical'
      ? ['Budget overspend on coffee campaign', 'ROAS collapse on seasonal promotion', 'Drastic CTR decline on coffee ads']
      : ['ROAS trending down on subscription campaign', 'CPC rising on brand keywords', 'Audience fatigue detected in loyalty segment'];
    const message = messages[(i + aIdx) % messages.length];
    return {
      id: `gen-alert-${idx}-${aIdx + 1}`,
      severity,
      message,
      layer: severity === 'critical' ? 3 : 2,
      campaignId: `camp-${idx}`,
      timestamp: new Date(Date.now() - Math.floor(seededRandom(`camp-${idx}:alert:${aIdx}:ts`) * 7 * 24 * 60 * 60 * 1000)),
      suggestedActions: severity === 'critical'
        ? [
            {
              id: `gen-act-${idx}-${aIdx + 1}-1`,
              title: 'Pause Campaign',
              expectedOutcome: 'Stop runaway spend on coffee promotion',
              confidence: 90,
              type: 'pause'
            },
            {
              id: `gen-act-${idx}-${aIdx + 1}-2`,
              title: 'Reduce Daily Cap',
              expectedOutcome: 'Contain spend while reviewing coffee audience',
              confidence: 80,
              type: 'budget_adjust',
              params: { newDailyCap: Math.round(baseDailySpend) }
            }
          ]
        : [
            {
              id: `gen-act-${idx}-${aIdx + 1}-1`,
              title: 'Review Targeting',
              expectedOutcome: 'Identify underperforming coffee subscriber segments',
              confidence: 72,
              type: 'custom'
            }
          ]
    } as Alert;
  });

  return {
    id: `camp-${idx}`,
    name: `${type} - ${channel.charAt(0).toUpperCase() + channel.slice(1)} ${idx}`,
    channel,
    budget,
    spent,
    roas,
    status,
    alert: alertCount > 0,
    alerts,
    dailyMetrics: metrics,
    creatives,
    conversions,
    ctr,
    lastModified
  };
});

// Compose campaigns and assign lifecycle fields with deterministic distributions
let eligibleSoFar = 0;
let lateSoFar = 0;
let campaigns: Campaign[] = [...baseCampaigns, ...additionalCampaigns].map((c, idx, all) => {
  const total = all.length;
  const frac = (idx + 0.5) / total;
  const targetMs = TARGET_START.getTime() + Math.floor(frac * (TARGET_END.getTime() - TARGET_START.getTime()));
  const targetLaunchDate = new Date(targetMs);
  let launchDate: Date | null = null;
  if (targetLaunchDate.getTime() <= TODAY_ANCHOR.getTime()) {
    eligibleSoFar++;
    const isLate = (eligibleSoFar % 4) === 0; // ≈25% late, uniformly spaced among eligible
    if (isLate) {
      lateSoFar++;
      const lateOffsetDays = 1 + ((lateSoFar - 1) % 60);
      launchDate = new Date(targetLaunchDate.getTime() + lateOffsetDays * DAY_MS);
    } else {
      launchDate = new Date(targetLaunchDate.getTime());
    }
  }
  const createdOffsetDays = 30 + Math.floor(frac * (108 - 30 + 1)); // 30..108 uniformly
  let createdDate = new Date(targetLaunchDate.getTime() - createdOffsetDays * DAY_MS);
  if (createdDate.getTime() < CREATED_MIN.getTime()) createdDate = new Date(CREATED_MIN.getTime());
  if (createdDate.getTime() > TODAY_ANCHOR.getTime()) createdDate = new Date(TODAY_ANCHOR.getTime());
  const createdBy = CREATED_BY_NAMES[idx % CREATED_BY_NAMES.length];
  let owner = createdBy;
  if ((idx % 5) === 4) { // 20% different owner
    const alt = (idx % 11) + 1;
    owner = CREATED_BY_NAMES[(CREATED_BY_NAMES.indexOf(createdBy) + alt) % CREATED_BY_NAMES.length];
  }
  let percentComplete = 0;
  if (launchDate) {
    percentComplete = 100;
  } else {
    const daysToTarget = Math.max(0, Math.round((targetLaunchDate.getTime() - TODAY_ANCHOR.getTime()) / DAY_MS));
    const base = Math.max(0, Math.min(100, Math.round(100 - (daysToTarget / 180) * 100)));
    // Add modest noise and outliers to meet distribution goals
    const noise = Math.round((seededRandom(c.id + ':pc:noise') - 0.5) * 40); // ±20
    const bias = (seededRandom(c.id + ':pc:hi') > 0.9 ? 20 : 0) + (seededRandom(c.id + ':pc:lo') < 0.1 ? -20 : 0);
    percentComplete = Math.max(0, Math.min(99, base + noise + bias));
  }
  // Uniformly distributed planned end date between 14 and 365 days from launch (or target if not launched)
  const startDate = launchDate || targetLaunchDate;
  const endOffsetDays = 14 + Math.floor(seededRandom(c.id + ':endDays') * (365 - 14 + 1));
  const endDate = new Date(startDate.getTime() + endOffsetDays * DAY_MS);
  // NEW FRAMEWORK: Add funnel stage, lifecycle stage, and readiness percent
  const funnelStage = determineFunnelStage(c.id, c.channel, c.name);
  const lifecycleStage = determineLifecycleStage(c.id);
  // ALIGNED: readinessPercent now matches campaign status for consistent planet colors
  const readinessPercent = calculateReadinessFromStatus(c.status, c.id);
  
  return {
    ...c,
    targetLaunchDate,
    launchDate,
    createdDate,
    percentComplete,
    createdBy,
    owner,
    audiences: [],
    endDate,
    // NEW FRAMEWORK FIELDS
    funnelStage,
    lifecycleStage,
    readinessPercent
  };
});

// Ensure: At least 50% of NOT-YET-LAUNCHED campaigns have target dates within 1..90 days (evenly spread)
(() => {
  const in90 = new Date(TODAY_ANCHOR.getTime() + 90 * DAY_MS);
  const notLaunched = campaigns.filter(c => !c.launchDate);
  const eligible = notLaunched.filter(c => {
    const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
    return tld && !isNaN(tld.getTime()) && tld.getTime() >= TODAY_ANCHOR.getTime() && tld.getTime() <= in90.getTime();
  });
  const desired = Math.ceil(notLaunched.length * 0.5);
  const need = Math.max(0, desired - eligible.length);
  if (need === 0) return;
  // Candidates: not launched whose targets are NOT in the next 90 days (or missing)
  const candidates = notLaunched
    .filter(c => {
      const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
      return !tld || isNaN(tld.getTime()) || tld.getTime() < TODAY_ANCHOR.getTime() || tld.getTime() > in90.getTime();
    })
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const take = candidates.slice(0, need);
  take.forEach((c, i) => {
    // Evenly distribute 1..90 days among the needed set
    const daysOut = Math.floor((i * 89) / Math.max(1, need - 1)) + 1; // 1..90
    const tld = new Date(TODAY_ANCHOR.getTime() + daysOut * DAY_MS);
    const createdOffset = 30 + (i % (108 - 30 + 1));
    const createdDate = new Date(tld.getTime() - createdOffset * DAY_MS);
    const percentComplete = Math.round((i / Math.max(1, need - 1)) * 99);
    const idx = campaigns.findIndex(cc => cc.id === c.id);
    if (idx !== -1) {
      campaigns[idx] = {
        ...campaigns[idx],
        targetLaunchDate: tld,
        createdDate,
        percentComplete
      };
    }
  });
})();

// Ensure: 80% of campaigns WITH alerts are not launched, with even 0..99% readiness distribution
(() => {
  const withAlerts = campaigns
    .filter(c => c.alert || (Array.isArray(c.alerts) && c.alerts.length > 0))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const total = withAlerts.length;
  if (total === 0) return;
  const desiredUnlaunched = Math.round(total * 0.8);
  const now = TODAY_ANCHOR;
  let unlaunchedIdx = 0;
  let launchedIdx = 0;
  withAlerts.forEach((c, idx) => {
    const ci = campaigns.findIndex(cc => cc.id === c.id);
    if (ci === -1) return;
    if (idx < desiredUnlaunched) {
      // Not launched: distribute target dates over next 1..90 days and percentComplete 0..99 evenly
      const daysOut = Math.floor((unlaunchedIdx * 89) / Math.max(1, desiredUnlaunched - 1)) + 1; // 1..90
      const tld = new Date(now.getTime() + daysOut * DAY_MS);
      const createdOffset = 30 + Math.floor(seededRandom(c.id + ':alert:created') * 90);
      const createdDate = new Date(tld.getTime() - createdOffset * DAY_MS);
      const basePct = Math.round((unlaunchedIdx / Math.max(1, desiredUnlaunched - 1)) * 99);
      const jitter = Math.round((seededRandom(c.id + ':alert:pct') - 0.5) * 6); // ±3%
      const percentComplete = Math.max(0, Math.min(99, basePct + jitter));
      campaigns[ci] = {
        ...campaigns[ci],
        launchDate: null,
        targetLaunchDate: tld,
        createdDate,
        percentComplete
      };
      unlaunchedIdx++;
    } else {
      // Launched: ensure a past launch date and set percentComplete to 100
      const baseTld = campaigns[ci].targetLaunchDate as Date | null;
      const fallbackPastDays = 5 + Math.floor(seededRandom(c.id + ':alert:past') * 120); // 5..124 days ago
      const tld = baseTld instanceof Date ? baseTld : new Date(now.getTime() - fallbackPastDays * DAY_MS);
      const launchOffset = Math.floor(seededRandom(c.id + ':alert:launchOff') * 7) - 2; // -2..+4 days
      const launchDate = new Date(tld.getTime() + launchOffset * DAY_MS);
      campaigns[ci] = {
        ...campaigns[ci],
        targetLaunchDate: tld,
        launchDate,
        percentComplete: 100
      };
      launchedIdx++;
    }
  });
})();

// Normalize child object counts per campaign to be between 12 and 40
campaigns = campaigns.map((c, cIdx) => {
  const currentCreatives = Array.isArray(c.creatives) ? c.creatives : [];
  const currentAlerts = Array.isArray(c.alerts) ? c.alerts : [];
  const normalizedAlerts = currentAlerts.map(a => ({ ...a, percentComplete: typeof a.percentComplete === 'number' ? a.percentComplete : ((cIdx * 17 + a.id.length * 7) % 101) } as Alert));
  const currentCount = currentCreatives.length + currentAlerts.length;
  const targetTotal = 12 + Math.floor(seededRandom(`${c.id}:targetTotal`) * 29); // 12..40
  if (currentCount >= 12 && currentCount <= 40) {
    return { ...c, creatives: currentCreatives, alerts: currentAlerts };
  }
  const needed = Math.max(0, targetTotal - currentCount);
  // Add creatives to reach target (prefer not to alter alerts count)
  const addedCreatives = Array.from({ length: needed }, (_, k) => {
    const idx = currentCreatives.length + k + 1;
    const typePool: Array<'image' | 'video' | 'carousel'> = ['image', 'video', 'carousel'];
    const cType = typePool[(cIdx + k) % typePool.length];
    const palette = ['8B5CF6', 'A855F7', '6366F1', '10B981', 'F59E0B', '3B82F6', 'EF4444', '22C55E', '06B6D4'];
    const colorHex = palette[(cIdx + k) % palette.length];
    const estSpend = Math.max(50, Math.round((c.spent / Math.max(1, targetTotal)) * (0.6 + seededRandom(`${c.id}:gen:${k}:spend`) * 0.8)));
    const estRoas = parseFloat(Math.max(0.6, c.roas * (0.7 + seededRandom(`${c.id}:gen:${k}:roas`) * 0.8)).toFixed(1));
    const estConvs = Math.max(0, Math.floor((estSpend * estRoas) / 50));
    const cStatus: CampaignStatus = c.status;
    return {
      id: `${c.id}-gen-creative-${idx}`,
      name: `${cType.toUpperCase()} – Auto ${idx}`,
      thumbnail: `https://via.placeholder.com/400x300/${colorHex}/ffffff`,
      type: cType,
      spend: estSpend,
      roas: estRoas,
      conversions: estConvs,
      status: cStatus,
      percentComplete: ((cIdx * 41 + k * 67 + c.id.length * 13) % 101)
    } as any;
  });
  // If somehow exceeding 40 (e.g., alerts already > 40), trim creatives to fit max 40
  const maxCreativesAllowed = Math.max(0, 40 - currentAlerts.length);
  const mergedCreatives = [...currentCreatives, ...addedCreatives].slice(0, maxCreativesAllowed);
  return { ...c, creatives: mergedCreatives, alerts: normalizedAlerts };
});

// Audiences: 200 items with evenly distributed estimated sizes between 50,000 and 1,000,000
// Names and descriptions are generated deterministically to avoid duplicates.
// Frescopà Coffee Brand - Lifestyle & Coffee-focused audiences
const audienceInterests = [
  'Single Origin Enthusiasts', 'Espresso Lovers', 'Cold Brew Fans', 'Café Culture', 'Morning Routines', 
  'Sustainability Seekers', 'Premium Coffee Buyers', 'Coffee Subscription', 'Home Baristas', 'Coffee Gifts',
  'Productivity Seekers', 'Third Place Visitors', 'Wellness Coffee', 'Work From Café', 'Coffee Collectors',
  'Ethical Consumers', 'Local Café Lovers', 'Coffee & Food Pairing', 'Specialty Roasts', 'Coffee Tech',
  'Plant-Based Coffee', 'Decaf Enthusiasts', 'Coffee Rewards Members', 'Weekend Brunch', 'Coffee Commuters',
  'Artisan Coffee', 'Coffee Merchandise', 'Seasonal Drinks', 'Coffee Events', 'Coffee Community'
];
const audienceRegions = [
  'North America', 'Europe', 'LATAM', 'APAC', 'Middle East', 'Africa', 'Oceania', 'Southeast Asia', 'Nordics', 'Central Europe'
];
const audienceAgeRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const audienceIntents = ['Exploring Blends', 'Subscription Ready', 'Ready to Order', 'Gold Cup Members', 'Lapsed Subscribers', 'First Cup Seekers'];

const AUDIENCE_COUNT = 200;
const MIN_SIZE = 50000;
const MAX_SIZE = 1000000;
const SIZE_STEP = (MAX_SIZE - MIN_SIZE) / (AUDIENCE_COUNT - 1); // spread evenly across range

export const mockAudiences: Audience[] = Array.from({ length: AUDIENCE_COUNT }, (_, i) => {
  const id = i + 1; // sequential numeric id
  const interest = audienceInterests[i % audienceInterests.length];
  const region = audienceRegions[i % audienceRegions.length];
  const age = audienceAgeRanges[i % audienceAgeRanges.length];
  const intent = audienceIntents[i % audienceIntents.length];
  const estimatedSize = Math.round(MIN_SIZE + i * SIZE_STEP);
  const name = `${interest} – ${region}`;
  const description =
    `Coffee enthusiasts in ${region} aged ${age}, ${intent.toLowerCase()}, ` +
    `with strong affinity for ${interest.toLowerCase()}.`;
  return {
    id,
    name,
    description,
    estimatedSize
  };
});

// Assign 1–5 audiences deterministically to every campaign
campaigns = campaigns.map((c) => {
  const count = 1 + Math.floor(seededRandom(c.id + ':audCount') * 5); // 1..5
  // Pick distinct indices across the full audience pool so IDs are varied (not sequential)
  const chosen = new Set<number>();
  let salt = 0;
  while (chosen.size < count) {
    const r = seededRandom(`${c.id}:audIdx:${salt}`);
    const idx = Math.floor(r * mockAudiences.length);
    chosen.add(idx);
    salt++;
  }
  const audiences = Array.from(chosen).map(i => mockAudiences[i]);
  return { ...c, audiences };
});

// Channels summary (computed from campaigns, preserving names/icons/colors/trends)
const baseChannelsMeta = [
  { id: 'search', name: 'Paid Search', icon: 'Search', trend: [3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 4.0], color: '#3B82F6' },
  { id: 'social', name: 'Social Media', icon: 'Share2', trend: [3.8, 4.0, 4.2, 4.1, 4.0, 4.1, 4.1], color: '#A855F7' },
  { id: 'display', name: 'Display Ads', icon: 'Monitor', trend: [3.5, 3.3, 3.1, 2.9, 2.8, 2.8, 2.8], color: '#F97316' },
  { id: 'email', name: 'Email Marketing', icon: 'Mail', trend: [6.0, 6.1, 6.2, 6.3, 6.2, 6.2, 6.2], color: '#10B981' },
  { id: 'video', name: 'Video Ads', icon: 'Video', trend: [2.0, 2.1, 2.2, 2.3, 2.2, 2.2, 2.2], color: '#EC4899' }
];

const channels: Channel[] = baseChannelsMeta.map(meta => {
  const belonging = campaigns.filter(c => c.channel === meta.id);
  const totalSpend = belonging.reduce((s, c) => s + c.spent, 0);
  const campaignCount = belonging.length;
  const avgRoas = campaignCount ? parseFloat((belonging.reduce((s, c) => s + c.roas, 0) / campaignCount).toFixed(1)) : 0;
  return { ...meta, totalSpend, totalRoas: avgRoas, campaignCount } as Channel;
});

// Portfolio summary (computed)
const totalSpendAll = campaigns.reduce((s, c) => s + c.spent, 0);
const totalRevenueAll = campaigns.reduce((s, c) => s + c.spent * c.roas, 0);
const totalBudgetAll = campaigns.reduce((s, c) => s + c.budget, 0);
const activeCampaignCount = campaigns.filter(c => c.status === 'active').length;

// ============================================================================
// PORTFOLIO HEALTH METRICS (used by both Cosmos sun and Dashboard widget)
// These are computed from actual campaign data for consistency
// ============================================================================

// 1. Lifecycle Velocity: % of campaigns "on track" (readiness >= 70%)
// This measures how many campaigns are progressing well through their lifecycle
const campaignsOnTrack = campaigns.filter(c => c.readinessPercent >= 70);
const lifecycleVelocity = Math.round((campaignsOnTrack.length / campaigns.length) * 100);

// 2. Alert Coverage Ratio: proportion of campaigns with active alerts (0-1 scale)
const campaignsWithAlerts = campaigns.filter(c => c.alert || (c.alerts && c.alerts.length > 0));
const alertCoverageRatio = activeCampaignCount > 0 
  ? Math.round((campaignsWithAlerts.length / activeCampaignCount) * 100) / 100
  : 0;

// 3. Funnel Coverage Balance: evenness of campaigns across 4 funnel stages (lower = more balanced)
const funnelDistribution: Record<FunnelStage, number> = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
campaigns.forEach(c => { if (c.funnelStage) funnelDistribution[c.funnelStage]++; });
const funnelValues = Object.values(funnelDistribution);
const funnelMean = funnelValues.reduce((a, b) => a + b, 0) / 4;
const funnelVariance = funnelValues.reduce((sum, v) => sum + Math.pow((v - funnelMean) / campaigns.length, 2), 0) / 4;
const funnelCoverageBalance = Math.round(funnelVariance * 1000) / 1000;

const portfolio = {
  totalROAS: totalSpendAll > 0 ? parseFloat((totalRevenueAll / totalSpendAll).toFixed(1)) : 0,
  budgetHealth: Math.round((totalSpendAll / totalBudgetAll) * 100),
  activeCampaigns: activeCampaignCount,
  alerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'warning'),
  totalSpend: totalSpendAll,
  totalRevenue: Math.round(totalRevenueAll * 100) / 100,
  totalBudget: totalBudgetAll,
  roasTrend: 5.2,
  // NEW FRAMEWORK HEALTH METRICS - same values used by Cosmos and Dashboard
  lifecycleVelocity,
  alertCoverageRatio,
  funnelCoverageBalance
};

// ============================================================================
// VERIFICATION LOGGING: New Framework Distribution
// ============================================================================
const funnelCounts: Record<FunnelStage, number> = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
const lifecycleCounts: Record<LifecycleStage, number> = { ideation: 0, planning: 0, development: 0, qa_ready: 0, launching: 0, active: 0, closing: 0 };
let redCount = 0, yellowCount = 0, greenCount = 0;

campaigns.forEach(c => {
  if (c.funnelStage) funnelCounts[c.funnelStage]++;
  if (c.lifecycleStage) lifecycleCounts[c.lifecycleStage]++;
  if (c.readinessPercent !== undefined) {
    if (c.readinessPercent < 50) redCount++;
    else if (c.readinessPercent < 80) yellowCount++;
    else greenCount++;
  }
});

console.log('=== NEW FRAMEWORK DATA DISTRIBUTION ===');
console.log(`Total campaigns: ${campaigns.length}`);
console.log('');
console.log('=== PORTFOLIO HEALTH METRICS (used by Cosmos & Dashboard) ===');
console.log(`  Total ROAS: ${portfolio.totalROAS}`);
console.log(`  Lifecycle Velocity: ${lifecycleVelocity}%`);
console.log(`  Alert Coverage Ratio: ${alertCoverageRatio}`);
console.log(`  Funnel Coverage Balance: ${funnelCoverageBalance}`);
// Calculate and log the composite score for verification
const debugRoasScore = Math.min(100, (portfolio.totalROAS / 4.0) * 100);
const debugAlertScore = Math.max(0, 100 - (alertCoverageRatio * 333));
const debugBalanceScore = Math.max(0, 100 - (funnelCoverageBalance * 500));
const debugComposite = Math.round(debugRoasScore * 0.35 + lifecycleVelocity * 0.25 + debugAlertScore * 0.25 + debugBalanceScore * 0.15);
console.log(`  COMPOSITE HEALTH SCORE: ${debugComposite}/100`);
console.log(`    - ROAS Score: ${Math.round(debugRoasScore)}`);
console.log(`    - Velocity Score: ${lifecycleVelocity}`);
console.log(`    - Alert Score: ${Math.round(debugAlertScore)}`);
console.log(`    - Balance Score: ${Math.round(debugBalanceScore)}`);
console.log('');
console.log('SAMPLE CAMPAIGNS (first 5):');
campaigns.slice(0, 5).forEach(c => {
  const color = c.readinessPercent < 50 ? 'RED' : (c.readinessPercent < 80 ? 'YELLOW' : 'GREEN');
  console.log(`  ${c.id}: funnel=${c.funnelStage}, lifecycle=${c.lifecycleStage}, readiness=${c.readinessPercent}% (${color})`);
});
console.log('');
console.log('FUNNEL STAGES (orbital plane angles):');
console.log(`  🔵 Awareness (90°): ${funnelCounts.awareness}`);
console.log(`  🟣 Consideration (60°): ${funnelCounts.consideration}`);
console.log(`  🟠 Conversion (30°): ${funnelCounts.conversion}`);
console.log(`  🟢 Retention (0°): ${funnelCounts.retention}`);
console.log('');
console.log('LIFECYCLE STAGES (ring positions):');
console.log(`  Ring 7 - Ideation: ${lifecycleCounts.ideation}`);
console.log(`  Ring 6 - Planning: ${lifecycleCounts.planning}`);
console.log(`  Ring 5 - Development: ${lifecycleCounts.development}`);
console.log(`  Ring 4 - QA Ready: ${lifecycleCounts.qa_ready}`);
console.log(`  Ring 3 - Launching: ${lifecycleCounts.launching}`);
console.log(`  Ring 2 - Active: ${lifecycleCounts.active}`);
console.log(`  Ring 1 - Closing: ${lifecycleCounts.closing}`);
console.log('');
console.log('READINESS COLORS:');
console.log(`  🔴 RED (At Risk <50%): ${redCount}`);
console.log(`  🟡 YELLOW (Needs Attention 50-79%): ${yellowCount}`);
console.log(`  🟢 GREEN (On Track >=80%): ${greenCount}`);
console.log('');

// ---------------------------------------------------------------------------
// ADDITIONAL NOT-LAUNCHED CAMPAIGNS (40) - Frescopà Coffee Brand
// Goal: Increase the number of non-launched campaigns with varied properties to
// create a rich distribution in the 3D view. Target dates are spread across the
// next 90 days from TODAY_ANCHOR to support "Upcoming launches".
// ---------------------------------------------------------------------------
(() => {
  const ADD_COUNT = 40;
  const channelPool: Array<Campaign['channel']> = ['search', 'social', 'display', 'email', 'video'];
  
  // Frescopà-themed future campaign names
  const futureThemes: Record<string, string[]> = {
    search: ['Spring Blends Launch', 'New Roast Collection', 'Subscription Promo', 'Coffee Finder', 'Gift Season', 'Café Locator', 'Bean Guide', 'Brewing Essentials'],
    social: ['Creator Collab', 'Coffee Challenge', 'Barista Spotlight', 'Community Stories', 'Sustainable Journey', 'Third Place Stories', 'Morning Moments', 'Brew Together'],
    display: ['New Store Opening', 'Loyalty Launch', 'App Download', 'Subscription Trial', 'Seasonal Menu', 'Rewards Promo', 'Café Discovery', 'Member Benefits'],
    email: ['Welcome Series', 'Reactivation Flow', 'Birthday Rewards', 'Tier Upgrade', 'New Blend Alert', 'Subscription Save', 'Referral Program', 'VIP Preview'],
    video: ['Origin Story', 'Roaster Profile', 'Sustainability Doc', 'Café Tour', 'Brewing Tutorial', 'Farmer Stories', 'Behind the Beans', 'Community Impact']
  };
  
  // UPDATED: Pattern adjusted to reduce at_risk to ~50% of previous
  // Old: ['active', 'at_risk', 'paused'] = 33% at_risk
  // New: ['active', 'active', 'at_risk', 'paused', 'paused', 'active'] = 17% at_risk
  const statuses: Array<Campaign['status']> = ['active', 'active', 'at_risk', 'paused', 'paused', 'active'];
  const startIdx = campaigns.length + 1;
  const extras: Campaign[] = Array.from({ length: ADD_COUNT }, (_, i) => {
    const id = `camp-future-${startIdx + i}`;
    const channel = channelPool[i % channelPool.length];
    const themes = futureThemes[channel];
    const themeName = themes[i % themes.length];
    const name = `${themeName} - ${channel.charAt(0).toUpperCase() + channel.slice(1)} ${startIdx + i}`;
    // Budgets across a broad range to vary node sizes
    const budget = Math.round(3000 + seededRandom(id + ':budget') * (250000 - 3000));
    // Spend between 10% and 70% of budget pre-launch
    const spent = Math.round(budget * (0.1 + seededRandom(id + ':spent') * 0.6));
    const roas = parseFloat((0.8 + seededRandom(id + ':roas') * 5.8).toFixed(1));
    const status = statuses[i % statuses.length];
    const baseDailySpend = Math.max(60, Math.min(1500, budget / 35));
    const metrics = generateDailyMetrics(baseDailySpend, roas, 0.2 + seededRandom(id + ':var') * 0.2);
    const conversions = metrics.reduce((s, m) => s + m.conversions, 0);
    const ctr = parseFloat((0.5 + seededRandom(id + ':ctr') * 5.0).toFixed(1));
    // Even distribution 1..90 days
    const daysOut = Math.floor((i * 89) / Math.max(1, ADD_COUNT - 1)) + 1; // 1..90 inclusive
    const targetLaunchDate = new Date(TODAY_ANCHOR.getTime() + daysOut * DAY_MS);
    const createdOffset = 30 + Math.floor(seededRandom(id + ':created') * 90);
    const createdDate = new Date(targetLaunchDate.getTime() - createdOffset * DAY_MS);
    const createdBy = CREATED_BY_NAMES[i % CREATED_BY_NAMES.length];
    const owner = CREATED_BY_NAMES[(i * 3) % CREATED_BY_NAMES.length];
    const percentComplete = Math.round(seededRandom(id + ':pc') * 95); // 0..95 pre-launch
    // Placement attributes for 3D: funnel/lifecycle/readiness
    const funnelStage = determineFunnelStage(id, channel, name);
    const lifecycleStage = determineLifecycleStage(id);
    // ALIGNED: readinessPercent now matches campaign status for consistent planet colors
    const readinessPercent = calculateReadinessFromStatus(status, id);
    return {
      id,
      name,
      channel,
      budget,
      spent,
      roas,
      status,
      alert: false,
      alerts: [],
      dailyMetrics: metrics,
      creatives: [],
      conversions,
      ctr,
      lastModified: new Date(Date.now() - Math.floor(seededRandom(id + ':mod') * 5 * DAY_MS)),
      targetLaunchDate,
      launchDate: null,
      createdDate,
      percentComplete,
      createdBy,
      owner,
      audiences: [],
      endDate: new Date(targetLaunchDate.getTime() + (14 + Math.floor(seededRandom(id + ':end') * 351)) * DAY_MS),
      funnelStage,
      lifecycleStage,
      readinessPercent
    } as Campaign;
  });
  campaigns = campaigns.concat(extras);
})();

// ---------------------------------------------------------------------------
// ALERT-SPECIFIC CAMPAIGNS (15)
// These campaigns are designed to cluster into specific, granular alerts
// Each alert should affect 2-4 campaigns for realistic marketer UX
// ---------------------------------------------------------------------------
(() => {
  const now = TODAY_ANCHOR;
  
  // Helper to create alert with specific message and severity
  const createAlert = (
    id: string, 
    message: string, 
    severity: 'critical' | 'warning' | 'info',
    campaignId: string
  ): Alert => ({
    id,
    severity,
    message,
    layer: severity === 'critical' ? 3 : 2,
    campaignId,
    timestamp: new Date(now.getTime() - Math.floor(Math.random() * 3 * DAY_MS)),
    suggestedActions: severity === 'critical' 
      ? [{ id: `${id}-act1`, title: 'Pause Campaign', expectedOutcome: 'Stop spend immediately', confidence: 92, type: 'pause' }]
      : [{ id: `${id}-act1`, title: 'Review Settings', expectedOutcome: 'Optimize performance', confidence: 78, type: 'custom' }]
  });

  const alertCampaigns: Campaign[] = [
    // ===== AUDIENCE FATIGUE CLUSTER 1: Retargeting Overlap (3 campaigns) - CRITICAL, daysToLaunch: 5 =====
    // This is the FIRST/TOP alert - retargeting campaigns competing for same audience
    {
      id: 'alert-audience-retarget-1',
      name: 'Rise & Grind Club - Social Retarget',
      channel: 'social',
      budget: 45000,
      spent: 321000,
      roas: 2.1,
      status: 'at_risk',
      alert: true,
      alerts: [createAlert('af-retarget-1', 'Retargeting audience overlap: 67% of coffee subscribers targeted by multiple campaigns', 'critical', 'alert-audience-retarget-1')],
      dailyMetrics: generateDailyMetrics(1200, 2.1, 0.25, 'af-retarget-1'),
      creatives: [],
      conversions: 1596,
      ctr: 1.8,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 5 * DAY_MS), // Launches in 5 days
      launchDate: null,
      createdDate: new Date(now.getTime() - 60 * DAY_MS),
      percentComplete: 85,
      createdBy: 'Sophia Chen',
      owner: 'Sophia Chen',
      audiences: [],
      endDate: new Date(now.getTime() + 75 * DAY_MS),
      funnelStage: 'consideration',
      lifecycleStage: 'launching',
      readinessPercent: 38 // ALIGNED: at_risk status = RED (< 50%)
    },
    {
      id: 'alert-audience-retarget-2',
      name: 'Holiday Indulgence - Social Lookalike',
      channel: 'social',
      budget: 35000,
      spent: 258000,
      roas: 1.9,
      status: 'at_risk',
      alert: true,
      alerts: [createAlert('af-retarget-2', 'Retargeting audience overlap: 67% of coffee subscribers targeted by multiple campaigns', 'critical', 'alert-audience-retarget-2')],
      dailyMetrics: generateDailyMetrics(1000, 1.9, 0.3, 'af-retarget-2'),
      creatives: [],
      conversions: 1178,
      ctr: 1.5,
      lastModified: new Date(now.getTime() - 2 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 5 * DAY_MS), // Same launch window
      launchDate: null,
      createdDate: new Date(now.getTime() - 55 * DAY_MS),
      percentComplete: 35,
      createdBy: 'Ethan Kim',
      owner: 'Sophia Chen',
      audiences: [],
      endDate: new Date(now.getTime() + 70 * DAY_MS),
      funnelStage: 'consideration',
      lifecycleStage: 'launching',
      readinessPercent: 35 // ALIGNED: at_risk status = RED (< 50%)
    },
    {
      id: 'alert-audience-retarget-3',
      name: 'Loyalty Rewards - Social Nurture',
      channel: 'social',
      budget: 28000,
      spent: 22000,
      roas: 2.3,
      status: 'at_risk',
      alert: true,
      alerts: [createAlert('af-retarget-3', 'Retargeting audience overlap: 67% of coffee subscribers targeted by multiple campaigns', 'critical', 'alert-audience-retarget-3')],
      dailyMetrics: generateDailyMetrics(900, 2.3, 0.22, 'af-retarget-3'),
      creatives: [],
      conversions: 1012,
      ctr: 2.0,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 6 * DAY_MS), // 1 day after others
      launchDate: null,
      createdDate: new Date(now.getTime() - 50 * DAY_MS),
      percentComplete: 32,
      createdBy: 'Emma Brown',
      owner: 'Sophia Chen',
      audiences: [],
      endDate: new Date(now.getTime() + 80 * DAY_MS),
      funnelStage: 'consideration',
      lifecycleStage: 'launching',
      readinessPercent: 32 // ALIGNED: at_risk status = RED (< 50%)
    },
    
    // ===== AUDIENCE FATIGUE CLUSTER 2: Cross-channel Collision (2 campaigns) - CRITICAL, daysToLaunch: 8 =====
    // This will be the THIRD alert - email + display targeting same segment
    {
      id: 'alert-audience-collision-1',
      name: 'Your Cup Awaits - Email Cart Recovery',
      channel: 'email',
      budget: 15000,
      spent: 8500,
      roas: 4.2,
      status: 'active', // UPDATED: ROAS 4.2 >= 2.8 - On Track
      alert: false, // Removed alert - campaign performing well
      alerts: [],
      dailyMetrics: generateDailyMetrics(400, 4.2, 0.15, 'af-collision-1'),
      creatives: [],
      conversions: 714,
      ctr: 12.5,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 8 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 35 * DAY_MS),
      percentComplete: 72,
      createdBy: 'Chloe Garcia',
      owner: 'Chloe Garcia',
      audiences: [],
      endDate: new Date(now.getTime() + 90 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'launching',
      readinessPercent: 88 // ALIGNED: active status = GREEN (>= 80%)
    },
    {
      id: 'alert-audience-collision-2',
      name: 'Finish Your Order - Display Retarget',
      channel: 'display',
      budget: 22000,
      spent: 14500,
      roas: 2.8,
      status: 'active', // UPDATED: ROAS 2.8 >= 2.8 - On Track
      alert: false, // Removed alert - campaign meeting threshold
      alerts: [],
      dailyMetrics: generateDailyMetrics(650, 2.8, 0.22, 'af-collision-2'),
      creatives: [],
      conversions: 812,
      ctr: 0.8,
      lastModified: new Date(now.getTime() - 2 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 8 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 40 * DAY_MS),
      percentComplete: 38,
      createdBy: 'David Miller',
      owner: 'Chloe Garcia',
      audiences: [],
      endDate: new Date(now.getTime() + 85 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'launching',
      readinessPercent: 82 // ALIGNED: active status = GREEN (>= 80%)
    },

    // ===== BUDGET PACING CLUSTER: Overspending Campaigns (3 campaigns) =====
    {
      id: 'alert-budget-overspend-1',
      name: 'Holiday Indulgence - YouTube Awareness',
      channel: 'video',
      budget: 60000,
      spent: 58500,
      roas: 1.4,
      status: 'paused', // UPDATED: ROAS 1.4 < 1.5 - Needs Attention (paused for review)
      alert: true,
      alerts: [createAlert('bp-over-1', 'Budget 97% spent with 3 weeks remaining on holiday coffee campaign', 'warning', 'alert-budget-overspend-1')],
      dailyMetrics: generateDailyMetrics(2800, 1.4, 0.35, 'bp-over-1'),
      creatives: [],
      conversions: 1638,
      ctr: 0.8,
      lastModified: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      targetLaunchDate: new Date(now.getTime() - 14 * DAY_MS),
      launchDate: new Date(now.getTime() - 12 * DAY_MS),
      createdDate: new Date(now.getTime() - 45 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Noah Williams',
      owner: 'Noah Williams',
      audiences: [],
      endDate: new Date(now.getTime() + 21 * DAY_MS),
      funnelStage: 'awareness',
      lifecycleStage: 'active',
      readinessPercent: 58 // ALIGNED: paused status = BLUE (50-78%)
    },
    {
      id: 'alert-budget-overspend-2',
      name: 'Flash Brew Sale - Social Push',
      channel: 'social',
      budget: 25000,
      spent: 24200,
      roas: 2.8,
      status: 'active', // UPDATED: ROAS 2.8 >= 2.8 - On Track
      alert: false, // Removed alert - campaign meeting threshold
      alerts: [],
      dailyMetrics: generateDailyMetrics(1800, 2.8, 0.4, 'bp-over-2'),
      creatives: [],
      conversions: 1356,
      ctr: 3.2,
      lastModified: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      targetLaunchDate: new Date(now.getTime() - 7 * DAY_MS),
      launchDate: new Date(now.getTime() - 5 * DAY_MS),
      createdDate: new Date(now.getTime() - 30 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Chloe Garcia',
      owner: 'Chloe Garcia',
      audiences: [],
      endDate: new Date(now.getTime() + 14 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'launching',
      readinessPercent: 85 // ALIGNED: active status = GREEN (>= 80%)
    },
    {
      id: 'alert-budget-overspend-3',
      name: 'Coffee Lovers Search - Competitor Conquest',
      channel: 'search',
      budget: 40000,
      spent: 37800,
      roas: 1.8,
      status: 'at_risk',
      alert: true,
      alerts: [createAlert('bp-over-3', 'CPC spike: 180% of baseline on coffee competitor keywords, burning budget', 'critical', 'alert-budget-overspend-3')],
      dailyMetrics: generateDailyMetrics(2200, 1.8, 0.45, 'bp-over-3'),
      creatives: [],
      conversions: 1361,
      ctr: 2.4,
      lastModified: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      targetLaunchDate: new Date(now.getTime() - 10 * DAY_MS),
      launchDate: new Date(now.getTime() - 8 * DAY_MS),
      createdDate: new Date(now.getTime() - 35 * DAY_MS),
      percentComplete: 100,
      createdBy: 'David Miller',
      owner: 'David Miller',
      audiences: [],
      endDate: new Date(now.getTime() + 28 * DAY_MS),
      funnelStage: 'consideration',
      lifecycleStage: 'active',
      readinessPercent: 22
    },

    // ===== ROAS MISALIGNMENT: Awareness Underperforming (2 campaigns) =====
    {
      id: 'alert-roas-awareness-1',
      name: 'Discover Frescopà - Display Awareness',
      channel: 'display',
      budget: 30000,
      spent: 26000,
      roas: 0.4,
      status: 'paused', // UPDATED: ROAS 0.4 < 1.5 - Needs Attention
      alert: true,
      alerts: [createAlert('roas-aw-1', 'ROAS 0.4x vs 0.5x minimum for brand awareness campaigns', 'warning', 'alert-roas-awareness-1')],
      dailyMetrics: generateDailyMetrics(900, 0.4, 0.2, 'roas-aw-1'),
      creatives: [],
      conversions: 208,
      ctr: 0.3,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() - 21 * DAY_MS),
      launchDate: new Date(now.getTime() - 19 * DAY_MS),
      createdDate: new Date(now.getTime() - 50 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Lena Davies',
      owner: 'Lena Davies',
      audiences: [],
      endDate: new Date(now.getTime() + 35 * DAY_MS),
      funnelStage: 'awareness',
      lifecycleStage: 'active',
      readinessPercent: 65 // ALIGNED: paused status = BLUE (50-78%)
    },
    {
      id: 'alert-roas-awareness-2',
      name: 'From Farm to Cup - Video Reach',
      channel: 'video',
      budget: 35000,
      spent: 28000,
      roas: 0.3,
      status: 'paused', // UPDATED: ROAS 0.3 < 1.5 - Needs Attention
      alert: true,
      alerts: [createAlert('roas-aw-2', 'ROAS 0.3x significantly below 0.5x floor for coffee origin story campaign', 'warning', 'alert-roas-awareness-2')],
      dailyMetrics: generateDailyMetrics(950, 0.3, 0.25, 'roas-aw-2'),
      creatives: [],
      conversions: 168,
      ctr: 0.2,
      lastModified: new Date(now.getTime() - 2 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() - 18 * DAY_MS),
      launchDate: new Date(now.getTime() - 16 * DAY_MS),
      createdDate: new Date(now.getTime() - 48 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Omar Hassan',
      owner: 'Omar Hassan',
      audiences: [],
      endDate: new Date(now.getTime() + 40 * DAY_MS),
      funnelStage: 'awareness',
      lifecycleStage: 'active',
      readinessPercent: 62 // ALIGNED: paused status = BLUE (50-78%)
    },

    // ===== LIFECYCLE STALL: Planning Stage Stuck (2 campaigns) =====
    {
      id: 'alert-stall-planning-1',
      name: 'Let\'s Rebrew - Email Win-Back Series',
      channel: 'email',
      budget: 15000,
      spent: 0,
      roas: 0,
      status: 'paused',
      alert: true,
      alerts: [createAlert('stall-plan-1', 'Stuck in planning for 38 days (expected: 21) for lapsed subscriber reactivation', 'warning', 'alert-stall-planning-1')],
      dailyMetrics: [],
      creatives: [],
      conversions: 0,
      ctr: 0,
      lastModified: new Date(now.getTime() - 5 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 8 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 38 * DAY_MS),
      percentComplete: 35,
      createdBy: 'Priya Johnson',
      owner: 'Priya Johnson',
      audiences: [],
      endDate: new Date(now.getTime() + 60 * DAY_MS),
      funnelStage: 'retention',
      lifecycleStage: 'planning',
      readinessPercent: 58 // ALIGNED: paused status = BLUE (50-78%)
    },
    {
      id: 'alert-stall-planning-2',
      name: 'Creator Collaboration - Social Partnership',
      channel: 'social',
      budget: 50000,
      spent: 0,
      roas: 0,
      status: 'paused',
      alert: true,
      alerts: [createAlert('stall-plan-2', 'Stuck in planning for 42 days, coffee influencer campaign launch in 5 days', 'critical', 'alert-stall-planning-2')],
      dailyMetrics: [],
      creatives: [],
      conversions: 0,
      ctr: 0,
      lastModified: new Date(now.getTime() - 3 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 5 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 42 * DAY_MS),
      percentComplete: 28,
      createdBy: 'Samuel Lee',
      owner: 'Samuel Lee',
      audiences: [],
      endDate: new Date(now.getTime() + 75 * DAY_MS),
      funnelStage: 'awareness',
      lifecycleStage: 'planning',
      readinessPercent: 55 // ALIGNED: paused status = BLUE (50-78%)
    },

    // ===== SEARCH BRAND CANNIBALIZATION (2 campaigns) =====
    {
      id: 'alert-search-brand-1',
      name: 'Frescopà Brand - Search Exact Match',
      channel: 'search',
      budget: 20000,
      spent: 18500,
      roas: 5.2,
      status: 'active',
      alert: true,
      alerts: [createAlert('brand-cann-1', 'Bidding against Frescopà Broad Match campaign - CPC +45%', 'warning', 'alert-search-brand-1')],
      dailyMetrics: generateDailyMetrics(620, 5.2, 0.15, 'brand-cann-1'),
      creatives: [],
      conversions: 1924,
      ctr: 8.5,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() - 45 * DAY_MS),
      launchDate: new Date(now.getTime() - 43 * DAY_MS),
      createdDate: new Date(now.getTime() - 75 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Kai Adams',
      owner: 'Kai Adams',
      audiences: [],
      endDate: new Date(now.getTime() + 30 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'active',
      readinessPercent: 88 // ALIGNED: active status = GREEN (>= 80%)
    },
    {
      id: 'alert-search-brand-2',
      name: 'Frescopà Coffee - Search Broad Match',
      channel: 'search',
      budget: 25000,
      spent: 21000,
      roas: 4.8,
      status: 'active',
      alert: true,
      alerts: [createAlert('brand-cann-2', 'Bidding against Frescopà Exact Match campaign - wasteful keyword overlap', 'warning', 'alert-search-brand-2')],
      dailyMetrics: generateDailyMetrics(700, 4.8, 0.18, 'brand-cann-2'),
      creatives: [],
      conversions: 2016,
      ctr: 6.2,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() - 40 * DAY_MS),
      launchDate: new Date(now.getTime() - 38 * DAY_MS),
      createdDate: new Date(now.getTime() - 70 * DAY_MS),
      percentComplete: 100,
      createdBy: 'Olivia Smith',
      owner: 'Kai Adams',
      audiences: [],
      endDate: new Date(now.getTime() + 35 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'active',
      readinessPercent: 85 // ALIGNED: active status = GREEN (>= 80%)
    },

    // ===== QA STAGE INCOMPLETE (2 campaigns) =====
    {
      id: 'alert-qa-stall-1',
      name: 'Coffee Discovery - Programmatic Display',
      channel: 'display',
      budget: 40000,
      spent: 0,
      roas: 0,
      status: 'paused',
      alert: true,
      alerts: [createAlert('qa-stall-1', 'QA incomplete: café location tracking pixel failing, launch in 3 days', 'critical', 'alert-qa-stall-1')],
      dailyMetrics: [],
      creatives: [],
      conversions: 0,
      ctr: 0,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 3 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 28 * DAY_MS),
      percentComplete: 72,
      createdBy: 'Emma Brown',
      owner: 'Emma Brown',
      audiences: [],
      endDate: new Date(now.getTime() + 65 * DAY_MS),
      funnelStage: 'consideration',
      lifecycleStage: 'qa_ready',
      readinessPercent: 72
    },
    {
      id: 'alert-qa-stall-2',
      name: 'Your Cart Awaits - Email Flow',
      channel: 'email',
      budget: 8000,
      spent: 0,
      roas: 0,
      status: 'paused',
      alert: true,
      alerts: [createAlert('qa-stall-2', 'QA blocked: coffee product email template rendering issues', 'warning', 'alert-qa-stall-2')],
      dailyMetrics: [],
      creatives: [],
      conversions: 0,
      ctr: 0,
      lastModified: new Date(now.getTime() - 2 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() + 7 * DAY_MS),
      launchDate: null,
      createdDate: new Date(now.getTime() - 21 * DAY_MS),
      percentComplete: 65,
      createdBy: 'Chloe Garcia',
      owner: 'Chloe Garcia',
      audiences: [],
      endDate: new Date(now.getTime() + 90 * DAY_MS),
      funnelStage: 'conversion',
      lifecycleStage: 'qa_ready',
      readinessPercent: 65
    },

    // ===== ATTRIBUTION CONCERNS (1 campaign) =====
    {
      id: 'alert-attribution-1',
      name: 'Coffee Journey - Cross-Channel Display',
      channel: 'display',
      budget: 55000,
      spent: 48000,
      roas: 0.9,
      status: 'at_risk',
      alert: true,
      alerts: [createAlert('attr-1', 'Low last-click ROAS but high assist rate for subscription conversions - review attribution model', 'info', 'alert-attribution-1')],
      dailyMetrics: generateDailyMetrics(1600, 0.9, 0.2, 'attr-1'),
      creatives: [],
      conversions: 864,
      ctr: 0.5,
      lastModified: new Date(now.getTime() - 1 * DAY_MS),
      targetLaunchDate: new Date(now.getTime() - 35 * DAY_MS),
      launchDate: new Date(now.getTime() - 33 * DAY_MS),
      createdDate: new Date(now.getTime() - 65 * DAY_MS),
      percentComplete: 100,
      createdBy: 'David Miller',
      owner: 'Lena Davies',
      audiences: [],
      endDate: new Date(now.getTime() + 25 * DAY_MS),
      funnelStage: 'awareness',
      lifecycleStage: 'active',
      readinessPercent: 48
    }
  ];

  campaigns = campaigns.concat(alertCampaigns);
})();

// Normalize statuses for alerted campaigns: ensure ~90% are NOT 'at_risk'
(() => {
  const alerted = campaigns.filter(c => c.alert);
  const totalAlerted = alerted.length;
  if (totalAlerted > 0) {
    const maxAtRisk = Math.max(1, Math.round(totalAlerted * 0.10)); // target 10% at_risk
    const atRisk = alerted.filter(c => c.status === 'at_risk');
    if (atRisk.length > maxAtRisk) {
      // Keep the worst ROAS campaigns as at_risk; flip the rest to active/paused
      const toKeep = [...atRisk].sort((a, b) => (a.roas || 0) - (b.roas || 0)).slice(0, maxAtRisk);
      const keepIds = new Set(toKeep.map(c => c.id));
      campaigns = campaigns.map(c => {
        if (c.alert && c.status === 'at_risk' && !keepIds.has(c.id)) {
          const newStatus = (c.roas < 1.5 ? 'paused' : 'active') as 'active' | 'paused';
          return { 
            ...c, 
            status: newStatus, 
            readinessPercent: calculateReadinessFromStatus(newStatus, c.id) 
          };
        }
        return c;
      });
    }
  }
})();

// Shift all dates used by the app forward by 130 days to keep demo data fresh
const SHIFT_DAYS = 130;
const isISODateOnly = (s: any): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const shiftDateValue = (v: any, days: number) => {
  if (v instanceof Date) return new Date(v.getTime() + days * DAY_MS);
  if (isISODateOnly(v)) {
    const d = new Date(`${v}T00:00:00Z`);
    const shifted = new Date(d.getTime() + days * DAY_MS);
    return shifted.toISOString().split('T')[0];
  }
  return v;
};
const shiftDatesDeep = (value: any, days: number): any => {
  if (Array.isArray(value)) return value.map(v => shiftDatesDeep(v, days));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: any = {};
    for (const k in value) {
      if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
      const v = (value as any)[k];
      out[k] = shiftDatesDeep(shiftDateValue(v, days), days);
    }
    return out;
  }
  return shiftDateValue(value, days);
};

const shiftedData = shiftDatesDeep({ portfolio, channels, campaigns }, SHIFT_DAYS) as CampaignData;

// FINAL ADJUSTMENT (post-shift): Guarantee >=50% of not-launched campaigns target within next 90 days (evenly 1..90)
const adjustedData: CampaignData = (() => {
  const out: CampaignData = JSON.parse(JSON.stringify(shiftedData));
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * DAY_MS);
  const notLaunched = out.campaigns.filter(c => !c.launchDate);
  const eligible = notLaunched.filter(c => {
    const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
    return tld && !isNaN(tld.getTime()) && tld.getTime() >= now.getTime() && tld.getTime() <= in90.getTime();
  });
  const desired = Math.ceil(notLaunched.length * 0.5);
  const need = Math.max(0, desired - eligible.length);
  if (need > 0) {
    const candidates = notLaunched
      .filter(c => {
        const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
        return !tld || isNaN(tld.getTime()) || tld.getTime() < now.getTime() || tld.getTime() > in90.getTime();
      })
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .slice(0, need);
    candidates.forEach((c, i) => {
      const daysOut = Math.floor((i * 89) / Math.max(1, need - 1)) + 1; // 1..90
      const tld = new Date(now.getTime() + daysOut * DAY_MS);
      const idx = out.campaigns.findIndex(cc => cc.id === c.id);
      if (idx !== -1) {
        out.campaigns[idx] = { ...out.campaigns[idx], targetLaunchDate: tld };
      }
    });
  }
  return out;
})();

export const mockCampaignData: CampaignData = adjustedData;

