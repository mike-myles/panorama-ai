/* cspell:disable */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Check } from 'lucide-react';
import { WidgetContainer } from './WidgetContainer';
import { Campaign } from '../../../types';

interface BudgetPacingWidgetProps {
  campaigns: Campaign[];
  onDrillIn?: () => void;
}

export const BudgetPacingWidget: React.FC<BudgetPacingWidgetProps> = ({
  campaigns,
  onDrillIn
}) => {
  const budgetData = useMemo(() => {
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;

    // Calculate pacing (are we ahead or behind?)
    // Assuming we're at day X of the month, calculate expected spend
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const expectedSpendPercent = (dayOfMonth / daysInMonth) * 100;
    const pacingDiff = percentSpent - expectedSpendPercent;

    // Group by quarter based on target launch date
    const quarterlyData = campaigns.reduce((acc, c) => {
      const date = new Date(c.targetLaunchDate);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      if (!acc[quarter]) {
        acc[quarter] = { budget: 0, spent: 0 };
      }
      acc[quarter].budget += c.budget;
      acc[quarter].spent += c.spent;
      return acc;
    }, {} as Record<string, { budget: number; spent: number }>);

    // Budget health segments
    const segments = campaigns.reduce((acc, c) => {
      const utilization = (c.spent / c.budget) * 100;
      if (utilization > 95) acc.overBudget++;
      else if (utilization > 80) acc.nearLimit++;
      else if (utilization < 50) acc.underUtilized++;
      else acc.onTrack++;
      return acc;
    }, { overBudget: 0, nearLimit: 0, onTrack: 0, underUtilized: 0 });

    return {
      totalBudget,
      totalSpent,
      percentSpent,
      remaining,
      expectedSpendPercent,
      pacingDiff,
      quarterlyData,
      segments,
      isPacingBehind: pacingDiff < -10,
      isPacingAhead: pacingDiff > 10
    };
  }, [campaigns]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <WidgetContainer
      title="Budget Pacing"
      icon={<DollarSign className="w-4 h-4" />}
      accentColor="#22C55E"
      onDrillIn={onDrillIn}
      drillInLabel="View budget calendar"
      badge={
        budgetData.isPacingAhead ? (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Ahead
          </span>
        ) : budgetData.isPacingBehind ? (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Behind
          </span>
        ) : null
      }
    >
      {/* Main budget display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-white">{formatCurrency(budgetData.totalBudget)}</span>
          <span className="text-white/40 text-base">total budget</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-base">{formatCurrency(budgetData.totalSpent)} spent</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70 text-base">{budgetData.percentSpent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-5">
        <div className="h-5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetData.percentSpent, 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${
              budgetData.percentSpent > 95 ? 'bg-red-500' :
              budgetData.percentSpent > 80 ? 'bg-amber-500' : 'bg-green-500'
            }`}
          />
        </div>
        {/* Expected spend marker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-0 bottom-0 flex items-center"
          style={{ left: `${budgetData.expectedSpendPercent}%` }}
        >
          <div className="w-0.5 h-7 bg-white/50 -mt-1" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap">
            Expected
          </div>
        </motion.div>
      </div>

      {/* Quarterly breakdown */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {quarters.map((quarter, index) => {
          const data = budgetData.quarterlyData[quarter] || { budget: 0, spent: 0 };
          const percent = data.budget > 0 ? (data.spent / data.budget) * 100 : 0;
          const isPastQuarter = index < Math.ceil((new Date().getMonth() + 1) / 3) - 1;
          
          return (
            <motion.div
              key={quarter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="text-center"
            >
              <div className="text-white/50 text-sm mb-1">{quarter}</div>
              <div className="h-14 bg-white/5 rounded-lg flex items-end justify-center overflow-hidden relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(percent, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  className={`w-full absolute bottom-0 ${
                    percent > 95 ? 'bg-red-500/60' :
                    percent > 80 ? 'bg-amber-500/60' : 'bg-green-500/60'
                  }`}
                />
                <span className="relative z-10 text-white/70 text-sm pb-1 font-medium">
                  {percent > 0 ? `${percent.toFixed(0)}%` : '-'}
                </span>
              </div>
              {isPastQuarter && percent > 0 && (
                <div className="mt-1">
                  {percent > 90 ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Budget health segments */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-white/50 text-sm">{budgetData.segments.overBudget} over budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-white/50 text-sm">{budgetData.segments.nearLimit} near limit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-white/50 text-sm">{budgetData.segments.onTrack} on track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-white/50 text-sm">{budgetData.segments.underUtilized} under-used</span>
        </div>
      </div>
    </WidgetContainer>
  );
};
