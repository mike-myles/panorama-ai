import React, { useState } from 'react';
import { GitCompare, LayoutDashboard, Orbit, HelpCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { ViewMode } from '../types';
import { HelpModal } from './HelpModal';

const viewModes = [
  { id: 'cosmos' as ViewMode, label: 'Cosmos', icon: Orbit },
  { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard }
];

export const PresetTabs: React.FC = () => {
  const { toggleComparisonMode, comparisonMode, activeView, setActiveView, setZoomLevel, zoomState, closeDetailView, detailViewAlert, detailViewInsight } = useDashboard();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      {/* Fixed header banner with glassmorphic dark styling */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100vw',
          height: '73px',
          zIndex: 9999,
          // Solid dark base that matches dashboard components
          backgroundColor: 'rgba(10, 10, 12, 0.95)',
          // Glassmorphic blur effect
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          // Border
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          // Box shadow for depth
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Inner content wrapper */}
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LEFT: Adobe Logo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <img 
              src="/assets/adobe-logo.svg" 
              alt="Adobe" 
              style={{ 
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* CENTER: View Mode Tabs */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {viewModes.map(({ id, label, icon: Icon }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'dashboard') {
                      const hasFocus = !!zoomState.focusedCampaignId;
                      // If no campaign focus, ensure we show top-level Portfolio dashboard
                      if (!hasFocus && (detailViewAlert || detailViewInsight)) {
                        closeDetailView();
                      }
                      setZoomLevel(hasFocus ? 90 : 0);
                    } else if (id === 'cosmos') {
                      // Always clear any detail dashboard context when returning to Cosmos
                      closeDetailView();
                      // Preserve focusedCampaignId so selection persists in Cosmos
                      setZoomLevel(0);
                    }
                    setActiveView(id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: isActive 
                      ? '1px solid rgba(255, 255, 255, 0.25)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isActive 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive 
                      ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                    }
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px' }} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Compare and Help buttons */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={toggleComparisonMode}
              title="Compare"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: comparisonMode 
                  ? '1px solid rgba(255, 255, 255, 0.25)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: comparisonMode 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: comparisonMode ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: comparisonMode 
                  ? '0 4px 15px rgba(0, 0, 0, 0.3)' 
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!comparisonMode) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!comparisonMode) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              <GitCompare style={{ width: '20px', height: '20px' }} />
            </button>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              title="Help"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              <HelpCircle style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </>
  );
};
