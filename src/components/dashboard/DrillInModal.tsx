/* cspell:disable */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ExternalLink } from 'lucide-react';
import { Campaign, LifecycleStage, FunnelStage } from '../../types';

interface DrillInModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNavigateToCosmos?: () => void;
}

export const DrillInModal: React.FC<DrillInModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onNavigateToCosmos
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal - Dark Metallic Theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[85vh] z-[201]"
          >
            <div className="relative bg-[#0c0c0e]/98 backdrop-blur-xl border border-white/[0.06] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Top metallic sheen */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-xl font-semibold text-white/90">{title}</h2>
                  {subtitle && (
                    <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {onNavigateToCosmos && (
                    <motion.button
                      onClick={onNavigateToCosmos}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.06] transition-all text-sm"
                    >
                      <span>View in Cosmos</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-colors"
                  >
                    <X className="w-5 h-5 text-white/50" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Campaign List Component for drill-in views
interface CampaignListProps {
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
  showReadiness?: boolean;
  showRoas?: boolean;
  showBudget?: boolean;
  highlightAlerts?: boolean;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onCampaignClick,
  showReadiness = true,
  showRoas = true,
  showBudget = true,
  highlightAlerts = true
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getReadinessColor = (percent: number) => {
    if (percent >= 80) return 'text-green-400';
    if (percent >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      search: '#3B82F6',
      social: '#A855F7',
      display: '#F97316',
      email: '#10B981',
      video: '#EC4899'
    };
    return colors[channel] || '#6B7280';
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {campaigns.map((campaign, index) => (
        <motion.button
          key={campaign.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => onCampaignClick?.(campaign)}
          className="w-full text-left group"
        >
          <div className={`
            p-4 rounded-xl border transition-all
            ${highlightAlerts && campaign.alert 
              ? 'bg-red-500/[0.04] border-red-500/15 hover:border-red-500/30' 
              : 'bg-[#111114]/80 border-white/[0.04] hover:border-white/[0.1]'}
          `}>
            <div className="flex items-center gap-4">
              {/* Channel indicator */}
              <div 
                className="w-2 h-12 rounded-full flex-shrink-0 opacity-70"
                style={{ backgroundColor: getChannelColor(campaign.channel) }}
              />

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white/80 font-medium truncate group-hover:text-white/95 transition-colors">
                    {campaign.name}
                  </h4>
                  {campaign.alert && (
                    <span className="px-1.5 py-0.5 bg-red-500/15 text-red-400 text-[10px] rounded font-medium">
                      Alert
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="capitalize">{campaign.channel}</span>
                  <span>•</span>
                  <span className="capitalize">{campaign.lifecycleStage.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{campaign.funnelStage}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {showReadiness && (
                  <div className="text-right">
                    <span className={`text-lg font-semibold ${getReadinessColor(campaign.readinessPercent)}`}>
                      {campaign.readinessPercent}%
                    </span>
                    <p className="text-white/35 text-xs">Readiness</p>
                  </div>
                )}
                {showRoas && (
                  <div className="text-right">
                    <span className="text-white/85 text-lg font-semibold">{campaign.roas.toFixed(1)}</span>
                    <p className="text-white/35 text-xs">ROAS</p>
                  </div>
                )}
                {showBudget && (
                  <div className="text-right">
                    <span className="text-white/85 text-lg font-semibold">{formatCurrency(campaign.spent)}</span>
                    <p className="text-white/35 text-xs">of {formatCurrency(campaign.budget)}</p>
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

// Lifecycle Stage Filter Pills
interface LifecycleFilterProps {
  selected: LifecycleStage[];
  onChange: (stages: LifecycleStage[]) => void;
}

export const LifecycleFilter: React.FC<LifecycleFilterProps> = ({ selected, onChange }) => {
  const stages: { id: LifecycleStage; label: string; color: string }[] = [
    { id: 'ideation', label: 'Ideation', color: '#EC4899' },
    { id: 'planning', label: 'Planning', color: '#F472B6' },
    { id: 'development', label: 'Development', color: '#F97316' },
    { id: 'qa_ready', label: 'QA & Ready', color: '#A855F7' },
    { id: 'launching', label: 'Launching', color: '#3B82F6' },
    { id: 'active', label: 'Active', color: '#22C55E' },
    { id: 'closing', label: 'Closing', color: '#6B7280' }
  ];

  const toggleStage = (stage: LifecycleStage) => {
    if (selected.includes(stage)) {
      onChange(selected.filter(s => s !== stage));
    } else {
      onChange([...selected, stage]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {stages.map(stage => (
        <button
          key={stage.id}
          onClick={() => toggleStage(stage.id)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${selected.includes(stage.id) 
              ? 'bg-white/20 text-white' 
              : 'bg-white/5 text-white/50 hover:bg-white/10'}
          `}
          style={selected.includes(stage.id) ? { backgroundColor: `${stage.color}30` } : {}}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
};

// Funnel Stage Filter Pills
interface FunnelFilterProps {
  selected: FunnelStage[];
  onChange: (stages: FunnelStage[]) => void;
}

export const FunnelFilter: React.FC<FunnelFilterProps> = ({ selected, onChange }) => {
  const stages: { id: FunnelStage; label: string; color: string }[] = [
    { id: 'awareness', label: 'Awareness', color: '#3B82F6' },
    { id: 'consideration', label: 'Consideration', color: '#8B5CF6' },
    { id: 'conversion', label: 'Conversion', color: '#22C55E' },
    { id: 'retention', label: 'Retention', color: '#F97316' }
  ];

  const toggleStage = (stage: FunnelStage) => {
    if (selected.includes(stage)) {
      onChange(selected.filter(s => s !== stage));
    } else {
      onChange([...selected, stage]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {stages.map(stage => (
        <button
          key={stage.id}
          onClick={() => toggleStage(stage.id)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${selected.includes(stage.id) 
              ? 'bg-white/20 text-white' 
              : 'bg-white/5 text-white/50 hover:bg-white/10'}
          `}
          style={selected.includes(stage.id) ? { backgroundColor: `${stage.color}30` } : {}}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
};
