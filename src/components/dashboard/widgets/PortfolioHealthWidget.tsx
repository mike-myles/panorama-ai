/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, DollarSign, Rocket, Target, Bell } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign, Portfolio } from '../../../types';

interface PortfolioHealthWidgetProps {
  campaigns: Campaign[];
  portfolio?: Portfolio;
  onDrillIn?: () => void;
}

export const PortfolioHealthWidget: React.FC<PortfolioHealthWidgetProps> = ({
  campaigns,
  onDrillIn
}) => {
  const healthData = useMemo(() => {
    // ROAS Performance (0-100)
    const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;
    const roasScore = Math.min(100, Math.round((avgRoas / 5) * 100)); // 5.0 ROAS = 100 score

    // Budget Health (0-100)
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetScore = budgetUtilization >= 60 && budgetUtilization <= 90 ? 100 :
                        budgetUtilization >= 50 && budgetUtilization <= 95 ? 85 :
                        budgetUtilization >= 40 ? 70 : 50;

    // Launch Readiness (0-100)
    const avgReadiness = campaigns.reduce((sum, c) => sum + c.readinessPercent, 0) / campaigns.length;
    const launchScore = Math.round(avgReadiness);

    // Funnel Balance (0-100)
    const funnelCounts = { awareness: 0, consideration: 0, conversion: 0, retention: 0 };
    campaigns.forEach(c => funnelCounts[c.funnelStage]++);
    const funnelValues = Object.values(funnelCounts);
    const funnelMean = campaigns.length / 4;
    const funnelVariance = funnelValues.reduce((sum, v) => sum + Math.pow(v - funnelMean, 2), 0) / 4;
    const funnelScore = Math.max(0, Math.round(100 - (funnelVariance / campaigns.length) * 10));

    // Alert Coverage (0-100) - fewer alerts is better
    const alertCount = campaigns.filter(c => c.alert).length;
    const alertRatio = alertCount / campaigns.length;
    const alertScore = Math.round((1 - alertRatio) * 100);

    // Overall score (weighted average)
    const overallScore = Math.round(
      roasScore * 0.25 +
      budgetScore * 0.25 +
      launchScore * 0.20 +
      funnelScore * 0.15 +
      alertScore * 0.15
    );

    return {
      overall: overallScore,
      metrics: [
        { label: 'ROAS Performance', score: roasScore, icon: TrendingUp, color: '#22C55E' },
        { label: 'Budget Health', score: budgetScore, icon: DollarSign, color: '#3B82F6' },
        { label: 'Launch Readiness', score: launchScore, icon: Rocket, color: '#F97316' },
        { label: 'Funnel Balance', score: funnelScore, icon: Target, color: '#8B5CF6' },
        { label: 'Alert Coverage', score: alertScore, icon: Bell, color: '#EAB308' }
      ]
    };
  }, [campaigns]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#EAB308';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  // Calculate the circle progress
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthData.overall / 100) * circumference;

  return (
    <WidgetContainer
      title="Portfolio Health"
      icon={<Star className="w-4 h-4" />}
      accentColor={getScoreColor(healthData.overall)}
      onDrillIn={onDrillIn}
      drillInLabel="View breakdown"
      size="large"
    >
      <div className="flex gap-6">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background circle */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={getScoreColor(healthData.overall)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              transform="rotate(-90 75 75)"
            />
            {/* Inner glow */}
            <circle
              cx="75"
              cy="75"
              r="46"
              fill="none"
              stroke={getScoreColor(healthData.overall)}
              strokeWidth="1"
              opacity="0.2"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white/90"
            >
              {healthData.overall}
            </motion.span>
            <span className="text-white/30 text-sm">/ 100</span>
            <span 
              className="text-sm font-medium mt-1"
              style={{ color: getScoreColor(healthData.overall) }}
            >
              {getScoreLabel(healthData.overall)}
            </span>
          </div>
        </div>

        {/* Metrics breakdown */}
        <div className="flex-1 space-y-3">
          {healthData.metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-white/[0.03] border border-white/[0.04]"
                >
                  <Icon className="w-4 h-4 opacity-70" style={{ color: metric.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/50 text-sm truncate">{metric.label}</span>
                    <span className={`text-sm font-semibold ${
                      metric.score >= 80 ? 'text-green-400' :
                      metric.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {metric.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetContainer>
  );
};
