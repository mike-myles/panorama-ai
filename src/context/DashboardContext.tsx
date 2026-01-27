import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ZoomState, FilterState, CampaignData, PresetView, LayerNumber, ActionHistoryItem, Action, ViewMode, AnalyticsType, CategorizedAlert } from '../types';
import { mockCampaignData } from '../data/mockData3';
// Minimal AIInsight type used for detail dashboards
interface AIInsight {
  id: string;
  title: string;
  description?: string;
  affectedCampaignIds?: string[];
}

/* cspell:words roas */

interface DashboardContextType {
  // Data
  data: CampaignData;
  
  // View mode
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  
  // Zoom state
  zoomState: ZoomState;
  setZoomLevel: (level: number) => void;
  setLayer: (layer: LayerNumber) => void;
  setFocusedCampaign: (campaignId?: string) => void;
  setFocusedChannel: (channelId?: string) => void;
  setSelectedAnalytics: (analyticsType: AnalyticsType) => void;
  
  // Filter state
  filterState: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  
  // Preset views
  activePreset: PresetView;
  setPresetView: (preset: PresetView) => void;
  
  // Comparison mode
  comparisonMode: boolean;
  toggleComparisonMode: () => void;
  
  // Action history
  actionHistory: ActionHistoryItem[];
  executeAction: (action: Action, campaignId?: string) => Promise<void>;
  undoAction: () => void;
  redoAction: () => void;
  
  // Quick actions panel
  quickActionsPanelOpen: boolean;
  selectedAlert: string | null;
  openQuickActionsPanel: (alertId: string) => void;
  closeQuickActionsPanel: () => void;

  // UI Config
  showZoomInDashboard: boolean;
  setShowZoomInDashboard: (show: boolean) => void;
  
  // Detail view state for alerts and AI insights
  detailViewAlert: CategorizedAlert | null;
  detailViewInsight: AIInsight | null;
  openAlertDetailView: (alert: CategorizedAlert) => void;
  openInsightDetailView: (insight: AIInsight) => void;
  closeDetailView: () => void;
  returnToCosmosWithPanel: () => void;
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
  const [data] = useState<CampaignData>(mockCampaignData);
  const [activeView, setActiveView] = useState<ViewMode>('cosmos');
  const [zoomState, setZoomStateInternal] = useState<ZoomState>({
    level: 0,
    layer: 0
  });
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [activePreset, setActivePreset] = useState<PresetView>('portfolio');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [quickActionsPanelOpen, setQuickActionsPanelOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // UI Config: whether to show ZoomControls on Dashboard pages (non-3D views)
  const [showZoomInDashboard, setShowZoomInDashboardState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('config.showZoomInDashboard');
      return saved === null ? false : saved === 'true';
    } catch {
      return false;
    }
  });
  const setShowZoomInDashboard = useCallback((show: boolean) => {
    setShowZoomInDashboardState(show);
    try { localStorage.setItem('config.showZoomInDashboard', String(show)); } catch {}
  }, []);
  
  // Detail view state for alerts and AI insights
  const [detailViewAlert, setDetailViewAlert] = useState<CategorizedAlert | null>(null);
  const [detailViewInsight, setDetailViewInsight] = useState<AIInsight | null>(null);
  
  const openAlertDetailView = useCallback((alert: CategorizedAlert) => {
    setDetailViewAlert(alert);
    setDetailViewInsight(null);
    setActiveView('dashboard');
  }, []);
  
  const openInsightDetailView = useCallback((insight: AIInsight) => {
    setDetailViewInsight(insight);
    setDetailViewAlert(null);
    setActiveView('dashboard');
  }, []);
  
  const closeDetailView = useCallback(() => {
    setDetailViewAlert(null);
    setDetailViewInsight(null);
  }, []);
  
  // Return to Cosmos view while keeping the detail panel context
  // This allows the panel to reopen when switching back
  const returnToCosmosWithPanel = useCallback(() => {
    // Dispatch custom event to signal Cosmos to reopen the appropriate panel
    if (detailViewAlert) {
      window.dispatchEvent(new CustomEvent('cosmos:reopenAlertPanel', { detail: { alert: detailViewAlert } }));
    } else if (detailViewInsight) {
      window.dispatchEvent(new CustomEvent('cosmos:reopenInsightPanel', { detail: { insight: detailViewInsight } }));
    }
    // Clear detail view state and switch to cosmos
    setDetailViewAlert(null);
    setDetailViewInsight(null);
    setActiveView('cosmos');
  }, [detailViewAlert, detailViewInsight]);

  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0, Math.min(100, level));
    const layer = Math.floor(clampedLevel / 20) as LayerNumber;
    
    setZoomStateInternal(prev => ({
      ...prev,
      level: clampedLevel,
      layer
    }));
  }, []);

  const setLayer = useCallback((layer: LayerNumber) => {
    const level = layer * 20;
    setZoomStateInternal(prev => ({
      ...prev,
      level,
      layer
    }));
  }, []);

  const setFocusedCampaign = useCallback((campaignId?: string) => {
    setZoomStateInternal(prev => ({
      ...prev,
      focusedCampaignId: campaignId
    }));
  }, []);

  const setFocusedChannel = useCallback((channelId?: string) => {
    setZoomStateInternal(prev => ({
      ...prev,
      focusedChannelId: channelId
    }));
  }, []);

  const setSelectedAnalytics = useCallback((analyticsType: AnalyticsType) => {
    setZoomStateInternal(prev => ({
      ...prev,
      selectedAnalyticsType: analyticsType
    }));
  }, []);

  const updateFilters = useCallback((filters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...filters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(defaultFilterState);
  }, []);

  const setPresetView = useCallback((preset: PresetView) => {
    setActivePreset(preset);
    
    // Reset zoom and filters based on preset
    switch (preset) {
      case 'portfolio':
        setZoomLevel(0);
        clearFilters();
        break;
      case 'channels':
        setZoomLevel(30);
        clearFilters();
        break;
      case 'campaigns':
        setZoomLevel(50);
        updateFilters({ status: 'active' });
        break;
      case 'issues':
        setZoomLevel(40);
        // Filter to show only campaigns with alerts
        break;
      case 'opportunities':
        setZoomLevel(50);
        updateFilters({ status: 'active', roasRange: [2.0, 10] });
        break;
    }
  }, [setZoomLevel, clearFilters, updateFilters]);

  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
  }, []);

  const executeAction = useCallback(async (action: Action, campaignId?: string) => {
    // Simulate API call
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
    if (historyIndex >= 0) {
      setHistoryIndex(prev => prev - 1);
      // Revert to previous state
    }
  }, [historyIndex]);

  const redoAction = useCallback(() => {
    if (historyIndex < actionHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      // Reapply action
    }
  }, [historyIndex, actionHistory]);

  const openQuickActionsPanel = useCallback((alertId: string) => {
    setSelectedAlert(alertId);
    setQuickActionsPanelOpen(true);
  }, []);

  const closeQuickActionsPanel = useCallback(() => {
    setQuickActionsPanelOpen(false);
    setSelectedAlert(null);
  }, []);

  const value: DashboardContextType = {
    data,
    activeView,
    setActiveView,
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
    comparisonMode,
    toggleComparisonMode,
    actionHistory,
    executeAction,
    undoAction,
    redoAction,
    quickActionsPanelOpen,
    selectedAlert,
    openQuickActionsPanel,
    closeQuickActionsPanel,

    showZoomInDashboard,
    setShowZoomInDashboard,
    
    detailViewAlert,
    detailViewInsight,
    openAlertDetailView,
    openInsightDetailView,
    closeDetailView,
    returnToCosmosWithPanel
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

