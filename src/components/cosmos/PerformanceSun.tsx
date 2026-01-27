import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cosmos3DLabel } from './Cosmos3DLabel';
/* cspell:words drei ROAS metalness bg */
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Portfolio } from '../../types';

// 3D Spherical radiating glow animation component for the sun
const RadiatingGlow: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => {
  const sphere1Ref = useRef<THREE.Mesh>(null);
  const sphere2Ref = useRef<THREE.Mesh>(null);
  const sphere3Ref = useRef<THREE.Mesh>(null);
  
  // Animate the spherical glow shells with pulsating effect
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Subtle pulsing spherical radiation (staggered phases for seamless effect)
    if (sphere1Ref.current) {
      const scale1 = 1.15 + Math.sin(time * 0.8) * 0.08;
      sphere1Ref.current.scale.setScalar(scale1);
      (sphere1Ref.current.material as THREE.MeshBasicMaterial).opacity = (0.25 + Math.sin(time * 0.8) * 0.1) * opacity;
    }
    if (sphere2Ref.current) {
      const scale2 = 1.25 + Math.sin(time * 0.8 + Math.PI * 0.66) * 0.1;
      sphere2Ref.current.scale.setScalar(scale2);
      (sphere2Ref.current.material as THREE.MeshBasicMaterial).opacity = (0.18 + Math.sin(time * 0.8 + Math.PI * 0.66) * 0.08) * opacity;
    }
    if (sphere3Ref.current) {
      const scale3 = 1.4 + Math.sin(time * 0.8 + Math.PI * 1.33) * 0.12;
      sphere3Ref.current.scale.setScalar(scale3);
      (sphere3Ref.current.material as THREE.MeshBasicMaterial).opacity = (0.12 + Math.sin(time * 0.8 + Math.PI * 1.33) * 0.06) * opacity;
    }
  });
  
  return (
    <group>
      {/* Inner spherical glow shell - 130% of previous (8.175 * 1.3 = 10.63) */}
      <mesh ref={sphere1Ref}>
        <sphereGeometry args={[10.63, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.25 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Middle spherical glow shell - 130% of previous (9.225 * 1.3 = 11.99) */}
      <mesh ref={sphere2Ref}>
        <sphereGeometry args={[11.99, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.18 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Outer spherical glow shell - 130% of previous (10.2 * 1.3 = 13.26) */}
      <mesh ref={sphere3Ref}>
        <sphereGeometry args={[13.26, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.12 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

interface PerformanceSunProps {
  portfolioData: Portfolio;
  visible: boolean;
  dimmed?: boolean;
  showLabel?: boolean;
  labelText?: string;
}

// NEW FRAMEWORK: Calculate composite portfolio health score from 4 metrics
const calculatePortfolioHealth = (portfolio: Portfolio): { score: number; color: string; label: string } => {
  // 1. Portfolio ROAS Score (target > 3.0 for green)
  const roasScore = Math.min(100, (portfolio.totalROAS / 4.0) * 100);
  
  // 2. Lifecycle Velocity Score (target > 80% on track)
  const velocityScore = portfolio.lifecycleVelocity || 80;
  
  // 3. Alert Coverage Ratio Score (target < 10% = 100 score, > 30% = 0 score)
  const alertRatio = portfolio.alertCoverageRatio || 0;
  const alertScore = Math.max(0, 100 - (alertRatio * 333)); // <10% = 100, 30% = 0
  
  // 4. Funnel Coverage Balance Score (target variance < 0.15)
  const funnelVariance = portfolio.funnelCoverageBalance || 0;
  const balanceScore = Math.max(0, 100 - (funnelVariance * 500)); // 0 = 100, 0.2 = 0
  
  // Weighted composite score
  const compositeScore = (
    roasScore * 0.35 +      // ROAS is most important
    velocityScore * 0.25 +  // Lifecycle velocity
    alertScore * 0.25 +     // Alert coverage
    balanceScore * 0.15     // Funnel balance
  );
  
  // Determine color and label based on composite score
  if (compositeScore >= 75) {
    return { score: compositeScore, color: '#22c55e', label: 'Thriving' }; // Green
  } else if (compositeScore >= 50) {
    return { score: compositeScore, color: '#eab308', label: 'Stable' }; // Yellow
  } else if (compositeScore >= 25) {
    return { score: compositeScore, color: '#f97316', label: 'Needs Attention' }; // Orange
  }
  return { score: compositeScore, color: '#ef4444', label: 'Critical' }; // Red
};

/* cspell:words FC */
export const PerformanceSun: React.FC<PerformanceSunProps> = ({ portfolioData, visible, dimmed = false, showLabel = false, labelText }) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const hoverTimerRef = React.useRef<number | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [tooltipAnimIn, setTooltipAnimIn] = React.useState(false);
  const htmlPortalRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    const tryFind = (attempt: number) => {
      if (cancelled) return;
      const el = document.getElementById('cosmos-html-layer');
      if (el) { htmlPortalRef.current = el as HTMLElement; return; }
      if (attempt < 40) setTimeout(() => tryFind(attempt + 1), 50);
    };
    tryFind(0);
    return () => { cancelled = true; };
  }, []);
  
  // NEW FRAMEWORK: Calculate portfolio health from 4 robust metrics
  const portfolioHealth = React.useMemo(() => calculatePortfolioHealth(portfolioData), [portfolioData]);
  const sunColor = portfolioHealth.color;
  
  // (computed health metrics removed - unused)
  
  // Calculate opacity based on dimmed state
  const sunOpacity = dimmed ? 0.1 : 1.0;
  
  if (!visible) return null;
  
  return (
    <group position={[0, 0, 0]}>
      {/* Main Sun Sphere - 130% of previous size (8.025 * 1.3 = 10.43 units) */}
      <mesh
        ref={sunRef}
        onPointerOver={() => {
          setHovered(true);
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = window.setTimeout(() => setShowTooltip(true), 400);
        }}
        onPointerOut={() => {
          setHovered(false);
          if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
          setShowTooltip(false);
          setTooltipAnimIn(false);
        }}
      >
        <sphereGeometry args={[10.43, 64, 64]} />
        <meshStandardMaterial 
          emissive={sunColor}
          emissiveIntensity={1.2 * sunOpacity}
          color={sunColor}
          roughness={0.2}
          metalness={0.3}
          opacity={sunOpacity}
          transparent={true}
        />
      </mesh>
      
      {/* Radiating glow animation - pulsing rings matching sun color */}
      <RadiatingGlow color={sunColor} opacity={sunOpacity} />
      
      {/* Inner Core - Bright center (130% of previous = 6.675 * 1.3 = 8.68) */}
      <mesh>
        <sphereGeometry args={[8.68, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.6 * sunOpacity}
        />
      </mesh>
      
      {/* 3D Title above the sun (portfolio or custom) - positioned 130% higher */}
      {showLabel && (
                <Cosmos3DLabel
          position={[0, 12.5, 0]}
        text={labelText || "Portfolio"}
          fontSize={0.4}
          outlineWidth={0.03}
          outlineColor="#000000"
          fillOpacity={sunOpacity}
        />
      )}

      {/* Central point light removed */}
      
      {/* Health label removed */}
      {showTooltip && (
        <Html
          position={[0, 12.5, 0]}
          transform={false}
          center={false}
          sprite
          portal={htmlPortalRef as any}
          zIndexRange={[100000, 0]}
          prepend
          style={{ pointerEvents: 'none', zIndex: 2147483647 }}
        >
          <div 
            className="w-[340px] bg-gray-900/95 backdrop-blur-xl border-2 border-white/30 rounded-xl p-5 shadow-2xl transition-all duration-200 ease-out will-change-transform"
            style={{ opacity: hovered ? 1 : 0, transform: tooltipAnimIn ? 'translate(12px, 12px) scale(1)' : 'translate(0px, 6px) scale(0.96)' }}
            ref={tooltipRef}
            onAnimationStart={() => setTooltipAnimIn(true)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: sunColor }} />
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1 leading-tight">Portfolio Health</h3>
                <p className="text-sm font-semibold" style={{ color: sunColor }}>{portfolioHealth.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{Math.round(portfolioHealth.score)}%</p>
              </div>
            </div>
            
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1 font-semibold">Portfolio ROAS</p>
                <p className="text-white text-lg font-bold">{portfolioData.totalROAS.toFixed(2)}x</p>
              </div>
              <div className="text-center bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1 font-semibold">Lifecycle Velocity</p>
                <p className="text-white text-lg font-bold">{portfolioData.lifecycleVelocity || 80}%</p>
              </div>
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1 font-semibold">Alert Ratio</p>
                <p className={`text-lg font-bold ${(portfolioData.alertCoverageRatio || 0) < 0.1 ? 'text-green-400' : (portfolioData.alertCoverageRatio || 0) < 0.2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {((portfolioData.alertCoverageRatio || 0) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-center bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs mb-1 font-semibold">Funnel Balance</p>
                <p className={`text-lg font-bold ${(portfolioData.funnelCoverageBalance || 0) < 0.1 ? 'text-green-400' : (portfolioData.funnelCoverageBalance || 0) < 0.15 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(portfolioData.funnelCoverageBalance || 0).toFixed(3)}
                </p>
              </div>
            </div>
            
            {/* Budget Summary */}
            <div className="border-t border-white/10 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">Total Budget</p>
                  <p className="text-white text-sm font-bold">${(portfolioData.totalBudget / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">Total Spend</p>
                  <p className="text-white text-sm font-bold">${(portfolioData.totalSpend / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

