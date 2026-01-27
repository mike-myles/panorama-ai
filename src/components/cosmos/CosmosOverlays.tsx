import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatNumber } from '../../utils/helpers';

export const CosmosOverlays: React.FC = () => {
  const { zoomState, data, setZoomLevel } = useDashboard();
  const currentLayer = Math.floor(zoomState.level / 20);
  
  return (
    <>
      {/* Layer 0: Portfolio KPI Cards */}
      <AnimatePresence>
        {currentLayer === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-8 flex gap-4 pointer-events-auto"
          >
            <KPICard
              title="Total ROAS"
              value={formatNumber(data.portfolio.totalROAS, 1)}
              trend={data.portfolio.roasTrend}
              icon={<TrendingUp className="w-6 h-6" />}
              onClick={() => setZoomLevel(30)}
            />
            <KPICard
              title="Budget Health"
              value={`${data.portfolio.budgetHealth}%`}
              icon={<DollarSign className="w-6 h-6" />}
              onClick={() => setZoomLevel(30)}
            />
            <KPICard
              title="Active Campaigns"
              value={data.portfolio.activeCampaigns.toString()}
              alerts={data.portfolio.alerts.length}
              icon={<Target className="w-6 h-6" />}
              onClick={() => setZoomLevel(30)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 1: Channel Selector */}
      <AnimatePresence>
        {currentLayer === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-1/4 left-8 w-64 pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Channels</h3>
              <div className="space-y-2">
                {data.channels.map(channel => (
                  <button
                    key={channel.id}
                    className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-white text-sm">{channel.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {channel.campaignCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 2: Campaign List */}
      <AnimatePresence>
        {currentLayer === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-8 left-8 w-64 max-h-96 overflow-y-auto pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Campaigns ({data.campaigns.length})</h3>
              <div className="space-y-2">
                {data.campaigns.slice(0, 10).map(campaign => (
                  <button
                    key={campaign.id}
                    className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="text-white text-sm font-medium mb-1 truncate">
                      {campaign.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{campaign.channel}</span>
                      <span className={
                        campaign.status === 'active' ? 'text-green-400' : 
                        campaign.status === 'at_risk' ? 'text-amber-400' : 
                        'text-red-400'
                      }>
                        {campaign.status === 'at_risk' ? 'At risk' : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instructions Overlay (Layer 0 only) */}
      {currentLayer === 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-white text-center text-sm">
              <span className="font-semibold">Click campaigns</span> to explore • <span className="font-semibold">Scroll</span> to zoom
            </p>
          </div>
        </div>
      )}
    </>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  trend?: number;
  alerts?: number;
  icon: React.ReactNode;
  onClick: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, alerts, icon, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 w-48 hover:border-primary/50 transition-all cursor-pointer"
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/20 rounded-lg text-primary">
          {icon}
        </div>
        {alerts !== undefined && alerts > 0 && (
          <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {alerts}
          </div>
        )}
      </div>
      
      <div className="text-left">
        <div className="text-gray-400 text-sm mb-1">{title}</div>
        <div className="text-white text-3xl font-bold mb-2">{value}</div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

