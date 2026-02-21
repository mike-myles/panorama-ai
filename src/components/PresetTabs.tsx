import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, Sparkles, Database } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
export const PresetTabs: React.FC = () => {
  const { updateFilters, clearFilters, data, dataSource, setDataSource } = useDashboard();
  const [headerPrompt, setHeaderPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [databasePickerOpen, setDatabasePickerOpen] = useState(false);
  const databasePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (databasePickerRef.current && !databasePickerRef.current.contains(e.target as Node)) {
        setDatabasePickerOpen(false);
      }
    };
    if (databasePickerOpen) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [databasePickerOpen]);

  const submitHeaderPrompt = async () => {
    const prompt = headerPrompt.trim();
    if (!prompt || submitting) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const resp = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      let json: { intent?: unknown; error?: string; detail?: string } = {};
      try {
        json = await resp.json();
      } catch {
        setApiError(resp.ok ? 'Invalid response' : `Server error ${resp.status}`);
        return;
      }

      if (!resp.ok) {
        let msg = json?.error || resp.statusText || 'Request failed';
        if (json?.detail) {
          try {
            const parsed = typeof json.detail === 'string' ? JSON.parse(json.detail) : json.detail;
            if (parsed?.error?.message) msg = parsed.error.message;
          } catch {
            if (typeof json.detail === 'string' && json.detail.length < 120) msg = json.detail;
          }
        }
        setApiError(msg);
        return;
      }

      type Intent = { reset?: boolean; filters?: { channels?: string[]; status?: string; roasRange?: number[]; reset?: boolean } };
      const intent: Intent = (json?.intent || {}) as Intent;
      const wantsReset =
        intent?.reset === true ||
        intent?.filters?.reset === true ||
        /(?:^|\s)(reset|show all|show all campaigns|clear filters)(?:\s|$)/i.test(prompt);

      // Default Cosmos payload: show all
      const allStatuses = { active: true, at_risk: true, paused: true };
      const allReadiness = { on_track: true, needs_attention: true, at_risk: true };
      const allTiers = { flat: true, thirty: true, sixty: true, ninety: true };
      const allLifecycle = { ideation: true, planning: true, development: true, qa_ready: true, launching: true, active: true, closing: true };
      const allFunnel = { awareness: true, consideration: true, conversion: true, retention: true };
      const allSpend = { high: true, mid: true, low: true };

      if (wantsReset) {
        try { clearFilters(); } catch {}
        window.dispatchEvent(new CustomEvent('cosmos:applyLegendFilters', {
          detail: {
            visibleChannels: {},
            visibleStatuses: allStatuses,
            visibleReadinessStatuses: allReadiness,
            alertsOnly: false,
            launchOnly: false,
            visibleTiers: allTiers,
            visibleLifecycleStages: allLifecycle,
            visibleFunnelStages: allFunnel,
            visibleSpendSizes: allSpend
          }
        }));
        setHeaderPrompt('');
        return;
      }

      // Apply intent to context (dashboard layers)
      if (intent.filters) {
        const f: any = {};
        if (Array.isArray(intent.filters.channels)) f.channels = intent.filters.channels;
        if (typeof intent.filters.status === 'string') f.status = intent.filters.status;
        if (Array.isArray(intent.filters.roasRange)) f.roasRange = intent.filters.roasRange;
        if (Object.keys(f).length > 0) updateFilters(f);
      }

      // Build Cosmos visibility from intent so the 3D view redraws
      let visibleStatuses = allStatuses;
      let visibleReadinessStatuses = allReadiness;
      let visibleChannels: Record<string, boolean> = {};
      if (intent.filters) {
        const status = intent.filters.status;
        if (status === 'active') {
          visibleStatuses = { active: true, at_risk: false, paused: false };
          visibleReadinessStatuses = { on_track: true, needs_attention: false, at_risk: false };
        } else if (status === 'at_risk') {
          visibleStatuses = { active: false, at_risk: true, paused: false };
          visibleReadinessStatuses = { on_track: false, needs_attention: false, at_risk: true };
        } else if (status === 'paused') {
          visibleStatuses = { active: false, at_risk: false, paused: true };
          visibleReadinessStatuses = allReadiness;
        }
        if (Array.isArray(intent.filters.channels) && intent.filters.channels.length > 0) {
          const allowed = new Set(intent.filters.channels as string[]);
          data.channels.forEach((c: { id: string }) => { visibleChannels[c.id] = allowed.has(c.id); });
        }
      }
      window.dispatchEvent(new CustomEvent('cosmos:applyLegendFilters', {
        detail: {
          visibleChannels: Object.keys(visibleChannels).length ? visibleChannels : {},
          visibleStatuses,
          visibleReadinessStatuses,
          alertsOnly: false,
          launchOnly: false,
          visibleTiers: allTiers,
          visibleLifecycleStages: allLifecycle,
          visibleFunnelStages: allFunnel,
          visibleSpendSizes: allSpend
        }
      }));
    } catch (e) {
      setApiError((e as Error)?.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const viewRefresh = () => {
    try { clearFilters(); } catch {}
    window.dispatchEvent(new CustomEvent('cosmosResetView'));
    const allStatuses = { active: true, at_risk: true, paused: true };
    const allReadiness = { on_track: true, needs_attention: true, at_risk: true };
    const allTiers = { flat: true, thirty: true, sixty: true, ninety: true };
    const allLifecycle = { ideation: true, planning: true, development: true, qa_ready: true, launching: true, active: true, closing: true };
    const allFunnel = { awareness: true, consideration: true, conversion: true, retention: true };
    const allSpend = { high: true, mid: true, low: true };
    window.dispatchEvent(new CustomEvent('cosmos:applyLegendFilters', {
      detail: {
        visibleChannels: {},
        visibleStatuses: allStatuses,
        visibleReadinessStatuses: allReadiness,
        alertsOnly: false,
        launchOnly: false,
        visibleTiers: allTiers,
        visibleLifecycleStages: allLifecycle,
        visibleFunnelStages: allFunnel,
        visibleSpendSizes: allSpend
      }
    }));
  };

  const handleHeaderSearchChange = (value: string) => {
    setHeaderSearchQuery(value);
    window.dispatchEvent(new CustomEvent('cosmos:setSearchQuery', { detail: { query: value } }));
  };

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
        {/* Inner content wrapper: logo left, prompt center, Search + View refresh right */}
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {/* LEFT: Title */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
              Panorama
            </span>
          </div>

          {/* CENTER: AI prompt + Apply + error — takes remaining space */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              value={headerPrompt}
              onChange={(e) => setHeaderPrompt(e.target.value)}
              placeholder="Ask AI to filter (e.g., show at-risk campaigns)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitHeaderPrompt();
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={submitHeaderPrompt}
              disabled={submitting}
              title={submitting ? 'Thinking…' : 'Apply'}
              className={`relative overflow-hidden rounded-full border-2 border-white/20 transition-all duration-300 flex items-center justify-center ai-navigator-button ${submitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-px'}`}
              style={{
                width: 40,
                height: 40,
                color: '#fff',
              }}
            >
              <div className="shimmer-overlay absolute inset-0 rounded-full pointer-events-none" />
              <Sparkles className="w-5 h-5 relative z-10" />
            </button>
            {apiError && (
              <span style={{ fontSize: 11, color: 'rgba(255,140,120,0.95)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apiError}>
                {apiError.includes('quota') || apiError.includes('billing') ? 'Quota exceeded — check your plan and billing.' : apiError}
              </span>
            )}
          </div>

          {/* RIGHT: Search + View refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                title="Search campaigns"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: searchOpen ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: searchOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: searchOpen ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!searchOpen) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!searchOpen) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                <Search style={{ width: '20px', height: '20px' }} />
              </button>
              {searchOpen && (
                <input
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => handleHeaderSearchChange(e.target.value)}
                  placeholder="Search campaigns..."
                  autoFocus
                  style={{
                    width: 180,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: 13
                  }}
                />
              )}
            </div>
            <div ref={databasePickerRef} style={{ position: 'relative' }}>
              <button
                type="button"
                title="Data source"
                onClick={() => setDatabasePickerOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: databasePickerOpen ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: databasePickerOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: databasePickerOpen ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!databasePickerOpen) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!databasePickerOpen) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                <Database style={{ width: '20px', height: '20px' }} />
              </button>
              {databasePickerOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    minWidth: 160,
                    padding: '6px 0',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(18,18,20,0.98)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 10000,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setDataSource('mock'); setDatabasePickerOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      border: 'none',
                      background: dataSource === 'mock' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Mock data
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDataSource('gmo'); setDatabasePickerOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      border: 'none',
                      background: dataSource === 'gmo' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    GMO Campaigns
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={viewRefresh}
              title="Reset view"
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
              <RefreshCw style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
