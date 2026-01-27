import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, ChevronRight, DollarSign, Pause, BarChart3, CheckCircle2, X } from 'lucide-react';
import { EditBudgetModal } from '../EditBudgetModal';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import { AnalyticsType } from '../../types';
import { formatCurrency, formatNumber, getChannelColor } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AlertBadge, AlertBadgeGroup } from '../AlertBadge';

export const Layer3Diagnostic: React.FC = () => {
  const { data, zoomState, setZoomLevel, setSelectedAnalytics } = useDashboard();
  const { campaigns } = data;

  const campaign = campaigns.find(c => c.id === zoomState.focusedCampaignId);
  
  const isVisible = zoomState.level >= 86 && zoomState.level <= 95;
  
  // Calculate opacity - fade in from 86-90%, stay visible, fade out 95%+
  let opacity = 1;
  if (zoomState.level < 90) {
    opacity = (zoomState.level - 86) / 4;
  } else if (zoomState.level > 95) {
    opacity = Math.max(0, 1 - ((zoomState.level - 95) / 5));
  }

  // Only blur when moving away from this layer
  const blur = zoomState.level > 95 ? (zoomState.level - 95) / 5 * 6 : 
                zoomState.level < 88 ? (88 - zoomState.level) / 2 * 4 : 0;

  if (!campaign) {
    return null;
  }
  const [isEditBudgetOpen, setIsEditBudgetOpen] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [resolvedCampaignName, setResolvedCampaignName] = React.useState('');
	// lastModified can be a string at runtime; coerce and guard
	const lastMod = new Date((campaign as any).lastModified as any);
	const lastModText = isNaN(lastMod.getTime()) ? '—' : lastMod.toLocaleTimeString();
  
  const handleBudgetUpdate = (campaignId: string, newBudget: number) => {
    // This demo updates only the local object for display
    const target = campaigns.find(c => c.id === campaignId);
    if (target) {
      (target as any).budget = Math.round(newBudget);
      
      // Handle Q4 Holiday Search - Brand Terms campaign
      if (target.id === 'camp-largest-budget' || target.name === 'Q4 Holiday Search - Brand Terms') {
        // Change status from at_risk to active
        if ((target as any).status === 'at_risk') {
          (target as any).status = 'active';
        }
        // Remove all alerts
        (target as any).alerts = [];
        (target as any).alert = false;
        
        // Show success toast
        setResolvedCampaignName(target.name);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
      
      // If this is the Google Shopping v5 campaign, mark status active after budget edit
      if (target.name === 'Google Shopping - Best Sellers v5' && (target as any).status === 'at_risk') {
        (target as any).status = 'active';
      }
      // If this is the Google Shopping v5 campaign, remove the budget warning alert after edit
      if (target.name === 'Google Shopping - Best Sellers v5' && Array.isArray(target.alerts)) {
        (target as any).alerts = target.alerts.filter(a => a.id !== 'alert-forced-gs-v5');
        if ((target as any).alerts.length === 0) {
          (target as any).alert = false;
        }
        // Optional: if no alerts remain and status moved to active above, keep it active
      }
    }
  };

  const budgetPercent = (campaign.spent / campaign.budget) * 100;
  const channelColor = getChannelColor(campaign.channel);

  // Prepare chart data
  const dailyData = campaign.dailyMetrics.slice(-14).map(metric => ({
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spend: metric.spend,
    revenue: metric.revenue,
    roas: metric.roas,
    conversions: metric.conversions,
    ctr: metric.ctr
  }));

  const handleExpandChart = (analyticsType: AnalyticsType) => {
    setSelectedAnalytics(analyticsType);
    setZoomLevel(100);
  };

  return (
    <motion.div
      className="absolute inset-0 p-12 overflow-auto"
      style={{
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Campaign header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-6 shadow-xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: channelColor }}
                />
                <h1 className="text-3xl font-bold text-white">
                  {campaign.name}
                </h1>
              </div>
              <p className="text-gray-400 capitalize">
				{campaign.channel} • Updated {lastModText}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {campaign.alerts.length > 0 && (
                <AlertBadgeGroup alerts={campaign.alerts} />
              )}
              <div className="flex items-center gap-2 mr-2">
                <button onClick={() => setIsEditBudgetOpen(true)} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                  <DollarSign className="w-4 h-4" />
                  Edit Budget
                </button>
                <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                campaign.status === 'active' ? 'bg-success/20 text-success' :
                campaign.status === 'paused' ? 'bg-gray-500/20 text-gray-400' :
                'bg-warning/20 text-warning'
              }`}>
                {campaign.status === 'at_risk' 
                  ? 'At risk' 
                  : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
          </div>
          <EditBudgetModal
            isOpen={isEditBudgetOpen}
            onClose={() => setIsEditBudgetOpen(false)}
            campaign={campaign}
            onBudgetUpdate={handleBudgetUpdate}
          />
          
          {/* Success Toast - rendered via portal to body */}
          {createPortal(
            <AnimatePresence>
              {showSuccessToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="fixed z-[9999] bg-success/90 backdrop-blur-md border border-success/50 rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3"
                  style={{ 
                    bottom: '20px', 
                    left: '0',
                    right: '0',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    width: 'fit-content'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white font-semibold">Campaign issue resolved for '{resolvedCampaignName}'</span>
                  <button 
                    onClick={() => setShowSuccessToast(false)}
                    className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}

          {/* Budget progress */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 font-semibold">Budget Progress</span>
              <span className="text-white font-bold text-lg">
                {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                <span className="text-gray-400 text-sm ml-2">
                  ({formatNumber(budgetPercent, 0)}%)
                </span>
              </span>
            </div>
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  budgetPercent > 95 ? 'bg-gradient-to-r from-critical to-critical/80' :
                  budgetPercent > 80 ? 'bg-gradient-to-r from-warning to-warning/80' :
                  'bg-gradient-to-r from-success to-success/80'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Metrics charts - 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Spend chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleExpandChart('daily-spend')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Daily Spend</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ROAS chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleExpandChart('roas-trend')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">ROAS Trend</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line type="monotone" dataKey="roas" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Conversions chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleExpandChart('conversions')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Conversions</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Area type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#convGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* CTR chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleExpandChart('click-through-rate')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Click-Through Rate</h3>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line type="monotone" dataKey="ctr" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#A855F7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Anomalies and recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomalies */}
          {campaign.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <h3 className="text-white font-semibold text-lg">Detected Issues</h3>
              </div>
              <div className="space-y-3">
                {campaign.alerts.map(alert => (
                  <div key={alert.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <AlertBadge alert={alert} size={28} />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{alert.message}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-warning" />
              <h3 className="text-white font-semibold text-lg">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {campaign.alerts.flatMap(alert => alert.suggestedActions).slice(0, 3).map(action => (
                <div key={action.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <span className="text-success text-sm font-semibold">
                      {action.confidence}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {action.expectedOutcome}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

