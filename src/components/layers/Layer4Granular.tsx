import React from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, Users, Download,
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, DollarSign,
  BarChart3, PieChart, Activity, Zap, Clock, CheckCircle2,
  XCircle, Info, Sparkles
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

export const Layer4Granular: React.FC = () => {
  const { data, zoomState } = useDashboard();
  const { campaigns } = data;

  const campaign = campaigns.find(c => c.id === zoomState.focusedCampaignId);
  const analyticsType = zoomState.selectedAnalyticsType || 'daily-spend';
  
  const isVisible = zoomState.level >= 96;
  
  const opacity = zoomState.level < 98 
    ? (zoomState.level - 96) / 2
    : 1;
  
  const blur = 0;

  if (!campaign) {
    return null;
  }

  // Calculate derived metrics
  const dailyData = campaign.dailyMetrics.slice(-14).map(metric => ({
    date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: metric.date,
    spend: metric.spend,
    revenue: metric.revenue,
    roas: metric.roas,
    conversions: metric.conversions,
    ctr: metric.ctr,
    clicks: metric.clicks,
    impressions: metric.impressions,
    cpc: metric.cpc
  }));

  const totalSpend = dailyData.reduce((sum, d) => sum + d.spend, 0);
  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalConversions = dailyData.reduce((sum, d) => sum + d.conversions, 0);
  const avgRoas = totalRevenue / totalSpend;
  const avgCtr = dailyData.reduce((sum, d) => sum + d.ctr, 0) / dailyData.length;

  // Calculate trends
  const firstWeekSpend = dailyData.slice(0, 7).reduce((sum, d) => sum + d.spend, 0);
  const secondWeekSpend = dailyData.slice(7).reduce((sum, d) => sum + d.spend, 0);
  const spendTrend = ((secondWeekSpend - firstWeekSpend) / firstWeekSpend) * 100;

  const firstWeekRoas = dailyData.slice(0, 7).reduce((sum, d) => sum + d.roas, 0) / 7;
  const secondWeekRoas = dailyData.slice(7).reduce((sum, d) => sum + d.roas, 0) / 7;
  const roasTrend = ((secondWeekRoas - firstWeekRoas) / firstWeekRoas) * 100;

  const firstWeekConv = dailyData.slice(0, 7).reduce((sum, d) => sum + d.conversions, 0);
  const secondWeekConv = dailyData.slice(7).reduce((sum, d) => sum + d.conversions, 0);
  const convTrend = ((secondWeekConv - firstWeekConv) / firstWeekConv) * 100;

  const firstWeekCtr = dailyData.slice(0, 7).reduce((sum, d) => sum + d.ctr, 0) / 7;
  const secondWeekCtr = dailyData.slice(7).reduce((sum, d) => sum + d.ctr, 0) / 7;
  const ctrTrend = ((secondWeekCtr - firstWeekCtr) / firstWeekCtr) * 100;

  // Mock hourly distribution data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    spend: Math.random() * 500 + 100,
    conversions: Math.floor(Math.random() * 20 + 5),
    ctr: Math.random() * 2 + 1
  }));

  // Mock device breakdown
  const deviceData = [
    { name: 'Mobile', value: 58, color: '#3B82F6' },
    { name: 'Desktop', value: 32, color: '#10B981' },
    { name: 'Tablet', value: 10, color: '#F59E0B' }
  ];

  // Mock audience segments for conversions
  const audienceData = [
    { segment: 'New visitors', conversions: 1240, rate: 2.8, revenue: 45000 },
    { segment: 'Returning users', conversions: 890, rate: 4.2, revenue: 38000 },
    { segment: 'Cart abandoners', conversions: 456, rate: 8.5, revenue: 22000 },
    { segment: 'Email subscribers', conversions: 320, rate: 5.1, revenue: 18000 },
    { segment: 'Social referrals', conversions: 210, rate: 1.9, revenue: 9500 }
  ];

  // Get analytics title for breadcrumb
  const getAnalyticsTitle = () => {
    switch (analyticsType) {
      case 'daily-spend': return 'Daily spend';
      case 'roas-trend': return 'ROAS trend';
      case 'conversions': return 'Conversions';
      case 'click-through-rate': return 'Click-through rate';
      default: return 'Analytics';
    }
  };

  // Render Daily Spend Analytics
  const renderDailySpendAnalytics = () => (
    <>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total spend (14d)</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpend)}</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${spendTrend > 0 ? 'text-warning' : 'text-success'}`}>
            {spendTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(spendTrend).toFixed(1)}% vs prev week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Avg. daily spend</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpend / 14)}</div>
          <div className="text-gray-500 text-sm mt-1">Budget pacing: On track</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Cost per conversion</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpend / totalConversions)}</div>
          <div className="text-success text-sm mt-1">12% below target</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 text-sm">Budget utilization</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber((campaign.spent / campaign.budget) * 100, 1)}%</div>
          <div className="text-gray-500 text-sm mt-1">{formatCurrency(campaign.budget - campaign.spent)} remaining</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Daily spend trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value), 'Spend']}
              />
              <Area type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Spend by device</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">AI spend insights</h3>
            <p className="text-gray-400 text-sm">Actionable recommendations based on your spending patterns</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Optimal spend timing</p>
                <p className="text-gray-400 text-sm">Your best performing hours are 10am-2pm. Consider increasing bids during this window by 15%.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Weekend efficiency drop</p>
                <p className="text-gray-400 text-sm">Weekend CPA is 23% higher. Reduce weekend budget by 20% to improve overall efficiency.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Device optimization</p>
                <p className="text-gray-400 text-sm">Mobile ROAS is 18% higher than desktop. Shift 10% of desktop budget to mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  // Render ROAS Analytics
  const renderRoasAnalytics = () => (
    <>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Average ROAS</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgRoas.toFixed(2)}x</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${roasTrend > 0 ? 'text-success' : 'text-critical'}`}>
            {roasTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(roasTrend).toFixed(1)}% vs prev week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
          <div className="text-gray-500 text-sm mt-1">From {formatCurrency(totalSpend)} spend</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Target ROAS</span>
          </div>
          <div className="text-2xl font-bold text-white">3.0x</div>
          <div className={`text-sm mt-1 ${avgRoas >= 3 ? 'text-success' : 'text-warning'}`}>
            {avgRoas >= 3 ? 'Above target' : `${((3 - avgRoas) / 3 * 100).toFixed(0)}% below target`}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 text-sm">Best day ROAS</span>
          </div>
          <div className="text-2xl font-bold text-white">{Math.max(...dailyData.map(d => d.roas)).toFixed(2)}x</div>
          <div className="text-gray-500 text-sm mt-1">Peak performance</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">ROAS trend with target</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="roas" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} name="ROAS" />
              <Line type="monotone" dataKey={() => 3} stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Revenue vs spend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Bar dataKey="spend" fill="#3B82F6" name="Spend" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">AI ROAS insights</h3>
            <p className="text-gray-400 text-sm">Maximize your return on ad spend with these recommendations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">High-value keywords</p>
                <p className="text-gray-400 text-sm">3 keywords have ROAS &gt; 5x. Increase bids by 25% to capture more volume.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Underperforming segments</p>
                <p className="text-gray-400 text-sm">Age 18-24 has ROAS of 1.2x. Consider excluding or reducing bids by 40%.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Scaling opportunity</p>
                <p className="text-gray-400 text-sm">Current ROAS allows for 30% budget increase while maintaining profitability.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  // Render Conversions Analytics
  const renderConversionsAnalytics = () => (
    <>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 text-sm">Total conversions</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalConversions.toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${convTrend > 0 ? 'text-success' : 'text-critical'}`}>
            {convTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(convTrend).toFixed(1)}% vs prev week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Conversion rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{((totalConversions / dailyData.reduce((sum, d) => sum + d.clicks, 0)) * 100).toFixed(2)}%</div>
          <div className="text-success text-sm mt-1">Industry avg: 2.35%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Cost per conversion</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalSpend / totalConversions)}</div>
          <div className="text-gray-500 text-sm mt-1">Target: $45.00</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Revenue per conv.</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue / totalConversions)}</div>
          <div className="text-success text-sm mt-1">+8% vs last month</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Daily conversions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#convGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Conversions by audience</h3>
          <div className="space-y-3">
            {audienceData.map((segment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">{segment.segment}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">{segment.conversions} conv.</span>
                  <span className="text-success">{segment.rate}% rate</span>
                  <span className="text-white font-semibold">{formatCurrency(segment.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-lg border border-amber-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">AI conversion insights</h3>
            <p className="text-gray-400 text-sm">Optimize your conversion funnel with these data-driven insights</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Cart abandoners gold mine</p>
                <p className="text-gray-400 text-sm">Retargeting cart abandoners has 8.5% conv rate. Increase retargeting budget by 50%.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Peak conversion hours</p>
                <p className="text-gray-400 text-sm">Conversions peak at 8pm-10pm. Schedule ad refreshes before this window.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Landing page opportunity</p>
                <p className="text-gray-400 text-sm">Mobile conversion rate is 40% lower than desktop. Optimize mobile landing page.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  // Render CTR Analytics
  const renderCtrAnalytics = () => (
    <>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Average CTR</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgCtr.toFixed(2)}%</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${ctrTrend > 0 ? 'text-success' : 'text-critical'}`}>
            {ctrTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(ctrTrend).toFixed(1)}% vs prev week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total clicks</span>
          </div>
          <div className="text-2xl font-bold text-white">{dailyData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}</div>
          <div className="text-gray-500 text-sm mt-1">From {dailyData.reduce((sum, d) => sum + d.impressions, 0).toLocaleString()} impr.</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Avg. CPC</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(dailyData.reduce((sum, d) => sum + d.cpc, 0) / dailyData.length)}</div>
          <div className="text-success text-sm mt-1">5% below benchmark</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 text-sm">Best day CTR</span>
          </div>
          <div className="text-2xl font-bold text-white">{Math.max(...dailyData.map(d => d.ctr)).toFixed(2)}%</div>
          <div className="text-gray-500 text-sm mt-1">Peak engagement</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">CTR trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'CTR']}
              />
              <Line type="monotone" dataKey="ctr" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#A855F7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Hourly CTR distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData.slice(6, 22)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'CTR']}
              />
              <Bar dataKey="ctr" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">AI engagement insights</h3>
            <p className="text-gray-400 text-sm">Improve your click-through rate with these recommendations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Creative refresh needed</p>
                <p className="text-gray-400 text-sm">Top creative has 45 days active. Refresh to combat ad fatigue and boost CTR by ~15%.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Ad copy testing</p>
                <p className="text-gray-400 text-sm">Headlines with questions have 23% higher CTR. Test question-based headlines.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Audience expansion</p>
                <p className="text-gray-400 text-sm">Similar audiences have 18% higher CTR. Expand targeting to include lookalikes.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

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
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getAnalyticsTitle()}
            </h1>
            <p className="text-gray-400">{campaign.name} • Granular analytics</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors">
            <Download className="w-5 h-5" />
            Export data
          </button>
        </motion.div>

        {/* Render appropriate analytics view */}
        {analyticsType === 'daily-spend' && renderDailySpendAnalytics()}
        {analyticsType === 'roas-trend' && renderRoasAnalytics()}
        {analyticsType === 'conversions' && renderConversionsAnalytics()}
        {analyticsType === 'click-through-rate' && renderCtrAnalytics()}
      </div>
    </motion.div>
  );
};
