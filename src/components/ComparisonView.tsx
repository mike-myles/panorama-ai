import React, { useState } from 'react';
import { X, Lock, Unlock, RefreshCw, ArrowLeft } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { 
  ComparisonLayer0, 
  ComparisonLayer1, 
  ComparisonLayer2, 
  ComparisonLayer3, 
  ComparisonLayer4 
} from './comparison/ComparisonLayers';

export const ComparisonView: React.FC = () => {
  const { toggleComparisonMode, data } = useDashboard();
  const [syncZoom, setSyncZoom] = useState(false);
  const [leftZoom, setLeftZoom] = useState(0);
  const [rightZoom, setRightZoom] = useState(0);

  const handleLeftZoom = (level: number) => {
    setLeftZoom(level);
    if (syncZoom) setRightZoom(level);
  };

  const handleRightZoom = (level: number) => {
    setRightZoom(level);
    if (syncZoom) setLeftZoom(level);
  };

  const handleSyncToggle = () => {
    if (!syncZoom) {
      // When enabling sync, match right to left
      setRightZoom(leftZoom);
    }
    setSyncZoom(!syncZoom);
  };

  const handleReset = () => {
    setLeftZoom(0);
    setRightZoom(0);
  };
  
  return (
    <div className="fixed inset-0 z-[100] bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Comparison mode</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm">Left: L{Math.floor(leftZoom / 20)}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400 text-sm">Right: L{Math.floor(rightZoom / 20)}</span>
            </div>
            <button
              onClick={handleSyncToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
                syncZoom 
                  ? 'bg-primary text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {syncZoom ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {syncZoom ? 'Synced' : 'Independent'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset both
            </button>
          </div>
          <button
            onClick={toggleComparisonMode}
            className="flex items-center gap-2 px-4 py-2 bg-critical/20 hover:bg-critical/30 text-white rounded-xl transition-colors border border-critical/30"
          >
            <X className="w-5 h-5" />
            Exit compare
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex h-[calc(100vh-73px)] divide-x divide-white/10">
        {/* Left pane */}
        <ComparisonPane
          title="View A"
          side="left"
          zoomLevel={leftZoom}
          onZoomChange={handleLeftZoom}
          data={data}
        />

        {/* Right pane */}
        <ComparisonPane
          title="View B"
          side="right"
          zoomLevel={rightZoom}
          onZoomChange={handleRightZoom}
          data={data}
        />
      </div>
    </div>
  );
};

interface ComparisonPaneProps {
  title: string;
  side: 'left' | 'right';
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  data: any;
}

const ComparisonPane: React.FC<ComparisonPaneProps> = ({ title, zoomLevel, onZoomChange, data }) => {
  const [focusedCampaignId, setFocusedCampaignId] = useState<string | undefined>();
  const [focusedChannelId, setFocusedChannelId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<'current' | 'previous' | 'last7' | 'last30'>('current');
  
  const layer = Math.floor(zoomLevel / 20) as 0 | 1 | 2 | 3 | 4;

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.05;
      onZoomChange(Math.max(0, Math.min(100, zoomLevel + delta)));
    }
  };

  const handleBackButton = () => {
    if (layer > 0) {
      const newZoom = Math.max(0, (layer - 1) * 20 + 10);
      onZoomChange(newZoom);
      if (layer === 3) setFocusedCampaignId(undefined);
      if (layer === 2) setFocusedChannelId(undefined);
    }
  };

  const handleCampaignClick = (campaignId: string) => {
    setFocusedCampaignId(campaignId);
    onZoomChange(70);
  };

  const handleChannelClick = (channelId: string) => {
    setFocusedChannelId(channelId);
    onZoomChange(50);
  };

  const getLayerName = () => {
    switch(layer) {
      case 0: return 'Portfolio overview';
      case 1: return 'Channel performance';
      case 2: return 'Campaign grid';
      case 3: return 'Diagnostic view';
      case 4: return 'Granular analytics';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Pane header */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className="text-primary font-bold">L{layer}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300 text-sm">{getLayerName()}</span>
            </div>
            {layer > 0 && (
              <button
                onClick={handleBackButton}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Date range selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 text-sm outline-none"
            >
              <option value="current">Current period</option>
              <option value="previous">Previous period</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onZoomChange(Math.max(0, zoomLevel - 10))}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors font-bold"
              >
                -
              </button>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${zoomLevel}%` }}
                />
              </div>
              <span className="text-white text-sm font-semibold w-10 text-center">{Math.round(zoomLevel)}%</span>
              <button
                onClick={() => onZoomChange(Math.min(100, zoomLevel + 10))}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pane content */}
      <div 
        className="flex-1 relative overflow-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        {/* Render appropriate layer based on zoom level */}
        <div className="relative min-h-full flex items-center justify-center">
          {layer === 0 && (
            <ComparisonLayer0 data={data} />
          )}
          
          {layer === 1 && (
            <ComparisonLayer1 
              data={data} 
              onChannelClick={handleChannelClick}
            />
          )}
          
          {layer === 2 && (
            <ComparisonLayer2 
              data={data}
              focusedChannelId={focusedChannelId}
              onCampaignClick={handleCampaignClick}
            />
          )}
          
          {layer === 3 && (
            <ComparisonLayer3 
              data={data}
              focusedCampaignId={focusedCampaignId}
            />
          )}
          
          {layer === 4 && (
            <ComparisonLayer4 
              data={data}
              focusedCampaignId={focusedCampaignId}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2">
            <p className="text-white text-sm text-center">
              <span className="font-semibold">Ctrl/Cmd + Scroll</span> to zoom • <span className="font-semibold">Click</span> to drill down
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

