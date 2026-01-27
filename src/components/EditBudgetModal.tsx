import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, AlertTriangle, Sparkles } from 'lucide-react';
import { Campaign } from '../types';
import { formatCurrency } from '../utils/helpers';
import { createPortal } from 'react-dom';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onBudgetUpdate?: (campaignId: string, newBudget: number) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({ isOpen, onClose, campaign, onBudgetUpdate }) => {
  // Calculate initial budget increase based on overspend
  const calculateInitialIncrease = () => {
    const budgetPercent = (campaign.spent / campaign.budget) * 100;
    if (budgetPercent > 100) {
      // If overspent, suggest an increase to cover the overspend
      return Math.min(Math.ceil(budgetPercent - 100), 50);
    }
    return 0;
  };

  const [budgetIncrease, setBudgetIncrease] = useState(calculateInitialIncrease());
  const currentBudget = campaign.budget;
  const newBudget = Math.round(currentBudget * (1 + budgetIncrease / 100));

  // Reset slider when modal opens
  useEffect(() => {
    if (isOpen) {
      setBudgetIncrease(calculateInitialIncrease());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleApply = () => {
    if (onBudgetUpdate) {
      onBudgetUpdate(campaign.id, newBudget);
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="edit-budget-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{campaign.name}</h2>
                    <p className="text-sm text-gray-400">Campaign at risk management</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Active Issues */}
              {campaign.alerts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <h3 className="text-sm font-semibold text-white">Active issues ({campaign.alerts.length})</h3>
                  </div>
                  <div className="bg-gradient-to-br from-warning/10 to-critical/10 border border-warning/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-warning uppercase mb-1">{campaign.alerts[0].severity}</p>
                        <p className="text-sm text-gray-300">{campaign.alerts[0].message}</p>
                      </div>
                    </div>
                    
                    {/* AI Insight */}
                    <div className="mt-4 pt-3 border-t border-warning/20">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-400 mb-1">AI recommendation</p>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            Based on current pacing and projected conversions, a <span className="text-white font-medium">10-15% budget increase</span> would optimize delivery through flight end while maintaining target ROAS. Consider reallocating from lower-performing ad groups to maximize efficiency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Adjust Budget */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">Adjust budget</h3>
                </div>

                {/* Budget Increase Label */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Budget increase</span>
                  <span className="text-lg font-bold text-primary">{budgetIncrease}%</span>
                </div>

                {/* Slider */}
                <div className="relative mb-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={budgetIncrease}
                    onChange={(e) => setBudgetIncrease(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${budgetIncrease * 2}%, rgb(55, 65, 81) ${budgetIncrease * 2}%, rgb(55, 65, 81) 100%)`
                    }}
                  />
                  <style>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                    .slider::-moz-range-thumb {
                      width: 16px;
                      height: 16px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                  `}</style>
                </div>

                {/* Slider Labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-6">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>

                {/* Current Budget Display */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">New budget</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(newBudget)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary/80 text-white font-semibold transition-colors"
              >
                Apply budget change
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};


