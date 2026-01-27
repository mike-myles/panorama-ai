import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext';

export const ZoomControls = () => {
  const { zoomState, setZoomLevel } = useDashboard();

  const handleZoomIn = () => {
    setZoomLevel(Math.min(100, zoomState.level + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(0, zoomState.level - 10));
  };

  const handleReset = () => {
    // Broadcast to Cosmos view to perform full reset (camera, selection, zoom)
    window.dispatchEvent(new Event('cosmosResetView'));
  };

  // Base styling matching legend containers: bg-black/75 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl
  // Added hover affordance for interactive buttons
  const buttonClass = "group relative p-3 bg-black/75 hover:bg-black/85 rounded-xl transition-all duration-200 flex items-center justify-center backdrop-blur-md border border-white/15 hover:border-white/30 shadow-2xl";
  const disabledClass = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black/75 disabled:hover:border-white/15";

  return (
    <div 
      className="fixed bottom-8 left-6 z-50 flex flex-col gap-2"
    >
      <motion.button
        onClick={handleReset}
        className={buttonClass}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title="Reset view"
      >
        <RefreshCcw className="w-5 h-5 text-white/90" />
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/15 shadow-xl">
            Reset view
          </div>
        </div>
      </motion.button>

      <motion.button
        onClick={handleZoomIn}
        disabled={zoomState.level >= 100}
        className={`${buttonClass} ${disabledClass}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <ZoomIn className="w-5 h-5 text-white/90" />
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/15 shadow-xl">
            Zoom in
          </div>
        </div>
      </motion.button>
      
      {/* Zoom bar - same styling as legend containers */}
      <div className="relative h-32 w-12 rounded-xl overflow-hidden bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-500/50 transition-all duration-300"
          style={{ height: `${zoomState.level}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/90 text-xs font-semibold">{Math.round(zoomState.level)}%</span>
        </div>
        {[0, 1, 2, 3, 4].map(layer => (
          <div 
            key={layer}
            className="absolute left-0 right-0 h-px bg-white/10"
            style={{ bottom: `${layer * 20}%` }}
          />
        ))}
      </div>

      <motion.button
        onClick={handleZoomOut}
        disabled={zoomState.level <= 0}
        className={`${buttonClass} ${disabledClass}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <ZoomOut className="w-5 h-5 text-white/90" />
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/15 shadow-xl">
            Zoom out
          </div>
        </div>
      </motion.button>
      
    </div>
  );
};
