import { Suggestion } from './types';
import { Campaign, Channel } from '../../types';

export const getContextSuggestions = (
  activeView: 'dashboard' | 'cosmos',
  currentLayer: number,
  campaigns: Campaign[],
  _channels: Channel[]
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Dashboard-specific suggestions
  if (activeView === 'dashboard') {
    if (currentLayer >= 0 && currentLayer <= 30) {
      // Layer 0 (Portfolio) suggestions
      suggestions.push(
        {
          id: 'dash-port-1',
          type: 'navigate',
          icon: '📊',
          primaryText: 'Show portfolio health summary',
          secondaryText: 'View all key metrics',
          intent: { 
            type: 'navigate',
            target: {
              entityType: 'portfolio',
              entityName: 'Portfolio overview'
            },
            confidence: 0.9 
          },
          category: 'Quick actions'
        },
        {
          id: 'dash-port-2',
          type: 'navigate',
          icon: '🏆',
          primaryText: 'View all channels performance',
          secondaryText: 'Compare channel performance',
          intent: { 
            type: 'navigate',
            target: {
              entityType: 'channel',
              entityName: 'All channels'
            },
            confidence: 0.9 
          },
          category: 'Insights'
        },
        {
          id: 'dash-port-3',
          type: 'navigate',
          icon: '📋',
          primaryText: 'List all active campaigns',
          secondaryText: `${campaigns.filter(c => c.status === 'active').length} active campaigns`,
          intent: { 
            type: 'query',
            confidence: 0.9 
          },
          category: 'Navigation'
        }
      );
    } else if (currentLayer >= 70 && currentLayer <= 85) {
      // Layer 2 (Campaign Grid) suggestions
      const overBudgetCampaigns = campaigns.filter(c => 
        c.spent > c.budget * 0.9
      );
      const topROASCampaigns = campaigns
        .sort((a, b) => b.roas - a.roas)
        .slice(0, 3);
      
      suggestions.push(
        {
          id: 'dash-camp-1',
          type: 'query',
          icon: '⚠️',
          primaryText: 'Show campaigns over budget',
          secondaryText: `${overBudgetCampaigns.length} campaigns need attention`,
          intent: { 
            type: 'query',
            confidence: 0.9 
          },
          category: 'Insights'
        },
        {
          id: 'dash-camp-2',
          type: 'navigate',
          icon: '📈',
          primaryText: 'View top performing campaigns',
          secondaryText: `Highest ROAS: ${topROASCampaigns[0]?.name}`,
          intent: { 
            type: 'navigate',
            target: {
              entityType: 'campaign',
              entityId: topROASCampaigns[0]?.id,
              entityName: topROASCampaigns[0]?.name
            },
            confidence: 0.9 
          },
          category: 'Analysis'
        }
      );
    }
  }

  // Cosmos-specific suggestions
  if (activeView === 'cosmos') {
    const topROASCampaigns = campaigns
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 3);
    const largestBudgetCampaigns = campaigns
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 3);
    const alertCampaigns = campaigns.filter(c => c.alerts && c.alerts.length > 0);
    
    // Find the critical launch campaign "Holiday Flash Sale Dec 2025"
    // This is the most urgent campaign requiring immediate attention
    const criticalLaunchCampaign = campaigns.find(c => c.id === 'camp-critical-launch');
    const mostUrgentCampaign = criticalLaunchCampaign;
    const today = new Date();
    const targetLaunchDate = criticalLaunchCampaign ? new Date((criticalLaunchCampaign as any).targetLaunchDate) : null;
    const daysUntilLaunch = targetLaunchDate 
      ? Math.ceil((targetLaunchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 5;
    const percentComplete = criticalLaunchCampaign ? ((criticalLaunchCampaign as any).percentComplete || 8) : 8;
    
    // Find the largest budget campaign that has ANY alert (for context-aware navigation)
    // This is used when alerts are filtered - shows largest budget among alerted campaigns
    const largestBudgetWithAlert = alertCampaigns
      .sort((a, b) => b.budget - a.budget)[0];
    
    // Check if the largest budget campaign with alert has a budget-related alert
    const hasBudgetAlert = largestBudgetWithAlert?.alerts?.some(a => 
      a.message?.toLowerCase().includes('budget') || 
      a.message?.toLowerCase().includes('overspend') ||
      a.message?.toLowerCase().includes('pace') ||
      a.message?.toLowerCase().includes('spend')
    );
    
    suggestions.push(
      {
        id: 'cosmos-1',
        type: 'navigate',
        icon: '🌟',
        primaryText: 'Focus on brightest performer',
        secondaryText: `${topROASCampaigns[0]?.name} • ROAS ${topROASCampaigns[0]?.roas.toFixed(1)}`,
        intent: { 
          type: 'navigate',
          target: {
            entityType: 'campaign',
            entityId: topROASCampaigns[0]?.id,
            entityName: topROASCampaigns[0]?.name
          },
          confidence: 0.9 
        },
        category: 'Quick actions'
      },
      ...(mostUrgentCampaign ? [{
        id: 'cosmos-urgent-attention',
        type: 'navigate' as const,
        icon: '🚨',
        primaryText: 'Focus on campaign requiring urgent attention',
        secondaryText: `${mostUrgentCampaign.name} • Launching in ${daysUntilLaunch} day${daysUntilLaunch !== 1 ? 's' : ''} • Only ${percentComplete}% ready`,
        intent: { 
          type: 'navigate' as const,
          target: {
            entityType: 'campaign' as const,
            entityId: mostUrgentCampaign.id,
            entityName: mostUrgentCampaign.name
          },
          confidence: 0.95 
        },
        category: 'Critical'
      }] : []),
      // "View largest budget campaign" - ALWAYS shows largest budget campaign WITH an alert
      // This maintains context when alerts are filtered and shows "At risk" status
      ...(largestBudgetWithAlert ? [{
        id: 'cosmos-2',
        type: 'navigate' as const,
        icon: '💰',
        primaryText: 'View largest budget campaign',
        secondaryText: `${largestBudgetWithAlert.name} • $${(largestBudgetWithAlert.budget / 1000).toFixed(0)}K • At risk${hasBudgetAlert ? ' • Nearing budget limit' : ''}`,
        intent: { 
          type: 'navigate' as const,
          target: {
            entityType: 'campaign' as const,
            entityId: largestBudgetWithAlert.id,
            entityName: largestBudgetWithAlert.name
          },
          confidence: 0.9 
        },
        category: 'Budget alerts'
      }] : [{
        id: 'cosmos-2',
        type: 'navigate' as const,
        icon: '💰',
        primaryText: 'View largest budget campaign',
        secondaryText: `${largestBudgetCampaigns[0]?.name} • $${(largestBudgetCampaigns[0]?.budget / 1000).toFixed(0)}K`,
        intent: { 
          type: 'navigate' as const,
          target: {
            entityType: 'campaign' as const,
            entityId: largestBudgetCampaigns[0]?.id,
            entityName: largestBudgetCampaigns[0]?.name
          },
          confidence: 0.9 
        },
        category: 'Insights'
      }]),
      {
        id: 'cosmos-3',
        type: 'navigate',
        icon: '🎯',
        primaryText: 'Navigate to campaigns needing attention',
        secondaryText: `${alertCampaigns.length} campaigns with alerts`,
        intent: { 
          type: 'navigate',
          target: {
            entityType: 'campaign',
            entityId: alertCampaigns[0]?.id,
            entityName: alertCampaigns[0]?.name
          },
          confidence: 0.9 
        },
        category: 'Navigation'
      }
    );

    // If currently in launch readiness mode, offer default campaign view at the top
    try {
      if (typeof window !== 'undefined' && (window as any).catalyzeCosmosMode === 'launch_readiness') {
        suggestions.unshift({
          id: 'cosmos-default-view',
          type: 'navigate',
          icon: '🌀',
          primaryText: 'Default campaign view',
          secondaryText: 'Portfolio center • All campaigns by channel',
          intent: { 
            type: 'navigate',
            target: {
              entityType: 'portfolio',
              entityName: 'Default view'
            },
            confidence: 0.95 
          },
          category: 'Quick actions'
        });
      }
    } catch {}
  }

  // Alert-based suggestions (common to both views)
  const campaignsWithAlerts = campaigns.filter(c => c.alerts.length > 0);
  if (campaignsWithAlerts.length > 0) {
    suggestions.push({
      id: 'alert-1',
      type: 'navigate',
      icon: '🚨',
      primaryText: `View first campaign with alerts`,
      secondaryText: `${campaignsWithAlerts.length} campaigns need attention`,
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'campaign',
          entityId: campaignsWithAlerts[0].id,
          entityName: campaignsWithAlerts[0].name
        },
        confidence: 0.9 
      },
      category: 'Alerts'
    });
  }

  // Time-based suggestions
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 9 && hour < 12) {
    suggestions.push({
      id: 'time-1',
      type: 'navigate',
      icon: '☀️',
      primaryText: 'Morning briefing - view portfolio',
      secondaryText: 'Review previous day metrics',
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'portfolio',
          entityName: 'Portfolio overview'
        },
        confidence: 0.85 
      },
      category: 'Time-based'
    });
  } else if (hour >= 17 && hour < 20) {
    suggestions.push({
      id: 'time-2',
      type: 'navigate',
      icon: '🌙',
      primaryText: 'End-of-day review - view portfolio',
      secondaryText: 'Today\'s performance summary',
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'portfolio',
          entityName: 'Portfolio overview'
        },
        confidence: 0.85 
      },
      category: 'Time-based'
    });
  }

  // Top campaigns as suggestions
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3);
  
  topCampaigns.forEach((campaign, idx) => {
    suggestions.push({
      id: `top-camp-${idx}`,
      type: 'navigate',
      icon: '🎯',
      primaryText: campaign.name,
      secondaryText: `${campaign.channel} • ROAS ${campaign.roas.toFixed(1)}`,
      intent: {
        type: 'navigate',
        target: {
          entityType: 'campaign',
          entityId: campaign.id,
          entityName: campaign.name
        },
        confidence: 0.9
      },
      category: 'Top campaigns'
    });
  });

  // Additional insight-based suggestions
  const lowROASCampaigns = campaigns.filter(c => c.roas < 2.0);
  const highSpendCampaigns = campaigns.filter(c => c.spent > 100000);
  const socialCampaigns = campaigns.filter(c => c.channel.toLowerCase() === 'social');
  const searchCampaigns = campaigns.filter(c => c.channel.toLowerCase() === 'search');
  const displayCampaigns = campaigns.filter(c => c.channel.toLowerCase() === 'display');
  const videoCampaigns = campaigns.filter(c => c.channel.toLowerCase() === 'video');
  
  // Channel performance insights
  suggestions.push(
    {
      id: 'insight-channel-social',
      type: 'navigate',
      icon: '📱',
      primaryText: 'Explore Social channel performance',
      secondaryText: `${socialCampaigns.length} campaigns • Avg ROAS ${(socialCampaigns.reduce((a, c) => a + c.roas, 0) / socialCampaigns.length || 0).toFixed(1)}`,
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'channel',
          entityName: 'Social'
        },
        confidence: 0.85 
      },
      category: 'Channel insights'
    },
    {
      id: 'insight-channel-search',
      type: 'navigate',
      icon: '🔍',
      primaryText: 'Analyze Search channel trends',
      secondaryText: `${searchCampaigns.length} campaigns • Top performer channel`,
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'channel',
          entityName: 'Search'
        },
        confidence: 0.85 
      },
      category: 'Channel insights'
    },
    {
      id: 'insight-channel-display',
      type: 'navigate',
      icon: '🖼️',
      primaryText: 'Review Display campaign reach',
      secondaryText: `${displayCampaigns.length} campaigns across funnel`,
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'channel',
          entityName: 'Display'
        },
        confidence: 0.85 
      },
      category: 'Channel insights'
    },
    {
      id: 'insight-channel-video',
      type: 'navigate',
      icon: '🎬',
      primaryText: 'Check Video campaign engagement',
      secondaryText: `${videoCampaigns.length} campaigns • Awareness focus`,
      intent: { 
        type: 'navigate',
        target: {
          entityType: 'channel',
          entityName: 'Video'
        },
        confidence: 0.85 
      },
      category: 'Channel insights'
    }
  );

  // Performance opportunity suggestions
  if (lowROASCampaigns.length > 0) {
    suggestions.push({
      id: 'opportunity-low-roas',
      type: 'query',
      icon: '📉',
      primaryText: 'Identify underperforming campaigns',
      secondaryText: `${lowROASCampaigns.length} campaigns with ROAS < 2.0`,
      intent: { 
        type: 'query',
        confidence: 0.9 
      },
      category: 'Opportunities'
    });
  }

  if (highSpendCampaigns.length > 0) {
    suggestions.push({
      id: 'insight-high-spend',
      type: 'query',
      icon: '💸',
      primaryText: 'Review high-spend campaigns',
      secondaryText: `${highSpendCampaigns.length} campaigns over $100K spend`,
      intent: { 
        type: 'query',
        confidence: 0.85 
      },
      category: 'Budget insights'
    });
  }

  // Trend and forecast suggestions
  suggestions.push(
    {
      id: 'trend-weekly',
      type: 'query',
      icon: '📈',
      primaryText: 'Show weekly performance trend',
      secondaryText: 'Compare this week vs last week',
      intent: { 
        type: 'query',
        confidence: 0.8 
      },
      category: 'Trends'
    },
    {
      id: 'trend-conversion',
      type: 'query',
      icon: '🎯',
      primaryText: 'Analyze conversion funnel health',
      secondaryText: 'Awareness → Consideration → Conversion',
      intent: { 
        type: 'query',
        confidence: 0.8 
      },
      category: 'Funnel analysis'
    },
    {
      id: 'opportunity-budget',
      type: 'action',
      icon: '💰',
      primaryText: 'Find budget reallocation opportunities',
      secondaryText: 'Optimize spend across campaigns',
      intent: { 
        type: 'action',
        action: 'analyze',
        confidence: 0.85 
      },
      category: 'Recommendations'
    }
  );

  return suggestions.slice(0, 15); // Increased limit to 15 suggestions
};

