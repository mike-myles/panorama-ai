/* cspell:disable-file */
import React from 'react';

export const CampaignOrbitLegend: React.FC = () => {
  return (
    <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl p-4 text-white w-[220px] pointer-events-auto select-none shadow-2xl max-h-[60vh] overflow-y-auto">
      <div className="space-y-3">
        {/* Colors → Item Type */}
        <div>
          <div className="mb-2 uppercase tracking-wide text-gray-400" style={{ fontSize: '8pt' }}>Color: Item Type</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#34D399' }} />
              <span className="text-sm text-gray-200">Creative</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-sm text-gray-200">Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
              <span className="text-sm text-gray-200">Task</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#A78BFA' }} />
              <span className="text-sm text-gray-200">Document</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Orbits → Percent Complete (color coded to match rings) */}
        <div>
          <div className="mb-2 uppercase tracking-wide text-gray-400" style={{ fontSize: '8pt' }}>Orbits: Percent Complete</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#10B981' }} />
              <span className="text-sm text-gray-200">100%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#3B82F6' }} />
              <span className="text-sm text-gray-200">80–99%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="text-sm text-gray-200">60–79%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-sm text-gray-200">40–59%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#EC4899' }} />
              <span className="text-sm text-gray-200">20–39%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-sm text-gray-200">0–19%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignOrbitLegend;

