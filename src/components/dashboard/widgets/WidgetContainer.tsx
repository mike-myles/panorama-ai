/* cspell:disable */
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Maximize2 } from 'lucide-react';

interface WidgetContainerProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onDrillIn?: () => void;
  drillInLabel?: string;
  className?: string;
  accentColor?: string;
  badge?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  delay?: number;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  title,
  icon,
  children,
  onDrillIn,
  drillInLabel = 'View details',
  className = '',
  accentColor = '#a3a3a3', // Silver/gray accent for dark metallic theme
  badge,
  size = 'medium',
  delay = 0
}) => {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`relative group ${className}`}
    >
      <div 
        className={`
          relative backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300
          hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          ${sizeClasses[size]}
        `}
        style={{
          background: 'linear-gradient(145deg, rgba(22, 22, 28, 0.95) 0%, rgba(14, 14, 18, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Metallic top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Accent line at top */}
        <div 
          className="absolute top-0 left-0 w-1/3 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${accentColor}80, transparent)` }}
        />

        {/* Subtle inner glow from top */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ color: accentColor }} className="opacity-90 [&>svg]:w-5 [&>svg]:h-5">
                {icon}
              </div>
            </div>
            <h3 className="text-white/85 font-semibold text-base tracking-wide uppercase">
              {title}
            </h3>
            {badge}
          </div>
          {onDrillIn && (
            <motion.button
              onClick={onDrillIn}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-white/[0.08] border border-transparent hover:border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Maximize2 className="w-5 h-5 text-white/50" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Drill-in footer */}
        {onDrillIn && (
          <motion.button
            onClick={onDrillIn}
            className="mt-4 flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors group/btn relative z-10"
            whileHover={{ x: 4 }}
          >
            <span>{drillInLabel}</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        )}

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.02) 100%)'
          }}
        />
      </div>
    </motion.div>
  );
};
