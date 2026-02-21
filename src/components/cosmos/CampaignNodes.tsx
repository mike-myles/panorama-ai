/* cspell:words drei ROAS metalness bg Conv FC MOFU BOFU clearcoat Idx Matcap matcap */
// @ts-nocheck
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Cosmos3DLabel } from './Cosmos3DLabel';
import * as THREE from 'three';
import { Campaign, FunnelStage, LifecycleStage } from '../../types';
import config from '../../data/config.json';
import { useDashboard } from '../../context/DashboardContext';

// NEW FRAMEWORK: Funnel Stage → Orbital Plane Angle
// Plane 1 (0°): AWARENESS (TOFU) - Top of funnel, flat plane
// Plane 2 (30°): CONSIDERATION (MOFU) - Middle of funnel
// Plane 3 (60°): CONVERSION (BOFU) - Bottom of funnel
// Plane 4 (90°): RETENTION (Post-funnel) - In-market customers, perpendicular
const FUNNEL_TILT_MAP: Record<FunnelStage, number> = {
  'awareness': 0,                     // 0° - TOFU (flat plane)
  'consideration': (30 * Math.PI) / 180, // 30° - MOFU
  'conversion': (60 * Math.PI) / 180,    // 60° - BOFU
  'retention': (90 * Math.PI) / 180      // 90° - Post-funnel (perpendicular)
};

// NEW FRAMEWORK: Lifecycle Stage → Ring Radius (Distance from Sun)
// Innermost = closest to market (closing/ended), Outermost = concept phase (ideation)
// Radii pushed out by 3 units to accommodate 130% larger sun (11.7 vs 9)
// Ring 7 (Outermost): IDEATION - Concept phase
// Ring 6: PLANNING - Strategy & approval
// Ring 5: DEVELOPMENT - Build & creative
// Ring 4: QA & READY - Testing & final prep
// Ring 3: LAUNCHING - First 0-14 days live
// Ring 2: ACTIVE - Ongoing 15+ days
// Ring 1 (Innermost): CLOSING - Wind-down/ended
const LIFECYCLE_RADIUS_MAP: Record<LifecycleStage, number> = {
  'closing': 62,      // Ring 1 - Innermost
  'active': 80,       // Ring 2
  'launching': 98,    // Ring 3
  'qa_ready': 116,    // Ring 4
  'development': 134, // Ring 5
  'planning': 152,    // Ring 6
  'ideation': 170     // Ring 7 - Outermost
};

// NEW FRAMEWORK: Readiness Percent → Planet Color
// Red: <50% ready (At Risk)
// Orange/Yellow: 50-80% ready (Needs Attention)
// Green: >80% ready (On Track)
const getReadinessColor = (readinessPercent: number): string => {
  if (readinessPercent >= 80) return '#8edd78'; // On Track
  if (readinessPercent >= 50) return '#5290ec'; // Needs Attention
  return '#ff0000'; // At Risk
};

// Get readiness status label (marketing-ops friendly names)
const getReadinessLabel = (readinessPercent: number): string => {
  if (readinessPercent >= 80) return 'On Track';
  if (readinessPercent >= 50) return 'Needs Attention';
  return 'At Risk';
};

interface CampaignNodesProps {
  campaigns: Campaign[];
  zoomLevel: number;
  hoveredCampaignId: string | null;
  setHoveredCampaignId: (id: string | null) => void;
  showCampaignNames: boolean;
  onCampaignClick?: (campaign: Campaign, position: THREE.Vector3) => void;
  isDetailPanelOpen?: boolean;
  selectedCampaignId?: string | null;
  alertsViewActive?: boolean;
  filterQuery?: string;
  visibleChannels?: Record<string, boolean>;
  visibleStatuses?: Record<'active' | 'at_risk' | 'paused', boolean>;
  alertsOnly?: boolean;
  launchOnly?: boolean;
  visibleTiers?: Record<'flat' | 'thirty' | 'ninety', boolean>;
  // NEW FRAMEWORK: visibility controls
  visibleLifecycleStages?: Record<LifecycleStage, boolean>;
  visibleFunnelStages?: Record<FunnelStage, boolean>;
  visibleReadinessStatuses?: Record<'on_track' | 'needs_attention' | 'at_risk', boolean>;
  visibleSpendSizes?: Record<'high' | 'mid' | 'low', boolean>;
  layoutMode?: 'default' | 'launch_readiness' | 'gmo';
  // Alert filter: when set, only show campaigns in this list (and dim others)
  alertFilterCampaignIds?: string[] | null;
}

export interface GMOLayoutParams {
  minEndTime: number;
  maxEndTime: number;
  minDurationDays: number;
  maxDurationDays: number;
}

interface CampaignWithAngle extends Campaign {
  calculatedAngle?: number;
}

interface CampaignNodeProps {
  campaign: Campaign;
  zoomLevel: number;
  index: number;
  isAnyHovered: boolean;
  isThisHovered: boolean;
  onHover: (id: string | null) => void;
  showCampaignNames: boolean;
  onCampaignClick?: (campaign: Campaign, position: THREE.Vector3) => void;
  isDetailPanelOpen?: boolean;
  isSelected?: boolean;
  hasSelection?: boolean;
  alertFilterActive?: boolean;
  alertsViewActive?: boolean;
  layoutMode?: 'default' | 'launch_readiness' | 'gmo';
  gmoLayoutParams?: GMOLayoutParams;
}

// Assign campaign to orbital ring based on CHANNEL (each orbit = one channel)
const getRadiusFromChannel = (campaign: Campaign): number => {
  // Map each marketing channel to a specific orbit
  // This creates a clear visual grouping by channel
  
  const channelRadii: Record<string, number> = {
    'search': 40,      // Innermost orbit - Paid search
    'social': 52,      // Second orbit - Social media
    'display': 64,     // Third orbit - Display ads
    'email': 76,       // Fourth orbit - Email marketing
    'video': 88        // Outermost orbit - Video ads
  };
  
  return channelRadii[campaign.channel] || 39; // Default to middle orbit if channel not found
};

// Generate random angle with collision avoidance
const generateRandomAngleForCampaign = (
  campaignId: string, 
  _allCampaigns: Campaign[], 
  _currentCampaign: Campaign
): number => {
  // Generate base random angle from campaign ID
  const seed = campaignId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use multiple hash functions for better distribution
  const angle1 = (seed % 1000) / 1000;
  const angle2 = ((seed * 7) % 1000) / 1000;
  const angle3 = ((seed * 13) % 1000) / 1000;
  const angle4 = ((seed * 23) % 1000) / 1000;
  
  // Combine for truly random but consistent angle
  const randomValue = (angle1 + angle2 + angle3 + angle4) / 4;
  
  // Convert to angle in radians (0 to 2π)
  return randomValue * Math.PI * 2;
};

const GMO_ORBIT_RADII = [62, 80, 98, 116, 134, 152]; // 6 orbits, innermost = soonest end date

const CampaignNode: React.FC<CampaignNodeProps> = React.memo(({ 
  campaign, 
  zoomLevel, 
  index: _index,
  isAnyHovered,
  isThisHovered,
  onHover,
  showCampaignNames,
  onCampaignClick,
  isDetailPanelOpen,
  isSelected,
  hasSelection,
  alertFilterActive,
  alertsViewActive,
  layoutMode = 'default',
  gmoLayoutParams
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const pointerDownRef = React.useRef<{ x: number; y: number } | null>(null);
  const { setFocusedCampaign, setZoomLevel } = useDashboard();
  
  // NEW FRAMEWORK: Orbital position based on LIFECYCLE STAGE
  // Each ring represents a lifecycle stage (ideation=outermost, closing=innermost)
  const radius = React.useMemo(() => {
    if (layoutMode === 'gmo') {
      const orbitIndex = Math.min(5, Math.max(0, (campaign as any).__gmoOrbitIndex ?? 0));
      return GMO_ORBIT_RADII[orbitIndex];
    }
    if (layoutMode === 'launch_readiness') {
      const pc = Math.max(0, Math.min(100, (campaign as any).percentComplete ?? 0));
      // Snap to discrete orbit bands used by OrbitalRingSystem:
      // under20 (20), 20-40 (40), 40-60 (60), 60-80 (80), over80 (90)
      const minR = 28; // closest to sun
      const maxR = 92; // farthest from sun
      const rFor = (p: number) => maxR - (p / 100) * (maxR - minR);
      if (pc < 20) return rFor(20);
      if (pc < 40) return rFor(40);
      if (pc < 60) return rFor(60);
      if (pc < 80) return rFor(80);
      return rFor(90);
    }
    // Use lifecycle stage to determine ring position
    const lifecycleStage = (campaign as any).lifecycleStage as LifecycleStage;
    return LIFECYCLE_RADIUS_MAP[lifecycleStage] || LIFECYCLE_RADIUS_MAP['development'];
  }, [campaign, layoutMode]);

  // NEW FRAMEWORK: Tilt based on FUNNEL STAGE
  // 90° = Awareness (TOFU), 60° = Consideration (MOFU), 30° = Conversion (BOFU), 0° = Retention
  // GMO: flat plane (0 tilt)
  const tiltRadians = React.useMemo(() => {
    if (layoutMode === 'gmo') return 0;
    if (layoutMode === 'launch_readiness') {
      const tld = (campaign as any).targetLaunchDate ? new Date((campaign as any).targetLaunchDate) : null;
      if (tld && !isNaN(tld.getTime())) {
        const now = new Date();
        const diffDays = Math.floor((tld.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays < 30) return 0;                    // first 30 days
        if (diffDays < 60) return (30 * Math.PI) / 180; // second 30 days (align to 30°)
        return (90 * Math.PI) / 180;                    // last 30 days (up to 90°)
      }
      return 0;
    }
    // Use funnel stage to determine orbital plane angle
    const funnelStage = (campaign as any).funnelStage as FunnelStage;
    return FUNNEL_TILT_MAP[funnelStage] || 0;
  }, [campaign, layoutMode]);
  
  // Use pre-calculated random angle with collision avoidance
  // If not available (edge case), generate one
  const baseAngle = React.useMemo(() => {
    const typedCampaign = campaign as CampaignWithAngle;
    if (typedCampaign.calculatedAngle !== undefined) {
      return typedCampaign.calculatedAngle;
    }
    
    // Fallback: generate random angle
    return generateRandomAngleForCampaign(campaign.id, [], campaign);
  }, [campaign]);
  
  // Static position - NO ANIMATION
  // Calculate fixed position once and set it
  React.useEffect(() => {
    if (groupRef.current) {
      const x = Math.cos(baseAngle) * radius;
      const zBase = Math.sin(baseAngle) * radius;
      const y = -zBase * Math.sin(tiltRadians);
      const z = zBase * Math.cos(tiltRadians);
      groupRef.current.position.x = x;
      groupRef.current.position.y = y;
      groupRef.current.position.z = z;
    }
  }, [baseAngle, radius, tiltRadians]);
  
  // Node size - scaled by spend with more dramatic differences
  // Small spend: 1.0 (same as before), Medium: ~2.5, High: 5.0 (much larger)
  const { data: dashboardData } = useDashboard();
  const spendRange = React.useMemo(() => {
    try {
      const spends = (dashboardData?.campaigns || []).map(c => Math.max(0, Number(c.spent) || 0));
      const min = spends.length ? Math.min(...spends) : 0;
      const max = spends.length ? Math.max(...spends) : 1;
      return { min, max };
    } catch {
      return { min: 0, max: 1 };
    }
  }, [dashboardData?.campaigns]);
  const nodeSize = React.useMemo(() => {
    if (layoutMode === 'gmo' && gmoLayoutParams) {
      const startDate = (campaign as any).startDate ? new Date((campaign as any).startDate) : null;
      const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
      if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const durationDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
        const { minDurationDays, maxDurationDays } = gmoLayoutParams;
        const span = maxDurationDays - minDurationDays;
        const t = span > 0 ? (durationDays - minDurationDays) / span : 0.5;
        const clamped = Math.max(0, Math.min(1, t));
        // smallest = 1.0, largest = 4.0 (4x diameter)
        return 1.0 + clamped * 3.0;
      }
      return 1.5;
    }
    const minSize = 1.0;
    const maxSize = 5.0; // 5x largest for high spend (more dramatic difference)
    const spent = Math.max(0, Number(campaign.spent) || 0);
    const { min, max } = spendRange;
    const t = max > min ? (spent - min) / (max - min) : 0.5;
    // Use power curve (t^0.7) to make medium spends slightly larger while keeping small ones small
    const curved = Math.pow(Math.max(0, Math.min(1, t)), 0.7);
    return minSize + curved * (maxSize - minSize);
  }, [campaign.spent, campaign.endDate, (campaign as any).startDate, spendRange.min, spendRange.max, layoutMode, gmoLayoutParams]);
  
  // Node brightness (cached)
  const brightness = React.useMemo(() => 
    campaign.roas > 3 ? 1.0 : 
    campaign.roas > 2 ? 0.8 : 
    campaign.roas > 1 ? 0.5 : 0.3,
    [campaign.roas]
  );
  
  // NEW FRAMEWORK: Node color based on READINESS PERCENT
  // Green (>80% On Track), Yellow (50-80% Needs Attention), Red (<50% At Risk)
  const nodeColor = React.useMemo(() => {
    const readiness = (campaign as any).readinessPercent ?? 50;
    return getReadinessColor(readiness);
  }, [(campaign as any).readinessPercent]);
  
  // Calculate opacity based on selection or hover state
  // - When alert filter is active: behave like Portfolio overview (ignore selection dimming), allow hover dim only
  // - Otherwise: if a node is selected, dim non-selected nodes to 50%
  const baseOpacity = alertFilterActive
    ? (isAnyHovered && !isThisHovered ? 0.5 : 1.0)
    : (hasSelection ? (isSelected ? 1.0 : 0.5) : (isAnyHovered && !isThisHovered ? 0.5 : 1.0));
  const hasAlerts = (campaign.alert || (campaign.alerts && campaign.alerts.length > 0));
  // When alert filter is active, bypass alerts-view dimming entirely
  const nodeOpacity = alertFilterActive
    ? baseOpacity
    : (alertsViewActive ? (hasAlerts ? baseOpacity : Math.min(baseOpacity, 0.2)) : baseOpacity);
  
  // Ensure material opacity updates immediately when nodeOpacity changes
  React.useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = nodeOpacity;
      materialRef.current.transparent = nodeOpacity < 0.999;
      materialRef.current.needsUpdate = true;
    }
    if (ringRef.current && (ringRef.current as any).material) {
      const m = (ringRef.current as any).material as THREE.Material & { opacity?: number; transparent?: boolean; needsUpdate?: boolean };
      if (typeof m.opacity === 'number') {
        m.opacity = nodeOpacity;
        m.transparent = nodeOpacity < 0.999;
        m.needsUpdate = true;
      }
    }
  }, [nodeOpacity]);
  
  // Enhanced glow when focused (detail panel open and this is the active campaign)
  const isActive = isDetailPanelOpen && isSelected;
  const glowIntensity = isActive ? 2.5 : (isThisHovered ? 1.4 : 1.0);
  
  // Delayed tooltip reveal (1.5s)
  const [showTooltip, setShowTooltip] = React.useState(false);
  const hoverTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (isThisHovered && !isDetailPanelOpen) {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      hoverTimerRef.current = window.setTimeout(() => setShowTooltip(true), 500);
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setShowTooltip(false);
    }
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, [isThisHovered, isDetailPanelOpen]);

  // Enter animation for tooltip (slide+scale from node)
  const [tooltipAnimIn, setTooltipAnimIn] = React.useState(false);
  React.useEffect(() => {
    if (showTooltip) {
      setTooltipAnimIn(false);
      const id = requestAnimationFrame(() => setTooltipAnimIn(true));
      return () => cancelAnimationFrame(id);
    } else {
      setTooltipAnimIn(false);
    }
  }, [showTooltip]);
  
  // Screen-edge aware tooltip positioning
  const { size, camera } = useThree();
  // High z-index HTML portal (above legend) – resolve after mount and retry until present
  const htmlPortalRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    let cancelled = false;
    const tryFind = (attempt: number) => {
      if (cancelled) return;
      const el = document.getElementById('cosmos-html-layer');
      if (el) { htmlPortalRef.current = el as HTMLElement; return; }
      if (attempt < 40) {
        setTimeout(() => tryFind(attempt + 1), 50);
      }
    };
    tryFind(0);
    return () => { cancelled = true; };
  }, []);
  const tooltipScreenInfo = React.useMemo(() => {
    const world = new THREE.Vector3();
    if (groupRef.current) {
      groupRef.current.getWorldPosition(world);
    }
    const v = world.clone().project(camera);
    const xPx = ((v.x + 1) / 2) * size.width;
    const yPx = ((-v.y + 1) / 2) * size.height;
    // Estimate node pixel radius by projecting a point offset upward by nodeSize in world space
    const topWorld = world.clone().add(new THREE.Vector3(0, nodeSize, 0));
    const vt = topWorld.project(camera);
    const yPxTop = ((-vt.y + 1) / 2) * size.height;
    const radiusPx = Math.abs(yPxTop - yPx);
    return { xPx, yPx, radiusPx };
  }, [groupRef.current, camera, size.width, size.height, isThisHovered, showTooltip]);

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = React.useState<{ width: number; height: number }>({ width: 300, height: 170 });
  React.useLayoutEffect(() => {
    if (!showTooltip) return;
    const r = tooltipRef.current?.getBoundingClientRect();
    if (r) {
      setTooltipSize({ width: Math.ceil(r.width), height: Math.ceil(r.height) });
    }
  }, [showTooltip, tooltipAnimIn]);
  
  const handleClick = React.useCallback(() => {
    console.log('🔥 PLANET CLICKED:', campaign.name);
    console.log('   Detail panel open:', isDetailPanelOpen);
    console.log('   Is selected:', isSelected);
    
    // Allow clicks even when detail panel is open (for planet-to-planet switching)
    if (onCampaignClick) {
      const position = new THREE.Vector3();
      if (groupRef.current) {
        groupRef.current.getWorldPosition(position);
      }
      console.log('   ✅ Calling onCampaignClick');
      onCampaignClick(campaign, position);
    } else {
      console.log('   ⚠️ No onCampaignClick handler');
      // Fallback to old behavior if onCampaignClick not provided
      setFocusedCampaign(campaign.id);
      const newZoom = Math.min(100, zoomLevel + 15);
      setZoomLevel(newZoom);
    }
  }, [campaign, zoomLevel, setFocusedCampaign, setZoomLevel, onCampaignClick, isDetailPanelOpen, isSelected]);

  // Alert ring no longer spins (static)

  // Depth-based dimming: farther nodes get dimmer up to 50%
  useFrame(({ camera }) => {
    if (!groupRef.current || !materialRef.current) return;
    const nodePos = groupRef.current.position;
    const camPos = camera.position;
    const distance = camPos.distanceTo(nodePos);
    const maxRingRadius = layoutMode === 'launch_readiness' ? 92 : Math.max(...Object.values(LIFECYCLE_RADIUS_MAP));
    const camDist = camPos.length(); // orbit controls target is origin [0,0,0]
    const near = Math.max(1, camDist - maxRingRadius);
    const far = camDist + maxRingRadius;
    const t = Math.max(0, Math.min(1, (distance - near) / Math.max(1e-6, (far - near))));
    // Reduce depth-based dimming strength by half: 1.0 -> 0.55 instead of 0.1 at far
    const depthFactor = 1.0 - 0.45 * t; // 1.0 (near) -> 0.55 (far)
    const baseEmissive = brightness * 0.8 * nodeOpacity * glowIntensity;
    materialRef.current.emissiveIntensity = baseEmissive * depthFactor;
  });
  
  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        pointerDownRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const start = pointerDownRef.current;
        pointerDownRef.current = null;
        if (start) {
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.hypot(dx, dy) < 5) {
            handleClick();
          }
        }
      }}
    >
      {/* Depth pre-pass to occlude orbital lines behind planet nodes */}
      <mesh>
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <meshBasicMaterial colorWrite={false} depthWrite={true} transparent={false} />
      </mesh>
      
      {/* Main Node Sphere - Always clickable */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          pointerDownRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          const start = pointerDownRef.current;
          pointerDownRef.current = null;
          if (start) {
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (Math.hypot(dx, dy) < 5) {
              handleClick();
            }
          }
        }}
        onPointerOver={() => {
          onHover(campaign.id);
        }}
        onPointerOut={() => {
          onHover(null);
        }}
        // onClick is intentionally not used; we rely on pointerUp with a small-move threshold
        scale={isActive ? 1.5 : (isThisHovered ? 1.3 : 1)}
      >
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={Math.max(0.08, brightness * 0.18) * nodeOpacity}
          roughness={isSelected ? 0.35 : 0.5}
          metalness={0.12}
          opacity={nodeOpacity}
          transparent={nodeOpacity < 0.999}
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Thin dark halo/backface outline to improve depth separation */}
      <mesh
        scale={(isActive ? 1.5 : (isThisHovered ? 1.3 : 1)) * 1.06}
      >
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <meshBasicMaterial 
          color="#000000"
          transparent
          opacity={0.35 * nodeOpacity}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      
      {/* Enhanced glow ring for active (focused) planet */}
      {isActive && (
        <mesh scale={1.2}>
          <sphereGeometry args={[nodeSize * 1.3, 16, 16]} />
          <meshBasicMaterial 
            color={nodeColor}
            transparent={true}
            opacity={0.2 * nodeOpacity}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Alert Indicator - with opacity matching parent node */}
      {(campaign.alert || campaign.alerts.length > 0) && (
        // Rotating red ring (no alert dot)
        <mesh ref={ringRef} rotation={[tiltRadians + Math.PI / 2, 0, 0]} scale={(isSelected ? 1.15 : 1) * 1.45}>
          <torusGeometry args={[nodeSize + 0.7, 0.28, 12, 96]} />
          <meshBasicMaterial color="#e78a3f" toneMapped={false} transparent opacity={nodeOpacity} />
        </mesh>
      )}
      
      {/* Tooltip on Hover - delayed 1.5s, hidden when detail panel is open */}
      {showTooltip && !isDetailPanelOpen && (
        <Html
          position={[0, 0, 0]}
          transform={false}
          center={false}
          sprite
          portal={htmlPortalRef as any}
          zIndexRange={[100000, 0]}
          prepend
          style={{ 
            pointerEvents: 'none',
            zIndex: 2147483647
          }}
        >
          <div 
            className="w-[300px] bg-gray-900/95 backdrop-blur-xl border-2 border-white/30 rounded-xl p-5 shadow-2xl transition-all duration-200 ease-out will-change-transform"
            style={{
              opacity: tooltipAnimIn ? Math.min(1, nodeOpacity) : 0,
              transform: (() => {
                if (!tooltipAnimIn) return 'translate(-8px, 6px) scale(0.85)';
                const pad = 16;
                const width = tooltipSize.width;
                const height = tooltipSize.height;
                const x = tooltipScreenInfo.xPx;
                const y = tooltipScreenInfo.yPx;
                const overflowRight = Math.max(0, x + pad + width - size.width);
                const canFlipLeft = x - pad - width >= 0;
                const tx = overflowRight > 0 && canFlipLeft
                  ? `calc(-100% - ${pad}px)`
                  : `${Math.max(12 - overflowRight, 12)}px`;
                const overflowBottom = Math.max(0, y + pad + height - size.height);
                const canFlipUp = y - pad - height >= 0;
                // Consider node radius so nodes near the bottom flip earlier
                const distanceFromBottom = size.height - (y + tooltipScreenInfo.radiusPx);
                const forceAbove = distanceFromBottom <= (height + pad * 2);
                let ty: string;
                if (forceAbove && canFlipUp) {
                  ty = `calc(-100% - ${pad}px)`; // always place above when too close to bottom
                } else if (overflowBottom > 0) {
                  ty = canFlipUp ? `calc(-100% - ${pad}px)` : `${-(overflowBottom + pad)}px`;
                } else {
                  ty = `${pad}px`;
                }
                return `translate(${tx}, ${ty}) scale(1)`;
              })()
            }}
            ref={tooltipRef}
          >
            {/* Readiness color accent */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
              style={{ backgroundColor: nodeColor }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1 line-clamp-2 leading-tight">
                  {campaign.name}
                </h3>
                <p className="text-gray-300 text-sm capitalize font-medium">
                  {((campaign as any).lifecycleStage || 'active').replace('_', ' ')} • {((campaign as any).funnelStage || 'conversion')}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {campaign.alerts.length > 0 && (
                  <span className="text-lg">⚠️</span>
                )}
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                  ((campaign as any).readinessPercent || 50) >= 80 ? 'text-white bg-white/20' :
                  ((campaign as any).readinessPercent || 50) >= 50 ? 'text-yellow-400 bg-yellow-400/20' : 
                  'text-red-400 bg-red-400/20'
                }`}>
                  {getReadinessLabel((campaign as any).readinessPercent || 50).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Budget bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs font-semibold">Budget</span>
                <span className="text-white text-xs font-bold">
                  ${(campaign.spent / 1000).toFixed(0)}K / ${(campaign.budget / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    (campaign.spent / campaign.budget) * 100 > 95 ? 'bg-red-500' : 
                    (campaign.spent / campaign.budget) * 100 > 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1 font-semibold">ROAS</p>
                <p className="text-white text-lg font-bold">
                  {campaign.roas.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1 font-semibold">Conv.</p>
                <p className="text-white text-lg font-bold">
                  {campaign.conversions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1 font-semibold">CTR</p>
                <p className="text-white text-lg font-bold">
                  {campaign.ctr.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Html>
      )}
      
      {/* Campaign Name Label - 3D label matching Galactic Lens style */}
      {showCampaignNames && (
        <Cosmos3DLabel
          position={[0, nodeSize + 1.5, 0]}
          text={campaign.name}
          fontSize={0.6}
          outlineWidth={0.02}
          outlineColor="#000"
          fillOpacity={nodeOpacity * 0.95}
        />
      )}
    </group>
  );
});

export const CampaignNodes: React.FC<CampaignNodesProps> = ({ 
  campaigns, 
  zoomLevel,
  hoveredCampaignId,
  setHoveredCampaignId,
  showCampaignNames,
  onCampaignClick,
  isDetailPanelOpen,
  selectedCampaignId,
  alertsViewActive,
  filterQuery,
  visibleChannels,
  visibleStatuses,
  alertsOnly,
  launchOnly,
  visibleTiers,
  // NEW FRAMEWORK: visibility controls
  visibleLifecycleStages,
  visibleFunnelStages,
  visibleReadinessStatuses,
  visibleSpendSizes,
  layoutMode = 'default',
  alertFilterCampaignIds
}) => {
  // Evenly distribute angles per channel with small deterministic jitter (prevents clustering)
  const gmoLayoutParams = React.useMemo((): GMOLayoutParams | undefined => {
    if (layoutMode !== 'gmo') return undefined;
    const withDates = campaigns.filter(
      (c) => c.endDate && ((c as any).startDate || c.createdDate)
    );
    if (withDates.length === 0) {
      return { minEndTime: 0, maxEndTime: 1, minDurationDays: 0, maxDurationDays: 1 };
    }
    const endTimes = withDates.map((c) => new Date(c.endDate!).getTime());
    const minEndTime = Math.min(...endTimes);
    const maxEndTime = Math.max(...endTimes);
    const durations = withDates.map((c) => {
      const end = new Date(c.endDate!).getTime();
      const start = (c as any).startDate
        ? new Date((c as any).startDate).getTime()
        : new Date(c.createdDate).getTime();
      return (end - start) / (24 * 60 * 60 * 1000);
    });
    return {
      minEndTime,
      maxEndTime,
      minDurationDays: Math.min(...durations),
      maxDurationDays: Math.max(...durations)
    };
  }, [campaigns, layoutMode]);

  const campaignsWithAngles = React.useMemo(() => {
    // GMO: 6 orbits by end date, angle distributed within each orbit
    if (layoutMode === 'gmo') {
      const clone = campaigns.map((c) => ({ ...c })) as (CampaignWithAngle & { __gmoOrbitIndex?: number })[];
      const withEnd = clone.filter((c) => {
        const end = c.endDate ? new Date(c.endDate).getTime() : NaN;
        const start = (c as any).startDate
          ? new Date((c as any).startDate).getTime()
          : c.createdDate
            ? new Date(c.createdDate).getTime()
            : NaN;
        return !isNaN(end) && !isNaN(start);
      });
      if (withEnd.length === 0) return [];
      const endTimes = withEnd.map((c) => new Date(c.endDate!).getTime());
      const minEndTime = Math.min(...endTimes);
      const maxEndTime = Math.max(...endTimes);
      const segmentWidth = (maxEndTime - minEndTime) / 6 || 1;
      withEnd.forEach((c) => {
        const endT = new Date(c.endDate!).getTime();
        const orbitIndex = Math.min(5, Math.max(0, Math.floor((endT - minEndTime) / segmentWidth)));
        c.__gmoOrbitIndex = orbitIndex;
      });
      const orbitGroups: Record<number, typeof withEnd> = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: []
      };
      withEnd.forEach((c) => {
        const idx = c.__gmoOrbitIndex ?? 0;
        orbitGroups[idx].push(c);
      });
      [0, 1, 2, 3, 4, 5].forEach((key) => {
        const arr = orbitGroups[key];
        arr.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        const n = arr.length;
        const step = (Math.PI * 2) / (n || 1);
        for (let i = 0; i < n; i++) {
          (arr[i] as CampaignWithAngle).calculatedAngle = (i * step) % (Math.PI * 2);
        }
      });
      return withEnd;
    }

    // Launch readiness: distribute evenly along each percent-complete band
    if (layoutMode === 'launch_readiness') {
      const clone: CampaignWithAngle[] = campaigns.map(c => ({ ...c }));
      const bandGroups: Record<'under20' | '20to40' | '40to60' | '60to80' | 'over80', CampaignWithAngle[]> = {
        under20: [],
        '20to40': [],
        '40to60': [],
        '60to80': [],
        over80: []
      };
      const bandFor = (pcRaw: any) => {
        const pc = Math.max(0, Math.min(100, Number(pcRaw) || 0));
        if (pc < 20) return 'under20';
        if (pc < 40) return '20to40';
        if (pc < 60) return '40to60';
        if (pc < 80) return '60to80';
        return 'over80';
      };
      clone.forEach(c => {
        const key = bandFor((c as any).percentComplete);
        bandGroups[key].push(c);
      });
      // Deterministic sort and even angular spacing per band with slight band-wise offset
      const bandOrder: Array<keyof typeof bandGroups> = ['under20', '20to40', '40to60', '60to80', 'over80'];
      const bandOffset: Record<keyof typeof bandGroups, number> = {
        under20: 0.0,
        '20to40': 0.13,
        '40to60': 0.27,
        '60to80': 0.41,
        over80: 0.55
      };
      bandOrder.forEach(k => {
        const arr = bandGroups[k];
        // stable deterministic order
        arr.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        const n = arr.length;
        if (n <= 0) return;
        const step = (Math.PI * 2) / n;
        const offset = bandOffset[k] * (Math.PI * 2);
        for (let i = 0; i < n; i++) {
          let ang = (i * step + offset) % (Math.PI * 2);
          if (ang < 0) ang += Math.PI * 2;
          // Avoid plane-crossing line (angles near 0 or π) for campaigns with alert rings
          const c = arr[i];
          // Avoid plane-crossing axes (0 and π) for ALL nodes
          const forbidden = (5 * Math.PI) / 180; // 5 degrees
          const wrap = (a: number) => {
            let t = a % (Math.PI * 2);
            return t < 0 ? t + Math.PI * 2 : t;
          };
          const distTo = (a: number, center: number) => {
            const d = Math.abs(wrap(a) - center);
            return Math.min(d, Math.PI * 2 - d);
          };
          const d0 = distTo(ang, 0);
          const dPi = distTo(ang, Math.PI);
          if (Math.min(d0, dPi) < forbidden) {
            const center = d0 <= dPi ? 0 : Math.PI;
            // push to the nearest boundary outside the forbidden zone (exactly 30° away)
            ang = wrap(center + (wrap(ang) < center ? -forbidden : forbidden));
          }
          if (ang < 0) ang += Math.PI * 2;
          (arr[i] as CampaignWithAngle).calculatedAngle = ang;
        }
      });
      return bandOrder.flatMap(k => bandGroups[k]);
    }

    // Default: Evenly distribute across entire ring (ignoring channel) to avoid clumping
    const ringGroups: Record<string, CampaignWithAngle[]> = {};
    campaigns.forEach(c => {
      const lifecycleStage = (c as any).lifecycleStage as LifecycleStage;
      const r = LIFECYCLE_RADIUS_MAP[lifecycleStage];
      const key = String(r);
      if (!ringGroups[key]) ringGroups[key] = [];
      ringGroups[key].push({ ...c });
    });
    // Simple deterministic hash -> [0,1)
    const hash01 = (s: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return (h % 100000) / 100000;
    };
    Object.keys(ringGroups).forEach(rKey => {
      const ringArr = ringGroups[rKey];
      const n = ringArr.length;
      if (n === 0) return;
      // Deterministic order per ring to keep layout stable across reloads
      ringArr.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      const step = (Math.PI * 2) / n;
      // Choose a base angle that keeps ALL nodes away from plane crossings (0 and π)
      const forbidden = (5 * Math.PI) / 180; // 5°
      const seedBase = hash01('ring:' + rKey + ':base') * (Math.PI * 2);
      const allIdx: number[] = ringArr.map((_, i) => i);
      const wrap = (a: number) => {
        let t = a % (Math.PI * 2);
        return t < 0 ? t + Math.PI * 2 : t;
      };
      const distTo = (a: number, center: number) => {
        const d = Math.abs(wrap(a) - center);
        return Math.min(d, Math.PI * 2 - d);
      };
      let bestBase = seedBase;
      let bestScore = -Infinity;
      for (let k = 0; k < 16; k++) {
        const candidate = wrap(seedBase + k * (step / 7));
        // score = minimal distance of any node index to 0/π, higher is better
        let score = Infinity;
        for (const i of allIdx) {
          const a = wrap(candidate + i * step);
          const s = Math.min(distTo(a, 0), distTo(a, Math.PI));
          score = Math.min(score, s);
        }
        if (score > bestScore) {
          bestScore = score;
          bestBase = candidate;
        }
        if (score >= forbidden + 0.01) break; // good enough
      }
      const base = bestBase;
      for (let i = 0; i < n; i++) {
        const c = ringArr[i];
        let angle = (base + i * step) % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;
        // Final safeguard: push any angle that still falls within forbidden zone away from axis
        const d0 = distTo(angle, 0);
        const dPi = distTo(angle, Math.PI);
        if (Math.min(d0, dPi) < forbidden) {
          const center = d0 <= dPi ? 0 : Math.PI;
          angle = wrap(center + (wrap(angle) < center ? -forbidden : forbidden));
        }
        (c as CampaignWithAngle).calculatedAngle = angle;
      }
      // Explicitly distribute specific alert retargeting campaigns farther apart
      // 30°, 150°, 270° avoid axis crossings (0 and π) and spread evenly
      const overrides: Record<string, number> = {
        'alert-audience-retarget-1': Math.PI / 6,      // 30°
        'alert-audience-retarget-2': (5 * Math.PI) / 6, // 150°
        'alert-audience-retarget-3': (3 * Math.PI) / 2  // 270°
      };
      ringArr.forEach(c => {
        const override = overrides[c.id as string];
        if (typeof override === 'number') {
          (c as CampaignWithAngle).calculatedAngle = override;
        }
      });
    });
    return Object.values(ringGroups).flat();
  }, [campaigns, layoutMode]);
  
  return (
    <group>
      {campaignsWithAngles.map((campaign, index) => {
        const alertFilterActive = !!(alertFilterCampaignIds && alertFilterCampaignIds.length > 0);
        const q = (filterQuery || '').trim().toLowerCase();
        if (q && !campaign.name.toLowerCase().includes(q)) return null;
        // Legacy filters (still supported for backward compatibility)
        if (visibleChannels && visibleChannels.hasOwnProperty(campaign.channel) && visibleChannels[campaign.channel] === false) return null;
        if (visibleStatuses && visibleStatuses[campaign.status] === false) return null;
        if (alertsOnly && (campaign.alert || (campaign.alerts && campaign.alerts.length > 0))) return null;
        // Launch readiness filter - show only campaigns launching within 90 days
        if (launchOnly) {
          const today = new Date();
          const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
          const targetDate = (campaign as any).targetLaunchDate;
          if (!targetDate || (campaign as any).launchDate) return null; // Skip if no target or already launched
          const target = new Date(targetDate);
          if (target < today || target > in90Days) return null;
        }
        
        // NEW FRAMEWORK: Lifecycle Stage visibility
        if (visibleLifecycleStages) {
          const lifecycleStage = (campaign as any).lifecycleStage as LifecycleStage;
          if (lifecycleStage && visibleLifecycleStages[lifecycleStage] === false) return null;
        }
        
        // NEW FRAMEWORK: Funnel Stage visibility
        if (visibleFunnelStages) {
          const funnelStage = (campaign as any).funnelStage as FunnelStage;
          if (funnelStage && visibleFunnelStages[funnelStage] === false) return null;
        }
        
        // NEW FRAMEWORK: Readiness Status visibility
        if (visibleReadinessStatuses) {
          const readiness = (campaign as any).readinessPercent || 50;
          const readinessStatus = readiness >= 80 ? 'on_track' : readiness >= 50 ? 'needs_attention' : 'at_risk';
          if (visibleReadinessStatuses[readinessStatus] === false) return null;
        }
        
        // NEW FRAMEWORK: Spend Size visibility
        if (visibleSpendSizes) {
          const spent = Math.max(0, Number(campaign.spent) || 0);
          const allSpends = campaigns.map(c => Math.max(0, Number(c.spent) || 0));
          const min = allSpends.length ? Math.min(...allSpends) : 0;
          const max = allSpends.length ? Math.max(...allSpends) : 1;
          const t = max > min ? (spent - min) / (max - min) : 0.5;
          const spendSize = t >= 0.7 ? 'high' : t >= 0.3 ? 'mid' : 'low';
          if (visibleSpendSizes[spendSize] === false) return null;
        }
        
        // Legacy tier visibility (maps to funnel stages now)
        if (visibleTiers) {
          const funnelStage = (campaign as any).funnelStage as FunnelStage;
          const tierMap: Record<FunnelStage, 'flat' | 'thirty' | 'sixty' | 'ninety'> = {
            retention: 'flat',
            conversion: 'thirty',
            consideration: 'sixty',
            awareness: 'ninety'
          };
          const tier = tierMap[funnelStage] || 'flat';
          if ((visibleTiers as any)[tier] === false) return null;
        }
        
        // Alert filter: when set, only show campaigns in the filter list
        // Others are completely hidden (not dimmed) for clear filtering
        if (alertFilterCampaignIds && alertFilterCampaignIds.length > 0) {
          if (!alertFilterCampaignIds.includes(campaign.id)) return null;
        }
        
        return (
        <CampaignNode
          key={campaign.id}
          campaign={campaign}
          zoomLevel={zoomLevel}
          index={index}
          isAnyHovered={hoveredCampaignId !== null}
          isThisHovered={hoveredCampaignId === campaign.id}
          onHover={setHoveredCampaignId}
          showCampaignNames={showCampaignNames}
          onCampaignClick={onCampaignClick}
          isDetailPanelOpen={isDetailPanelOpen}
          isSelected={selectedCampaignId === campaign.id}
          hasSelection={alertFilterActive ? false : !!selectedCampaignId}
          alertFilterActive={alertFilterActive}
          alertsViewActive={alertsViewActive}
          layoutMode={layoutMode}
          gmoLayoutParams={gmoLayoutParams}
        />
        );
      })}
    </group>
  );
};

