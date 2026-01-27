import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, BarChart2 } from 'lucide-react';
import type { Campaign } from '../../types';

interface InsightDetailDashboardProps {
  insight: any; // Using any to avoid cross-project type dependency
  campaigns: Campaign[];
  onBack: () => void;
}

export const InsightDetailDashboard: React.FC<InsightDetailDashboardProps> = ({
  insight,
  campaigns,
  onBack
}) => {
  if (!insight) return null;
  
  const affectedCampaigns = useMemo(() => {
    const ids: string[] = Array.isArray(insight?.affectedCampaignIds) ? insight.affectedCampaignIds : [];
    return campaigns.filter(c => ids.includes(c.id));
  }, [insight, campaigns]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen text-white relative"
      style={{ paddingTop: '73px' }}
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0e] via-[#08080c] to-[#0c0c10]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_100%_at_50%_-20%,_rgba(120,120,140,0.06)_0%,_transparent_50%)]" />
      </div>

      <div className="relative p-6 max-w-[1600px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button 
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/95 mb-1">
                {insight?.title || 'Insight'}
              </h1>
              {insight?.description && (
                <p className="text-white/60 text-base">
                  {insight.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-white/40 text-sm">
                  {affectedCampaigns.length} campaigns affected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-white/50" />
            Key Metrics (derived)
          </h2>
          <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-6" />
          
          <div className="grid grid-cols-4 gap-4">
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Campaigns</div>
              <div className="text-3xl font-bold text-white/95">{affectedCampaigns.length}</div>
              <div className="text-[11px] text-white/40 mt-1">affected</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Total Spend</div>
              <div className="text-3xl font-bold text-white/95">
                ${Math.round(affectedCampaigns.reduce((s, c) => s + c.spent, 0) / 1000)}K
              </div>
              <div className="text-[11px] text-white/40 mt-1">across selected campaigns</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Avg ROAS</div>
              <div className="text-3xl font-bold text-white/95">
                {affectedCampaigns.length > 0 ? (affectedCampaigns.reduce((s, c) => s + c.roas, 0) / affectedCampaigns.length).toFixed(1) : '0.0'}x
              </div>
              <div className="text-[11px] text-white/40 mt-1">portfolio-weighted</div>
            </div>
            <div className="p-5 bg-[#0c0c0e]/60 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Conversions</div>
              <div className="text-3xl font-bold text-white/95">
                {affectedCampaigns.reduce((s, c) => s + (c.conversions || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-white/40 mt-1">total</div>
            </div>
          </div>
        </section>

        {/* Affected Campaigns List */}
        <section>
          <h2 className="text-lg font-semibold text-white/90 mb-4">Affected Campaigns</h2>
          <div className="h-px bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent mb-6" />
          <div className="grid grid-cols-2 gap-3">
            {affectedCampaigns.map(c => (
              <div key={c.id} className="p-4 bg-[#0c0c0e]/60 border border-white/10 rounded-xl">
                <div className="text-sm font-semibold text-white/90">{c.name}</div>
                <div className="text-xs text-white/50 capitalize">{c.channel} • {c.lifecycleStage}</div>
                <div className="mt-2 text-xs text-white/60">
                  Spend: ${Math.round(c.spent / 1000)}K • ROAS: {c.roas.toFixed(1)}x
                </div>
              </div>
            ))}
            {affectedCampaigns.length === 0 && (
              <div className="text-sm text-white/50">No campaigns associated with this insight.</div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default InsightDetailDashboard;

