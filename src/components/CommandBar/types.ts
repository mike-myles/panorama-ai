// Command Bar Types

export interface IntentObject {
  type: 'navigate' | 'query' | 'action' | 'search';
  confidence: number;
  target?: {
    entityType?: 'campaign' | 'channel' | 'portfolio' | 'layer';
    entityId?: string | null;
    entityName?: string | null;
  };
  parameters?: {
    metric?: string;
    comparison?: {
      entities: string[];
    };
    timeRange?: {
      start?: string;
      end?: string;
      period?: string;
    };
    filters?: Array<{
      metric: string;
      operator: string;
      threshold: number;
    }>;
    sortBy?: string;
    action?: string;
    change?: string;
    from?: string;
    to?: string;
    amount?: number;
  };
  suggestedView?: 'dashboard' | 'cosmos' | null;
  action?: string;
  query?: string;
}

export interface Suggestion {
  id: string;
  type: 'navigate' | 'query' | 'action' | 'recent';
  icon: string;
  primaryText: string;
  secondaryText?: string;
  intent: IntentObject;
  category: string;
}

export interface QueryResult {
  id: string;
  type: 'campaign' | 'channel' | 'metric' | 'insight';
  name: string;
  data: any;
  context?: string;
}

