import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ZoomState, FilterState, CampaignData, PresetView, LayerNumber, ActionHistoryItem, Action, AnalyticsType } from '../types';
import { mockCampaignData } from '../data/mockData3';
import { transformGMOToCampaignData } from '../data/gmoCampaigns';
import type { GMORawCampaign } from '../data/gmoCampaigns';

/* cspell:words roas */

export type DataSource = 'mock' | 'gmo';

interface DashboardContextType {
  data: CampaignData;
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  zoomState: ZoomState;
  setZoomLevel: (level: number) => void;
  setLayer: (layer: LayerNumber) => void;
  setFocusedCampaign: (campaignId?: string) => void;
  setFocusedChannel: (channelId?: string) => void;
  setSelectedAnalytics: (analyticsType: AnalyticsType) => void;
  filterState: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  activePreset: PresetView;
  setPresetView: (preset: PresetView) => void;
  actionHistory: ActionHistoryItem[];
  executeAction: (action: Action, campaignId?: string) => Promise<void>;
  undoAction: () => void;
  redoAction: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const defaultFilterState: FilterState = {
  channels: [],
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  performanceTier: 'all',
  status: 'all',
  roasRange: [0, 10],
  budgetRange: [0, 100000]
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [dataSource, setDataSourceState] = useState<DataSource>('mock');
  const [gmoData, setGmoData] = useState<CampaignData | null>(null);
  const data = dataSource === 'gmo' && gmoData ? gmoData : mockCampaignData;

  const setDataSource = useCallback((source: DataSource) => {
    setDataSourceState(source);
    if (source === 'gmo' && !gmoData) {
      import('../data/api.campaigns.cleaned.json').then((mod: { default: GMORawCampaign[] }) => {
        const raw = mod.default as GMORawCampaign[];
        setGmoData(transformGMOToCampaignData(raw));
      }).catch((err) => {
        console.error('Failed to load GMO campaigns:', err);
      });
    }
  }, [gmoData]);

  const [zoomState, setZoomStateInternal] = useState<ZoomState>({
    level: 0,
    layer: 0
  });
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [activePreset, setActivePreset] = useState<PresetView>('portfolio');
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0, Math.min(100, level));
    const layer = Math.floor(clampedLevel / 20) as LayerNumber;
    setZoomStateInternal(prev => ({ ...prev, level: clampedLevel, layer }));
  }, []);

  const setLayer = useCallback((layer: LayerNumber) => {
    const level = layer * 20;
    setZoomStateInternal(prev => ({ ...prev, level, layer }));
  }, []);

  const setFocusedCampaign = useCallback((campaignId?: string) => {
    setZoomStateInternal(prev => ({ ...prev, focusedCampaignId: campaignId }));
  }, []);

  const setFocusedChannel = useCallback((channelId?: string) => {
    setZoomStateInternal(prev => ({ ...prev, focusedChannelId: channelId }));
  }, []);

  const setSelectedAnalytics = useCallback((analyticsType: AnalyticsType) => {
    setZoomStateInternal(prev => ({ ...prev, selectedAnalyticsType: analyticsType }));
  }, []);

  const updateFilters = useCallback((filters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...filters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(defaultFilterState);
  }, []);

  const setPresetView = useCallback((preset: PresetView) => {
    setActivePreset(preset);
    switch (preset) {
      case 'portfolio': setZoomLevel(0); clearFilters(); break;
      case 'channels': setZoomLevel(30); clearFilters(); break;
      case 'campaigns': setZoomLevel(50); updateFilters({ status: 'active' }); break;
      case 'issues': setZoomLevel(40); break;
      case 'opportunities': setZoomLevel(50); updateFilters({ status: 'active', roasRange: [2.0, 10] }); break;
    }
  }, [setZoomLevel, clearFilters, updateFilters]);

  const executeAction = useCallback(async (action: Action, campaignId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const historyItem: ActionHistoryItem = {
      action,
      timestamp: new Date(),
      user: 'Current User',
      outcome: 'success',
      previousState: { campaignId }
    };
    setActionHistory(prev => [...prev.slice(0, historyIndex + 1), historyItem]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undoAction = useCallback(() => {
    if (historyIndex >= 0) setHistoryIndex(prev => prev - 1);
  }, [historyIndex]);

  const redoAction = useCallback(() => {
    if (historyIndex < actionHistory.length - 1) setHistoryIndex(prev => prev + 1);
  }, [historyIndex, actionHistory]);

  const value: DashboardContextType = {
    data,
    dataSource,
    setDataSource,
    zoomState,
    setZoomLevel,
    setLayer,
    setFocusedCampaign,
    setFocusedChannel,
    setSelectedAnalytics,
    filterState,
    updateFilters,
    clearFilters,
    activePreset,
    setPresetView,
    actionHistory,
    executeAction,
    undoAction,
    redoAction
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
