import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, Calendar, User, Target } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface CosmosLaunchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchOpen?: boolean;
}

export const CosmosLaunchPanel: React.FC<CosmosLaunchPanelProps> = ({ isOpen, onClose, searchOpen = false }) => {
  const { data, setFocusedCampaign } = useDashboard();
  
  // Get campaigns launching within the next 90 days
  const today = new Date();
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  const launchReadyCampaigns = data.campaigns
    .filter(c => {
      const targetDate = (c as any).targetLaunchDate;
      if (!targetDate || (c as any).launchDate) return false; // Skip if no target or already launched
      const target = new Date(targetDate);
      return target >= today && target <= in90Days;
    })
    .sort((a, b) => {
      const aDate = new Date((a as any).targetLaunchDate);
      const bDate = new Date((b as any).targetLaunchDate);
      return aDate.getTime() - bDate.getTime(); // Sort by nearest launch first
    });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilLaunch = (targetDate: Date) => {
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Enhanced urgency styling with glassmorphic treatment
  const getUrgencyStyles = (days: number) => {
    if (days <= 2) {
      // Critical - pulsing red
      return {
        className: 'text-red-300 animate-pulse',
        style: {
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
        }
      };
    }
    if (days <= 7) {
      // Warning - red
      return {
        className: 'text-red-300',
        style: {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)',
        }
      };
    }
    if (days <= 30) {
      // Caution - orange
      return {
        className: 'text-orange-300',
        style: {
          background: 'rgba(251, 146, 60, 0.15)',
          border: '1px solid rgba(251, 146, 60, 0.4)',
          boxShadow: '0 0 6px rgba(251, 146, 60, 0.2)',
        }
      };
    }
    // Normal - blue/teal
    return {
      className: 'text-blue-300',
      style: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: 'none',
      }
    };
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1, top: searchOpen ? 242 : 97 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-24 bottom-6 w-[340px] rounded-2xl z-[60] overflow-hidden flex flex-col"
          style={{ 
            top: searchOpen ? 242 : 97,
            // Glassmorphism panel styling
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(18, 18, 20, 0.92) 8%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {/* Header with subtle gradient background */}
          <div 
            className="flex items-center justify-between p-5 pb-4"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-9 h-9 min-w-[36px] rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(147, 51, 234, 0.15)',
                  border: '1px solid rgba(147, 51, 234, 0.35)',
                  boxShadow: '0 0 12px rgba(147, 51, 234, 0.2)',
                }}
              >
                <Rocket className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-semibold text-sm tracking-wide">Launches for next 90 days</h2>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {launchReadyCampaigns.length} campaign{launchReadyCampaigns.length !== 1 ? 's' : ''} targeted for launch
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg transition-all duration-200 flex-shrink-0 ml-2 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {launchReadyCampaigns.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-8">No campaigns launching in the next 90 days</div>
            )}

            {launchReadyCampaigns.map((c) => {
              const targetDate = (c as any).targetLaunchDate;
              const daysUntil = getDaysUntilLaunch(targetDate);
              const percentComplete = (c as any).percentComplete || 0;
              const owner = (c as any).owner || (c as any).createdBy || 'Unassigned';
              const urgencyStyles = getUrgencyStyles(daysUntil);

              return (
                <motion.div
                  key={c.id}
                  className="rounded-xl p-4 cursor-pointer transition-all duration-200 focus-visible:outline-none"
                  style={{
                    background: 'rgba(30, 30, 35, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: `
                      0 2px 8px rgba(0, 0, 0, 0.25),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05)
                    `,
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: `
                      0 8px 24px rgba(0, 0, 0, 0.35),
                      0 0 0 1px rgba(96, 165, 250, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.08)
                    `,
                    background: 'rgba(40, 40, 48, 0.7)',
                    borderColor: 'rgba(96, 165, 250, 0.4)',
                  }}
                  whileTap={{ y: 0 }}
                  onClick={() => {
                    setFocusedCampaign(c.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFocusedCampaign(c.id);
                      onClose();
                    }
                  }}
                >
                  {/* Campaign Name & Channel */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-white font-semibold text-sm truncate leading-tight">{c.name}</div>
                      <div className="text-[11px] text-gray-500 capitalize mt-0.5">{c.channel}</div>
                    </div>
                    <div 
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${urgencyStyles.className}`}
                      style={urgencyStyles.style}
                    >
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1 day' : `${daysUntil} days`}
                    </div>
                  </div>

                  {/* Launch Details */}
                  <div className="space-y-2">
                    {/* Target Date */}
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-gray-500">Target:</span>
                      <span className="text-gray-200 font-medium">{formatDate(targetDate)}</span>
                    </div>

                    {/* Owner */}
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-gray-500">Owner:</span>
                      <span className="text-gray-200 font-medium">{owner}</span>
                    </div>

                    {/* Readiness Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-gray-500">Readiness</span>
                        </div>
                        <span className="text-[11px] text-white font-semibold">{percentComplete}%</span>
                      </div>
                      <div 
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <motion.div 
                          className={`h-full rounded-full ${getProgressColor(percentComplete)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentComplete}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            boxShadow: percentComplete >= 80 
                              ? '0 0 8px rgba(16, 185, 129, 0.5)' 
                              : percentComplete >= 50 
                                ? '0 0 8px rgba(234, 179, 8, 0.4)'
                                : '0 0 8px rgba(249, 115, 22, 0.4)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

