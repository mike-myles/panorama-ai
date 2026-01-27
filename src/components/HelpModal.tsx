import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MousePointer, Layers, Filter, GitCompare, Zap, Keyboard } from 'lucide-react';

export const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl shadow-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-5 h-5" />
        <span>Help</span>
      </motion.button>

      <HelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-gray-900 backdrop-blur-xl border-2 border-primary/50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            style={{ 
              position: 'relative',
              zIndex: 10,
              margin: '2rem'
            }}
          >
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-primary/20 to-purple-600/20 border-b border-white/10 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Dashboard guide
                    </h2>
                    <p className="text-gray-300">
                      Master the Z-Axis Data Archaeology interface
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="px-8 py-6 space-y-8 overflow-y-auto flex-1">
                {/* Navigation Section */}
                <Section
                  icon={<Layers className="w-6 h-6 text-primary" />}
                  title="Layer navigation"
                  description="The dashboard uses a revolutionary 5-layer system to explore data at different depths"
                >
                  <LayerGuide
                    layer="Layer 0"
                    zoom="0-30%"
                    name="Portfolio & channels"
                    description="See KPI overview cards and all channel performance blocks. Click any KPI card to drill down to specific views."
                  />
                  <LayerGuide
                    layer="Layer 2"
                    zoom="40-70%"
                    name="Campaign grid"
                    description="View all campaign cards with metrics, alerts, and status. Click any card to dive into diagnostics."
                  />
                  <LayerGuide
                    layer="Layer 3"
                    zoom="60-90%"
                    name="Diagnostic deep dive"
                    description="Full campaign analysis with charts, trends, anomalies, and AI recommendations."
                  />
                  <LayerGuide
                    layer="Layer 4"
                    zoom="80-100%"
                    name="Granular analytics"
                    description="Detailed daily breakdown tables, creative performance, and exportable data."
                  />
                </Section>

                {/* Zoom Controls */}
                <Section
                  icon={<MousePointer className="w-6 h-6 text-success" />}
                  title="Zoom & navigation"
                  description="Multiple ways to move through layers"
                >
                  <ControlItem
                    control="Ctrl/Cmd + Scroll"
                    description="Zoom in/out smoothly through all layers"
                  />
                  <ControlItem
                    control="Click on Cards"
                    description="Automatically zoom to the relevant layer (Portfolio → Channels → Campaigns → Diagnostics)"
                  />
                  <ControlItem
                    control="Zoom widget"
                    description="Use the floating controls (bottom-right) to manually adjust zoom level"
                  />
                  <ControlItem
                    control="Breadcrumbs"
                    description="Click breadcrumb navigation (top-center) to quickly return to previous layers"
                  />
                </Section>

                {/* KPI-Specific Views */}
                <Section
                  icon={<Zap className="w-6 h-6 text-warning" />}
                  title="Smart KPI navigation"
                  description="Each KPI card leads to a different view"
                >
                  <ControlItem
                    control="Total ROAS"
                    description="Click to view Performance & Revenue Analytics (Layer 3)"
                  />
                  <ControlItem
                    control="Budget health"
                    description="Click to view Budget-focused Campaign View (Layer 2)"
                  />
                  <ControlItem
                    control="Active campaigns"
                    description="Click to view Campaign Management Grid (Layer 2)"
                  />
                </Section>

                {/* Filtering */}
                <Section
                  icon={<Filter className="w-6 h-6 text-purple-400" />}
                  title="Filtering & views"
                  description="Refine what you see"
                >
                  <ControlItem
                    control="Top preset tabs"
                    description="Jump to preconfigured views: Portfolio Health, Channel Performance, Campaign Monitor, Issue Dashboard, Optimization"
                  />
                  <ControlItem
                    control="Filter button"
                    description="Open advanced filters for channels, date ranges, performance tiers, status, ROAS, and budget"
                  />
                  <ControlItem
                    control="Active filter chips"
                    description="Click X on any chip to remove that filter, or 'Clear All' to reset"
                  />
                </Section>

                {/* Comparison Mode */}
                <Section
                  icon={<GitCompare className="w-6 h-6 text-critical" />}
                  title="Comparison mode"
                  description="Side-by-side analysis"
                >
                  <ControlItem
                    control="Enter compare"
                    description="Click 'Compare' button in filter bar to enter split-screen mode"
                  />
                  <ControlItem
                    control="Independent navigation"
                    description="Each pane has its own zoom level, layer focus, and date range selector"
                  />
                  <ControlItem
                    control="Sync toggle"
                    description="Lock/unlock to synchronize zoom levels between panes"
                  />
                  <ControlItem
                    control="Back button"
                    description="Navigate up one layer in each pane independently"
                  />
                  <ControlItem
                    control="Exit compare"
                    description="Click 'Exit Compare' to return to main dashboard"
                  />
                </Section>

                {/* Keyboard Shortcuts */}
                <Section
                  icon={<Keyboard className="w-6 h-6 text-blue-400" />}
                  title="Keyboard shortcuts"
                  description="Power user controls"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <ShortcutItem keys="Ctrl/Cmd + Scroll" action="Zoom in/out" />
                    <ShortcutItem keys="Esc" action="Close modals" />
                    <ShortcutItem keys="Click" action="Navigate deeper" />
                    <ShortcutItem keys="?" action="Open this help" />
                  </div>
                </Section>

                {/* Tips */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/30 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-3">💡 Pro tips</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Start at Layer 0 for the big picture, then drill down where you see issues</li>
                    <li>• Watch for pulsing alert badges - click them to open Quick Actions panel</li>
                    <li>• Use Comparison Mode to analyze different time periods or campaigns side-by-side</li>
                    <li>• Each channel has its own color - helps you quickly identify campaigns</li>
                    <li>• The blur effect creates depth - focused content is always sharp</li>
                    <li>• Export data from Layer 4 for external analysis</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 bg-gray-900/95 border-t border-white/10 px-8 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    Press <kbd className="px-2 py-1 bg-white/10 rounded text-white text-xs">?</kbd> anytime to reopen this guide
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Helper Components
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, description, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-white/10 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-xl">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
    <div className="ml-14 space-y-3">
      {children}
    </div>
  </div>
);

interface LayerGuideProps {
  layer: string;
  zoom: string;
  name: string;
  description: string;
}

const LayerGuide: React.FC<LayerGuideProps> = ({ layer, zoom, name, description }) => (
  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
    <div className="flex items-center gap-3 mb-2">
      <span className="px-3 py-1 bg-primary/20 text-primary font-bold rounded-lg text-sm">
        {layer}
      </span>
      <span className="text-gray-400 text-sm">{zoom}</span>
      <span className="text-white font-semibold">{name}</span>
    </div>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

interface ControlItemProps {
  control: string;
  description: string;
}

const ControlItem: React.FC<ControlItemProps> = ({ control, description }) => (
  <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
    <span className="font-mono text-primary text-sm font-semibold whitespace-nowrap">
      {control}
    </span>
    <span className="text-gray-400 text-sm">{description}</span>
  </div>
);

interface ShortcutItemProps {
  keys: string;
  action: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, action }) => (
  <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
    <kbd className="px-3 py-1 bg-white/10 text-white text-xs rounded font-mono">{keys}</kbd>
    <span className="text-gray-400 text-sm">{action}</span>
  </div>
);

