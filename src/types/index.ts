export type AlertSeverity = 'critical' | 'warning' | 'info';
export type CampaignStatus = 'active' | 'paused' | 'at_risk';
export type LayerNumber = 0 | 1 | 2 | 3 | 4;
export type ViewMode = 'dashboard' | 'cosmos';

// Alert Categories for the 5-category framework
export type AlertCategory = 
  | 'audience_overlap'      // Self-Competition
  | 'lifecycle_stall'       // Velocity Blockers
  | 'budget_pacing'         // Budget Pacing Anomaly
  | 'roas_misalignment'     // ROAS-Funnel Misalignment
  | 'attribution_leak';     // Cross-Channel Attribution Leak

export interface CategorizedAlert {
  id: string;
  category: AlertCategory;
  title: string;
  description: string;
  impact: string;
  severity: AlertSeverity;
  affectedCampaignIds: string[];
  metrics: {
    value: number | string;
    label: string;
  }[];
  recommendation: string;
  timestamp: Date;
}

// New Framework Types
export type FunnelStage = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type LifecycleStage = 'ideation' | 'planning' | 'development' | 'qa_ready' | 'launching' | 'active' | 'closing';
export type ReadinessStatus = 'at_risk' | 'needs_attention' | 'on_track'; // <50%, 50-80%, >80%

/* cspell:words roas ROAS Roas */

export interface Action {
  id: string;
  title: string;
  expectedOutcome: string;
  confidence: number;
  type: 'pause' | 'budget_adjust' | 'bid_adjust' | 'creative_swap' | 'custom';
  params?: Record<string, any>;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  layer: LayerNumber;
  campaignId?: string;
  creativeId?: string;
  suggestedActions: Action[];
  timestamp: Date;
  percentComplete?: number;
}

export interface DailyMetric {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
}

export interface Creative {
  id: string;
  name: string;
  thumbnail: string;
  type: 'image' | 'video' | 'carousel';
  spend: number;
  roas: number;
  conversions: number;
  status: CampaignStatus;
}

export interface Audience {
  id: number;
  name: string;
  description?: string;
  estimatedSize: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  roas: number;
  status: CampaignStatus;
  alert: boolean; // true when campaign has an alert
  alerts: Alert[];
  dailyMetrics: DailyMetric[];
  creatives: Creative[];
  audiences?: Audience[];
  conversions: number;
  ctr: number;
  lastModified: Date;
  // Lifecycle fields
  targetLaunchDate: Date;
  launchDate: Date | null;
  endDate?: Date;
  createdDate: Date;
  percentComplete: number; // 0-100
  createdBy: string;
  owner: string;
  // New Framework Fields
  funnelStage: FunnelStage; // Determines orbital plane angle (0°, 30°, 60°, 90°)
  lifecycleStage: LifecycleStage; // Determines ring/orbit distance from sun
  readinessPercent: number; // 0-100, determines planet color
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  totalSpend: number;
  totalRoas: number;
  campaignCount: number;
  trend: number[];
  color: string;
}

export interface Portfolio {
  totalROAS: number;
  budgetHealth: number;
  activeCampaigns: number;
  alerts: Alert[];
  totalSpend: number;
  totalRevenue: number;
  totalBudget: number;
  roasTrend: number;
  // New Framework Health Metrics
  lifecycleVelocity: number; // % of campaigns at or beyond expected lifecycle stage
  alertCoverageRatio: number; // proportion of campaigns with active alerts
  funnelCoverageBalance: number; // evenness of campaigns across 4 funnel planes (variance)
}

export interface CampaignData {
  portfolio: Portfolio;
  channels: Channel[];
  campaigns: Campaign[];
}

export interface FilterState {
  channels: string[];
  dateRange: { start: Date; end: Date };
  performanceTier: 'all' | 'top' | 'mid' | 'under';
  status: CampaignStatus | 'all';
  roasRange: [number, number];
  budgetRange: [number, number];
}

export type AnalyticsType = 'daily-spend' | 'roas-trend' | 'conversions' | 'click-through-rate' | null;

export interface ZoomState {
  level: number; // 0-100
  layer: LayerNumber;
  focusedCampaignId?: string;
  focusedChannelId?: string;
  selectedAnalyticsType?: AnalyticsType;
}

export type PresetView = 'portfolio' | 'channels' | 'campaigns' | 'issues' | 'opportunities';

export interface ActionHistoryItem {
  action: Action;
  timestamp: Date;
  user: string;
  outcome: 'success' | 'failed' | 'pending';
  previousState?: any;
}

