import React, { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext';
import { PresetTabs } from './PresetTabs';
// import { FilterBar } from './FilterBar';
import { ZoomControls } from './ZoomControls';
// import { LayerIndicator } from './LayerIndicator';
import { QuickActionsPanel } from './QuickActionsPanel';
import { ComparisonView } from './ComparisonView';
import { CosmosView } from './CosmosView';
// Galaxy view removed
import { Layer0Portfolio } from './layers/Layer0Portfolio';
// import { Layer1Channels } from './layers/Layer1Channels';
import { LayerROASAnalytics } from './layers/LayerROASAnalytics';
/* cspell:words ROAS bg tw toggleable */
import { LayerBudgetHealth } from './layers/LayerBudgetHealth';
import { LayerCampaignStatus } from './layers/LayerCampaignStatus';
import { Layer2Campaigns } from './layers/Layer2Campaigns';
import { Layer3Diagnostic } from './layers/Layer3Diagnostic';
import { Layer4Granular } from './layers/Layer4Granular';
import { CosmosFilterPanel } from './cosmos/CosmosFilterPanel';
import { HelpModal } from './HelpModal';
import { CommandBar } from './CommandBar';
import { Sparkles, Search } from 'lucide-react';
import { AlertDetailDashboard } from './dashboard/AlertDetailDashboard';
import { InsightDetailDashboard } from './dashboard/InsightDetailDashboard';
import { AudienceFatigueDetailDashboard } from './dashboard/AudienceFatigueDetailDashboard';

export const Dashboard = () => {
  const { 
    setZoomLevel, zoomState, comparisonMode, activeView, showZoomInDashboard, data,
    detailViewAlert, detailViewInsight, closeDetailView, setActiveView
  } = useDashboard();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiNavHovered, setAiNavHovered] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    // Do NOT intercept pinch/ctrl+wheel in Cosmos view to allow OrbitControls zoom
    if (activeView === 'cosmos') return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.05;
      setZoomLevel(zoomState.level + delta);
    }
  }, [setZoomLevel, zoomState.level, activeView]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Show comparison view if enabled
  if (comparisonMode) {
    return <ComparisonView />;
  }

  // Handle back from detail view - returns to cosmos
  const handleBackFromDetail = () => {
    closeDetailView();
    setActiveView('cosmos');
  };

  // Show Alert Detail Dashboard if viewing an alert (only when Dashboard view is active)
  if (activeView === 'dashboard' && detailViewAlert) {
    // Use specialized dashboard for audience fatigue/overlap alerts
    if (detailViewAlert.category === 'audience_overlap') {
      return (
        <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-hidden">
          <PresetTabs />
          <AudienceFatigueDetailDashboard 
            alert={detailViewAlert} 
            campaigns={data.campaigns} 
            onBack={handleBackFromDetail}
          />
        </div>
      );
    }
    
    // Use generic alert dashboard for other categories
    return (
      <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-hidden">
        <PresetTabs />
        <AlertDetailDashboard 
          alert={detailViewAlert} 
          campaigns={data.campaigns} 
          onBack={handleBackFromDetail}
        />
      </div>
    );
  }

  // Show Insight Detail Dashboard if viewing an AI insight (only when Dashboard view is active)
  if (activeView === 'dashboard' && detailViewInsight) {
    return (
      <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-hidden">
        <PresetTabs />
        <InsightDetailDashboard 
          insight={detailViewInsight} 
          campaigns={data.campaigns} 
          onBack={handleBackFromDetail}
        />
      </div>
    );
  }

  // Render Cosmos view if active
  if (activeView === 'cosmos') {
    return (
      <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
        <PresetTabs />
        {/* FilterBar removed; controls moved into header */}
        <div className="w-full h-screen overflow-hidden" style={{ paddingTop: '73px' }}>
          <CosmosView />
        </div>
        {/* Always show zoom controls in 3D views */}
        <ZoomControls />
      </div>
    );
  }

  // Galaxy view removed

  return (
    <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-x-hidden" style={{ width: '100vw', maxWidth: '100vw', paddingTop: '73px' }}>
      {/* Preset tabs navigation */}
      <PresetTabs />

      {/* Filter bar */}
      {/* FilterBar removed; controls moved into header */}

      {/* Top-left action bar hidden on Dashboard pages */}

      {/* Main canvas with all layers */}
      <div className="relative min-h-[calc(100vh-73px)] w-full" style={{ width: '100vw', maxWidth: '100vw' }}>
        {/* Blackish-silver glassmorphic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d12] via-[#0a0a0e] to-[#08080c]" />
        {/* Subtle silver/metallic sheen overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,_rgba(180,180,195,0.04)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_100%,_rgba(150,150,170,0.025)_0%,_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_80%,_rgba(140,140,160,0.02)_0%,_transparent_40%)]" />
        
        {/* CRITICAL: Only ONE layer should be mounted at any time based on zoom level */}
        
        {/* Layer 0: Portfolio Surface + Channels - ONLY when zoom 0-30% */}
        {zoomState.level >= 0 && zoomState.level <= 30 && <Layer0Portfolio key="layer-0" />}

        {/* KPI-Specific Views - ONLY in their specific ranges */}
        {zoomState.level >= 31 && zoomState.level <= 45 && <LayerROASAnalytics key="layer-roas" />}
        {zoomState.level >= 46 && zoomState.level <= 59 && <LayerBudgetHealth key="layer-budget" />}
        {zoomState.level >= 60 && zoomState.level <= 69 && <LayerCampaignStatus key="layer-status" />}

        {/* Layer 2: Tactical Campaign Grid */}
        <Layer2Campaigns />

        {/* Layer 3: Diagnostic Deep Dive */}
        <Layer3Diagnostic />

        {/* Layer 4: Granular Analytics */}
        <Layer4Granular />

        {/* Breadcrumb navigation - right aligned with help button */}
        {(() => {
          // Get focused channel and campaign names
          const focusedChannel = zoomState.focusedChannelId 
            ? data.channels.find(c => c.id === zoomState.focusedChannelId)
            : null;
          const focusedCampaign = zoomState.focusedCampaignId 
            ? data.campaigns.find(c => c.id === zoomState.focusedCampaignId)
            : null;
          const channelName = focusedChannel?.name || focusedCampaign?.channel || 'Channel';
          const campaignName = focusedCampaign?.name || 'Campaign';
          
          // Format channel name to title case
          const formatChannelName = (name: string) => {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          };
          
          // Get analytics type display name
          const getAnalyticsDisplayName = () => {
            switch (zoomState.selectedAnalyticsType) {
              case 'daily-spend': return 'Daily spend';
              case 'roas-trend': return 'ROAS trend';
              case 'conversions': return 'Conversions';
              case 'click-through-rate': return 'Click-through rate';
              default: return 'Granular analytics';
            }
          };
          
          // Only show breadcrumb for non-dashboard views (zoom level >= 31)
          if (zoomState.level < 31) return null;
          
          return (
            <div className="absolute top-[17px] right-6 z-40">
            <div className="bg-[#111114]/90 backdrop-blur-xl border border-white/[0.06] rounded-2xl px-6 py-3 shadow-xl shadow-black/30">
              <div className="flex items-center gap-2 text-sm">
                  
                  {/* Layer 1 views: ROAS, Budget, Campaign Status */}
                  {zoomState.level >= 31 && zoomState.level <= 45 && (
                    <>
                <button 
                  onClick={() => setZoomLevel(0)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                        Portfolio overview
                </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">Roas analytics</span>
                  </>
                )}
                {zoomState.level >= 46 && zoomState.level <= 59 && (
                  <>
                      <button 
                        onClick={() => setZoomLevel(0)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Portfolio overview
                      </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">Budget health</span>
                  </>
                )}
                {zoomState.level >= 60 && zoomState.level <= 69 && (
                  <>
                      <button 
                        onClick={() => setZoomLevel(0)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Portfolio overview
                      </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">Campaign status</span>
                  </>
                )}
                  
                  {/* Layer 2: Channel > Campaigns */}
                {zoomState.level >= 70 && zoomState.level <= 85 && (
                  <>
                    <button 
                      onClick={() => setZoomLevel(0)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                        Portfolio overview
                    </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">{formatChannelName(channelName)}</span>
                  </>
                )}
                  
                  {/* Layer 3: Channel > Campaign name */}
                {zoomState.level >= 86 && zoomState.level <= 95 && (
                  <>
                      <button 
                        onClick={() => setZoomLevel(0)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Portfolio overview
                      </button>
                    <span className="text-gray-600">/</span>
                    <button 
                      onClick={() => setZoomLevel(75)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                        {formatChannelName(channelName)}
                    </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">{campaignName}</span>
                  </>
                )}
                  
                  {/* Layer 4: Channel > Campaign > Analytics type */}
                {zoomState.level >= 96 && (
                  <>
                      <button 
                        onClick={() => setZoomLevel(0)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Portfolio overview
                      </button>
                    <span className="text-gray-600">/</span>
                    <button 
                      onClick={() => setZoomLevel(75)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                        {formatChannelName(channelName)}
                    </button>
                    <span className="text-gray-600">/</span>
                    <button 
                      onClick={() => setZoomLevel(90)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                        {campaignName}
                    </button>
                    <span className="text-gray-600">/</span>
                      <span className="text-white font-semibold">{getAnalyticsDisplayName()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          );
        })()}

        
      </div>

      {/* Layer indicator removed in Cosmos view */}

      {/* Historical View button removed */}

      {/* Zoom controls (Dashboard pages) - toggleable via Settings */}
      {showZoomInDashboard && <ZoomControls />}

      {/* Quick actions panel */}
      <QuickActionsPanel />

      {/* Filter Panel (Slides in from left) */}
      <CosmosFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Floating Controls - AI Navigator and Search (same as Cosmos view) */}
      <div className="fixed top-[97px] left-6 z-[100] flex flex-col gap-3" style={{ pointerEvents: 'auto' }}>
        {/* AI Navigator Button */}
        <div className="relative">
          <motion.button
            onClick={() => setIsCommandBarOpen(true)}
            onMouseEnter={() => setAiNavHovered(true)}
            onMouseLeave={() => setAiNavHovered(false)}
            className="relative overflow-hidden w-14 h-14 rounded-full border transition-all duration-300 ai-navigator-button border-white/[0.08] bg-[#111114]/90 hover:border-white/[0.15] backdrop-blur-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="shimmer-overlay absolute inset-0 rounded-full pointer-events-none" />
            <Sparkles className="w-5 h-5 mx-auto text-white/80" />
          </motion.button>
          {/* Tooltip */}
          <div 
            className={`absolute left-[72px] top-1/2 -translate-y-1/2 pointer-events-none z-[9999] transition-opacity duration-150 ${aiNavHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="bg-[#0c0c0e] text-white/80 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/[0.06] shadow-xl">
              AI Navigator
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="relative">
          <motion.button
            onClick={() => {
              if (isSearchOpen) {
                setSearchQuery('');
                setIsSearchOpen(false);
              } else {
                setIsSearchOpen(true);
              }
            }}
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            className={`relative overflow-hidden w-14 h-14 rounded-full border transition-all duration-300 ${
              isSearchOpen
                ? 'bg-white/[0.08] border-white/20 shadow-lg shadow-black/30'
                : 'bg-[#111114]/90 border-white/[0.06] hover:border-white/[0.12] hover:bg-[#161619]'
            } backdrop-blur-xl`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className={`w-5 h-5 mx-auto ${isSearchOpen ? 'text-white' : 'text-white/70'}`} />
          </motion.button>
          {/* Tooltip */}
          <div 
            className={`absolute left-[72px] top-1/2 -translate-y-1/2 pointer-events-none z-[9999] transition-opacity duration-150 ${searchHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="bg-[#0c0c0e] text-white/80 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/[0.06] shadow-xl">
              Search
            </div>
          </div>
        </div>

        {/* Search Input */}
        {isSearchOpen && (
          <div
            className="absolute"
            style={{ left: 72, top: 68, width: 320 }}
          >
            <div className="flex items-center bg-[#0c0c0e]/98 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 px-3 py-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="flex-1 bg-transparent outline-none text-white/90 placeholder:text-gray-500 px-2 py-2"
              />
              <button
                className="ml-2 px-2 py-1 text-gray-400 hover:text-white/80"
                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Navigator Command Bar */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        searchOpen={isSearchOpen}
      />
    </div>
  );
};

