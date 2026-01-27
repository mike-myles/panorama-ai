import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface PopoverData {
  title: string;
  metrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down';
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

interface DataPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  data: PopoverData;
  position: { x: number; y: number };
}

export const DataPopover: React.FC<DataPopoverProps> = ({ isOpen, onClose, data, position }) => {
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
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'transparent' }}
          />

          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[70] bg-gray-800/95 backdrop-blur-xl border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              minWidth: '320px',
              maxWidth: '400px'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{data.title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-6 space-y-4">
              {data.metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-lg font-bold">{metric.value}</span>
                    {metric.change && (
                      <span className={`flex items-center gap-1 text-xs font-semibold ${
                        metric.trend === 'up' ? 'text-success' : 'text-error'
                      }`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {metric.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {data.actions && data.actions.length > 0 && (
              <div className="border-t border-white/10 p-4 space-y-2">
                {data.actions.map((action, index) => {
                  const Icon = action.icon || ArrowRight;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 rounded-xl text-white font-semibold transition-all group"
                    >
                      <span>{action.label}</span>
                      <Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

