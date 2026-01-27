import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface CosmosFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CosmosFilterPanel: React.FC<CosmosFilterPanelProps> = ({ isOpen, onClose }) => {
  const { filterState, updateFilters, clearFilters } = useDashboard();

  const channels = [
    { id: 'search', label: 'Paid search', color: '#3B82F6' },
    { id: 'social', label: 'Social media', color: '#A855F7' },
    { id: 'display', label: 'Display ads', color: '#F97316' },
    { id: 'email', label: 'Email marketing', color: '#10B981' },
    { id: 'video', label: 'Video ads', color: '#EC4899' }
  ];

  const handleChannelToggle = (channelId: string) => {
    const newChannels = filterState.channels.includes(channelId)
      ? filterState.channels.filter(c => c !== channelId)
      : [...filterState.channels, channelId];
    updateFilters({ channels: newChannels });
  };

  const handleStatusToggle = (status: string) => {
    updateFilters({ status: status as any });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Filter Panel - No backdrop, fully non-modal */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-24 top-[97px] bottom-6 w-[320px] bg-black/75 backdrop-blur-md border border-white/15 rounded-xl z-[60] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-white font-bold text-lg">Filters</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Date Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <label className="text-white font-semibold text-sm">Date Range</label>
                </div>
                <select
                  value="last30days"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Performance Tier */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <label className="text-white font-semibold text-sm">Performance Tier</label>
                </div>
                <select
                  value={filterState.performanceTier}
                  onChange={(e) => updateFilters({ performanceTier: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="all">All Performance</option>
                  <option value="top">Top Performers</option>
                  <option value="good">Good Performance</option>
                  <option value="average">Average Performance</option>
                  <option value="poor">Needs Attention</option>
                </select>
              </div>

              {/* Channels */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Channels</label>
                <div className="space-y-2">
                  {channels.map((channel) => (
                    <label
                      key={channel.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterState.channels.includes(channel.id)}
                        onChange={() => handleChannelToggle(channel.id)}
                        className="w-4 h-4 rounded border-white/20 bg-gray-800 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        <span className="text-white text-sm">{channel.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <label className="text-white font-semibold text-sm">Budget Range</label>
                  </div>
                  <span className="text-gray-400 text-xs">
                    ${filterState.budgetRange[0].toLocaleString()} - ${filterState.budgetRange[1].toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filterState.budgetRange[1]}
                    onChange={(e) => updateFilters({ budgetRange: [0, parseInt(e.target.value)] })}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500 text-xs">$0</span>
                    <span className="text-gray-500 text-xs">$50K</span>
                  </div>
                </div>
              </div>

              {/* ROAS Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <label className="text-white font-semibold text-sm">ROAS Range</label>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {filterState.roasRange[0].toFixed(1)}x - {filterState.roasRange[1].toFixed(1)}x
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filterState.roasRange[1]}
                    onChange={(e) => updateFilters({ roasRange: [0, parseFloat(e.target.value)] })}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500 text-xs">0x</span>
                    <span className="text-gray-500 text-xs">10.0x</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-white font-semibold text-sm mb-3 block">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'active', label: 'Active', color: '#10B981' },
                    { value: 'paused', label: 'Paused', color: '#6B7280' },
                    { value: 'at_risk', label: 'At risk', color: '#F59E0B' }
                  ].map((status) => (
                    <label
                      key={status.value}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterState.status === status.value || filterState.status === 'all'}
                        onChange={() => handleStatusToggle(status.value)}
                        className="w-4 h-4 rounded border-white/20 bg-gray-800 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-white text-sm">{status.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-white/10 text-white rounded-lg font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

