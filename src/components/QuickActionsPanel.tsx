import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, TrendingUp, Clock, CheckCircle, Undo, Redo } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { Action } from '../types';
import { getAlertColor } from '../utils/helpers';

export const QuickActionsPanel: React.FC = () => {
  const { 
    quickActionsPanelOpen, 
    closeQuickActionsPanel, 
    selectedAlert,
    data,
    executeAction,
    undoAction,
    redoAction,
    actionHistory
  } = useDashboard();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [executing, setExecuting] = useState(false);

  const alert = data.portfolio.alerts
    .concat(data.campaigns.flatMap(c => c.alerts))
    .find(a => a.id === selectedAlert);

  if (!alert) return null;

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;
    
    setExecuting(true);
    try {
      await executeAction(selectedAction, alert.campaignId);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedAction(null);
        setExecuting(false);
        // Show success notification
      }, 500);
    } catch (error) {
      setExecuting(false);
      console.error('Action failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {quickActionsPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuickActionsPanel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-gray-900 border-l border-white/10 shadow-2xl z-50 overflow-auto"
          >
            {/* Header */}
            <div className={`sticky top-0 ${
              alert.severity === 'critical' ? 'bg-critical/20' :
              alert.severity === 'warning' ? 'bg-warning/20' :
              'bg-primary/20'
            } border-b border-white/10 p-6 backdrop-blur-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-6 h-6 ${getAlertColor(alert.severity)}`} />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getAlertColor(alert.severity)} bg-white/10`}>
                    {alert.severity}
                  </span>
                </div>
                <button
                  onClick={closeQuickActionsPanel}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Issue Detected
              </h2>
              <p className="text-gray-300">
                {alert.message}
              </p>
            </div>

            {/* Impact Metrics */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Impact Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Time Detected</p>
                  <p className="text-white font-semibold">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Affected Layer</p>
                  <p className="text-white font-semibold">
                    Layer {alert.layer}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white font-semibold mb-4">
                Suggested Actions
              </h3>
              <div className="space-y-3">
                {alert.suggestedActions.map((action) => (
                  <motion.button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-xl p-4 text-left transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-1 bg-success/20 text-success px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3 h-3" />
                        {action.confidence}%
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {action.expectedOutcome}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      Instant execution
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action History */}
            {actionHistory.length > 0 && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    Recent Actions
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={undoAction}
                      disabled={actionHistory.length === 0}
                      className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Undo"
                    >
                      <Undo className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={redoAction}
                      disabled={actionHistory.length === 0}
                      className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Redo"
                    >
                      <Redo className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {actionHistory.slice(-5).reverse().map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">
                          {item.action.title}
                        </span>
                        <span className={`text-xs ${
                          item.outcome === 'success' ? 'text-success' :
                          item.outcome === 'failed' ? 'text-critical' :
                          'text-warning'
                        }`}>
                          {item.outcome}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {item.timestamp.toLocaleString()} • {item.user}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirmation && selectedAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-[60] p-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !executing && setShowConfirmation(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  className="relative bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Confirm Action
                  </h3>
                  <p className="text-gray-300 mb-2">
                    Are you sure you want to execute this action?
                  </p>
                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <p className="text-white font-semibold mb-2">
                      {selectedAction.title}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedAction.expectedOutcome}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => !executing && setShowConfirmation(false)}
                      disabled={executing}
                      className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={executing}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                    >
                      {executing ? 'Executing...' : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

