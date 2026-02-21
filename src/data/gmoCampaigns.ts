/**
 * Transform api.campaigns.cleaned.json (GMO) into CampaignData.
 * Default filter: campaignstatus === "under development".
 * Used when data source is "GMO Campaigns".
 */

import type { CampaignData, Campaign, Channel, Portfolio } from '../types';

function parseDate(field: unknown): Date | null {
  if (!field || typeof field !== 'object') return null;
  const d = (field as { $date?: unknown }).$date;
  if (!d) return null;
  if (typeof d === 'string') return new Date(d);
  if (typeof d === 'object' && d !== null && '$numberLong' in d) {
    const n = Number((d as { $numberLong: string }).$numberLong);
    if (Number.isFinite(n)) return new Date(n);
  }
  return null;
}

export interface GMORawCampaign {
  _id?: string;
  v1id?: string;
  campaignstatus?: string;
  title?: string;
  campaign_name?: string;
  channels?: string[];
  target_channels?: string[];
  startdate?: unknown;
  enddate?: unknown;
  createdat?: unknown;
  updatedat?: unknown;
  [key: string]: unknown;
}

export function transformGMOToCampaignData(
  raw: GMORawCampaign[],
  filterStatus: string = 'under development'
): CampaignData {
  const filtered = raw.filter(
    (c) => (c.campaignstatus || '').toLowerCase() === filterStatus.toLowerCase()
  );

  const campaigns: Campaign[] = filtered.map((c) => {
    const startDate = parseDate(c.startdate);
    const endDate = parseDate(c.enddate);
    const createdDate = parseDate(c.createdat) || new Date(0);
    const id = (c._id || c.v1id || '') as string;
    const name = (c.title || c.campaign_name || 'Untitled') as string;
    const channel = (Array.isArray(c.channels) && c.channels[0]) || (Array.isArray(c.target_channels) && (c.target_channels[0] as string)) || 'display';

    const out: Campaign & { startDate?: Date } = {
      id,
      name,
      channel,
      budget: 0,
      spent: 0,
      roas: 0,
      status: 'active',
      alert: false,
      alerts: [],
      dailyMetrics: [],
      creatives: [],
      conversions: 0,
      ctr: 0,
      lastModified: createdDate,
      targetLaunchDate: startDate || createdDate,
      launchDate: null,
      endDate: endDate || undefined,
      createdDate,
      percentComplete: 50,
      createdBy: 'GMO',
      owner: 'GMO',
      funnelStage: 'awareness',
      lifecycleStage: 'development',
      readinessPercent: 50
    };
    if (startDate) (out as Campaign & { startDate?: Date }).startDate = startDate;
    return out;
  }).filter((c) => {
    const endDate = (c as Campaign & { endDate?: Date }).endDate;
    return endDate && !isNaN(endDate.getTime());
  });

  const channelIds = new Set<string>();
  campaigns.forEach((c) => channelIds.add(c.channel));
  const channels: Channel[] = Array.from(channelIds).map((id, i) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: 'circle',
    totalSpend: 0,
    totalRoas: 0,
    campaignCount: campaigns.filter((c) => c.channel === id).length,
    trend: [],
    color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16'][i % 10] || '#6B7280'
  }));

  const portfolio: Portfolio = {
    totalROAS: 0,
    budgetHealth: 0,
    activeCampaigns: campaigns.length,
    alerts: [],
    totalSpend: 0,
    totalRevenue: 0,
    totalBudget: 0,
    roasTrend: 0,
    lifecycleVelocity: 0,
    alertCoverageRatio: 0,
    funnelCoverageBalance: 0
  };

  return { portfolio, channels, campaigns };
}
