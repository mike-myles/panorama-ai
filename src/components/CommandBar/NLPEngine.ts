// NLP Engine for parsing natural language commands
import { IntentObject } from './types';
import { Campaign, Channel } from '../../types';

// Metric mapping dictionary
const metricMap: Record<string, string> = {
  'return on ad spend': 'ROAS',
  'roas': 'ROAS',
  'cost per click': 'CPC',
  'cpc': 'CPC',
  'click through rate': 'CTR',
  'ctr': 'CTR',
  'impressions': 'impressions',
  'clicks': 'clicks',
  'conversions': 'conversions',
  'spend': 'spend',
  'budget': 'budget',
  'revenue': 'revenue',
};

// Extract entity from query using fuzzy matching
export const extractEntityFromQuery = (
  query: string,
  campaigns: Campaign[],
  channels: Channel[]
): { type: string; id: string; name: string } | null => {
  const lowerQuery = query.toLowerCase();
  
  // Check campaigns
  for (const campaign of campaigns) {
    if (lowerQuery.includes(campaign.name.toLowerCase())) {
      return { type: 'campaign', id: campaign.id, name: campaign.name };
    }
  }
  
  // Check channels
  for (const channel of channels) {
    if (lowerQuery.includes(channel.name.toLowerCase()) || 
        lowerQuery.includes(channel.id.toLowerCase())) {
      return { type: 'channel', id: channel.id, name: channel.name };
    }
  }
  
  return null;
};

// Extract metric from query
export const extractMetric = (query: string): string | undefined => {
  const lowerQuery = query.toLowerCase();
  
  for (const [key, value] of Object.entries(metricMap)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }
  
  return undefined;
};

// Extract numeric values from query
export const extractNumericValue = (query: string): number | null => {
  // Match patterns like "$5K", "10%", "2.5", "5000"
  const patterns = [
    /\$(\d+)k/i,          // $5K
    /\$(\d+)(?:,\d{3})*/i, // $5,000
    /(\d+)%/,              // 10%
    /(\d+\.?\d*)/          // 2.5 or 5
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      if (query.includes('K') || query.includes('k')) {
        value *= 1000;
      }
      return value;
    }
  }
  
  return null;
};

// Extract action parameters
export const extractActionParameters = (query: string): any => {
  const params: any = {};
  
  // Extract percentage change
  const percentMatch = query.match(/(\d+)%/);
  if (percentMatch) {
    params.change = percentMatch[0];
  }
  
  // Extract amount
  const amount = extractNumericValue(query);
  if (amount) {
    params.amount = amount;
  }
  
  // Extract "from X to Y" pattern
  const fromToMatch = query.match(/from\s+([^\s]+)\s+to\s+([^\s]+)/i);
  if (fromToMatch) {
    params.from = fromToMatch[1];
    params.to = fromToMatch[2];
  }
  
  return params;
};

// Extract query parameters
export const extractQueryParameters = (query: string): any => {
  const params: any = {
    filters: []
  };
  
  const lowerQuery = query.toLowerCase();
  
  // Extract comparison entities
  if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
    const vsMatch = query.match(/(\w+)\s+(?:vs|versus|and)\s+(\w+)/i);
    if (vsMatch) {
      params.comparison = {
        entities: [vsMatch[1], vsMatch[2]]
      };
    }
  }
  
  // Extract filters (e.g., "over budget", "roas below 2")
  const filterPatterns = [
    /(\w+)\s+(over|above|below|under|greater than|less than)\s+(\d+\.?\d*)/i,
    /(over|under)performing/i
  ];
  
  for (const pattern of filterPatterns) {
    const match = query.match(pattern);
    if (match) {
      const metric = extractMetric(query) || 'budget';
      const operator = match[2] && ['over', 'above', 'greater'].some(w => match[2].toLowerCase().includes(w)) ? '>' : '<';
      const threshold = match[3] ? parseFloat(match[3]) : 100;
      
      params.filters.push({
        metric,
        operator,
        threshold
      });
    }
  }
  
  // Extract sort parameters
  if (lowerQuery.includes('top') || lowerQuery.includes('best')) {
    params.sortBy = 'desc';
  } else if (lowerQuery.includes('worst') || lowerQuery.includes('bottom')) {
    params.sortBy = 'asc';
  }
  
  return params;
};

// Main intent parsing function
export const parseIntent = (
  query: string,
  campaigns: Campaign[],
  channels: Channel[]
): IntentObject => {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return { type: 'search', confidence: 0, query: '' };
  }
  
  // Navigation patterns
  const navigationPat = /^(go to|show|navigate to|open|focus on|take me to|lead me to)\s+/i;
  if (navigationPat.test(lowerQuery)) {
    const entity = extractEntityFromQuery(query, campaigns, channels);
    return {
      type: 'navigate',
      target: entity ? {
        entityType: entity.type as any,
        entityId: entity.id,
        entityName: entity.name
      } : undefined,
      confidence: entity ? 0.9 : 0.5
    };
  }
  
  // Query/Analysis patterns
  const queryPatterns = /^(which|what|show me|list|find|how many|compare|analyze)/i;
  if (queryPatterns.test(lowerQuery)) {
    return {
      type: 'query',
      parameters: extractQueryParameters(query),
      confidence: 0.85
    };
  }
  
  // Action patterns
  const actionPatterns = /^(pause|resume|increase|decrease|reallocate|optimize|adjust|change|stop|start)/i;
  if (actionPatterns.test(lowerQuery)) {
    const actionMatch = lowerQuery.match(actionPatterns);
    const entity = extractEntityFromQuery(query, campaigns, channels);
    
    return {
      type: 'action',
      action: actionMatch ? actionMatch[1] : 'unknown',
      target: entity ? {
        entityType: entity.type as any,
        entityId: entity.id,
        entityName: entity.name
      } : undefined,
      parameters: extractActionParameters(query),
      confidence: 0.8
    };
  }
  
  // Default: treat as search
  return {
    type: 'search',
    query: query,
    confidence: 0.5
  };
};

// Fuzzy search helper
export const fuzzySearch = (query: string, items: string[]): string[] => {
  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    item.toLowerCase().includes(lowerQuery)
  ).sort((a, b) => {
    const aIndex = a.toLowerCase().indexOf(lowerQuery);
    const bIndex = b.toLowerCase().indexOf(lowerQuery);
    return aIndex - bIndex;
  });
};

