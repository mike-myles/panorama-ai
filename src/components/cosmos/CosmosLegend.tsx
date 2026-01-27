/* cspell:words bg ROAS */
import { useDashboard } from '../../context/DashboardContext';
import { FunnelStage, LifecycleStage } from '../../types';

// Campaign Health Status (planet colors)
const READINESS_STATUSES = [
  { id: 'on_track', label: 'On Track', color: '#8edd78', description: '80%+' },
  { id: 'needs_attention', label: 'Needs Attention', color: '#5290ec', description: '50-80%' },
  { id: 'at_risk', label: 'At Risk', color: '#ff0000', description: '0-50%' }
] as const;

// Lifecycle Stage (ring position - outer to inner)
const LIFECYCLE_STAGES: Array<{ stage: LifecycleStage; label: string; color: string }> = [
  { stage: 'closing', label: 'Closing', color: '#53b2ad' },
  { stage: 'active', label: 'Active', color: '#4146c3' },
  { stage: 'launching', label: 'Launching', color: '#e78a36' },
  { stage: 'qa_ready', label: 'QA & Ready', color: '#cd4a81' },
  { stage: 'development', label: 'Development', color: '#7f84f2' },
  { stage: 'planning', label: 'Planning', color: '#8edd78' },
  { stage: 'ideation', label: 'Ideation', color: '#3878eb' }
];

// Funnel Stage (orbital plane)
const FUNNEL_STAGES: Array<{ stage: FunnelStage; label: string; angle: string }> = [
  { stage: 'awareness', label: 'Awareness', angle: '0°' },
  { stage: 'consideration', label: 'Consideration', angle: '30°' },
  { stage: 'conversion', label: 'Conversion', angle: '60°' },
  { stage: 'retention', label: 'Retention', angle: '90°' }
];

interface CosmosLegendProps {
  // Readiness visibility (legacy support)
  visibleChannels: Record<string, boolean>;
  onToggleChannel: (id: string) => void;
  visibleStatuses: Record<'active' | 'at_risk' | 'paused', boolean>;
  onToggleStatus: (s: 'active' | 'at_risk' | 'paused') => void;
  alertsOnly: boolean;
  onToggleAlertsOnly: () => void;
  // Legacy tier visibility (mapped to new framework)
  visibleTiers: Record<'flat' | 'thirty' | 'ninety', boolean>;
  onToggleTier: (t: 'flat' | 'thirty' | 'ninety') => void;
  // NEW FRAMEWORK: Lifecycle stage visibility
  visibleLifecycleStages?: Record<LifecycleStage, boolean>;
  onToggleLifecycleStage?: (stage: LifecycleStage) => void;
  // NEW FRAMEWORK: Funnel stage visibility
  visibleFunnelStages?: Record<FunnelStage, boolean>;
  onToggleFunnelStage?: (stage: FunnelStage) => void;
  // NEW FRAMEWORK: Readiness status visibility
  visibleReadinessStatuses?: Record<'on_track' | 'needs_attention' | 'at_risk', boolean>;
  onToggleReadinessStatus?: (status: 'on_track' | 'needs_attention' | 'at_risk') => void;
  // NEW FRAMEWORK: Spend size visibility
  visibleSpendSizes?: Record<'high' | 'mid' | 'low', boolean>;
  onToggleSpendSize?: (size: 'high' | 'mid' | 'low') => void;
  // Legacy
  visibleBands?: Record<'under20' | '20to40' | '40to60' | '60to80' | 'over80', boolean>;
  onToggleBand?: (key: 'under20' | '20to40' | '40to60' | '60to80' | 'over80') => void;
  // Campaign names toggle
  showCampaignNames?: boolean;
  onToggleCampaignNames?: () => void;
}

// Reusable filter button with hover state
const FilterButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) => (
  <button
    className={`flex items-center gap-2 text-left transition-all duration-150 py-0.5 px-1.5 -mx-1.5 rounded hover:bg-white/[0.06] ${active ? '' : 'opacity-40'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export const CosmosLegend = ({
  visibleChannels: _visibleChannels,
  onToggleChannel: _onToggleChannel,
  visibleStatuses,
  onToggleStatus,
  alertsOnly,
  onToggleAlertsOnly,
  visibleTiers: _visibleTiers,
  onToggleTier: _onToggleTier,
  visibleLifecycleStages,
  onToggleLifecycleStage,
  visibleFunnelStages,
  onToggleFunnelStage,
  visibleReadinessStatuses,
  onToggleReadinessStatus,
  visibleSpendSizes,
  onToggleSpendSize,
  visibleBands,
  onToggleBand,
  showCampaignNames: _showCampaignNames,
  onToggleCampaignNames: _onToggleCampaignNames
}: CosmosLegendProps) => {
  const { data: _data } = useDashboard();
  const mode = (() => {
    try { return (typeof window !== 'undefined' && (window as any).catalyzeCosmosMode) || 'default'; } catch { return 'default'; }
  })();

  return (
    <div className="flex flex-col text-white w-[220px] pointer-events-auto select-none max-h-[85vh] overflow-y-auto gap-2">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PLANETS CONTAINER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl">
        <div className="px-4 pt-3.5 pb-3">
          <div className="text-[12px] font-semibold text-white/70 tracking-[0.15em] uppercase mb-3.5">
            PLANETS
          </div>
          
          {/* Campaign Health */}
          <div className="mb-4">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
              Color: Campaign Health
            </div>
            <div className="flex flex-col gap-0.5">
              {READINESS_STATUSES.map((status) => {
                const legacyKey = status.id === 'on_track' ? 'active' : status.id === 'needs_attention' ? 'at_risk' : 'paused';
                const active = visibleReadinessStatuses 
                  ? visibleReadinessStatuses[status.id as 'on_track' | 'needs_attention' | 'at_risk'] !== false
                  : visibleStatuses[legacyKey] !== false;
                return (
                  <FilterButton
                    key={status.id}
                    active={active}
                    onClick={() => {
                      if (onToggleReadinessStatus) {
                        onToggleReadinessStatus(status.id as 'on_track' | 'needs_attention' | 'at_risk');
                      } else {
                        onToggleStatus(legacyKey);
                      }
                    }}
                  >
                    <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                    <span className="text-sm text-gray-200">{status.label}</span>
                    <span className="text-xs text-gray-500 ml-auto">{status.description}</span>
                  </FilterButton>
                );
              })}
              {/* Alerts filter */}
              <FilterButton
                active={!alertsOnly}
                onClick={onToggleAlertsOnly}
              >
                <span className="inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }}>
                    <circle cx="12" cy="12" r="10" stroke="#e78a3f" strokeWidth="2.5" fill="none" />
                  </svg>
                </span>
                <span className="text-sm text-gray-200">Has Alerts</span>
              </FilterButton>
            </div>
          </div>

          {/* Planet Size */}
          <div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
              Size: Total Spend
            </div>
            <div className="flex flex-col gap-0.5">
              {/* High */}
              <FilterButton
                active={visibleSpendSizes?.high !== false}
                onClick={() => onToggleSpendSize?.('high')}
              >
                <span 
                  className="inline-block rounded-full w-4 h-4 relative flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), rgba(255,255,255,0.15) 60%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: 'inset 0 0 6px rgba(255,255,255,0.2), inset -1px -1px 3px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(2px)',
                  }}
                />
                <span className="text-sm text-gray-200">High</span>
                <span className="text-xs text-gray-500 ml-auto">70%+</span>
              </FilterButton>
              {/* Mid */}
              <FilterButton
                active={visibleSpendSizes?.mid !== false}
                onClick={() => onToggleSpendSize?.('mid')}
              >
                <span className="flex items-center justify-start w-4 h-4 flex-shrink-0">
                  <span 
                    className="inline-block rounded-full w-3 h-3 relative"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), rgba(255,255,255,0.12) 60%, rgba(255,255,255,0.03) 100%)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      boxShadow: 'inset 0 0 4px rgba(255,255,255,0.18), inset -0.5px -0.5px 2px rgba(0,0,0,0.08), 0 1.5px 6px rgba(0,0,0,0.12), 0 0 8px rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(2px)',
                    }}
                  />
                </span>
                <span className="text-sm text-gray-200">Mid</span>
                <span className="text-xs text-gray-500 ml-auto">30-70%</span>
              </FilterButton>
              {/* Low */}
              <FilterButton
                active={visibleSpendSizes?.low !== false}
                onClick={() => onToggleSpendSize?.('low')}
              >
                <span className="flex items-center justify-start w-4 h-4 flex-shrink-0">
                  <span 
                    className="inline-block rounded-full w-2 h-2 relative"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: 'inset 0 0 3px rgba(255,255,255,0.15), inset -0.5px -0.5px 1px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.1), 0 0 6px rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(2px)',
                    }}
                  />
                </span>
                <span className="text-sm text-gray-200">Low</span>
                <span className="text-xs text-gray-500 ml-auto">0-30%</span>
              </FilterButton>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ORBITS CONTAINER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl">
        <div className="px-4 pt-3.5 pb-3">
          <div className="text-[12px] font-semibold text-white/70 tracking-[0.15em] uppercase mb-3.5">
            ORBITS
          </div>

          {/* Funnel Stage */}
          <div className="mb-4">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
              Angle: Funnel Stage
            </div>
            <div className="flex flex-col gap-0.5">
              {FUNNEL_STAGES.map((item) => {
                const active = visibleFunnelStages 
                  ? visibleFunnelStages[item.stage] !== false 
                  : true;
                return (
                  <FilterButton
                    key={item.stage}
                    active={active}
                    onClick={() => onToggleFunnelStage && onToggleFunnelStage(item.stage)}
                  >
                    <span className="text-xs text-gray-500 w-5 flex-shrink-0">{item.angle}</span>
                    <span className="text-sm text-gray-200">{item.label}</span>
                  </FilterButton>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Stage */}
          {mode === 'launch_readiness' ? (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
                Orbits: Completion
              </div>
              <div className="flex flex-col gap-0.5">
                {([
                  { key: 'under20' as const, label: '<20%', color: '#ef4444' },
                  { key: '20to40' as const, label: '20-40%', color: '#f97316' },
                  { key: '40to60' as const, label: '40-60%', color: '#f59e0b' },
                  { key: '60to80' as const, label: '60-80%', color: '#10b981' },
                  { key: 'over80' as const, label: '>80%', color: '#3b82f6' }
                ]).map(({ key, label, color }) => {
                  const active = visibleBands ? (visibleBands[key] !== false) : true;
                  return (
                    <FilterButton
                      key={key}
                      active={active}
                      onClick={() => onToggleBand && onToggleBand(key)}
                    >
                      <span className="inline-block w-4 h-0.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm text-gray-200">{label}</span>
                    </FilterButton>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
                Color: Lifecycle Stage
              </div>
              <div className="flex flex-col gap-0.5">
                {LIFECYCLE_STAGES.map((item) => {
                  const active = visibleLifecycleStages 
                    ? visibleLifecycleStages[item.stage] !== false 
                    : true;
                  return (
                    <FilterButton
                      key={item.stage}
                      active={active}
                      onClick={() => onToggleLifecycleStage && onToggleLifecycleStage(item.stage)}
                    >
                      <span className="inline-block w-4 h-0.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-200">{item.label}</span>
                    </FilterButton>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CosmosLegend;
