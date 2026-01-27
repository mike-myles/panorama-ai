// @ts-nocheck
import React from 'react';
import * as THREE from 'three';
import { CosmosLabel } from './CosmosLabel';
import { Channel, Campaign, LifecycleStage, FunnelStage } from '../../types';

// NEW FRAMEWORK: Lifecycle Stage Ring Definitions
// Innermost (closest to sun) = Closing, Outermost = Ideation
// Radii pushed out by 3 units to accommodate 130% larger sun (11.7 vs 9)
const LIFECYCLE_RINGS: Array<{ stage: LifecycleStage; label: string; radius: number; color: string }> = [
  { stage: 'closing', label: 'Closing', radius: 62, color: '#53b2ad' },
  { stage: 'active', label: 'Active', radius: 80, color: '#4146c3' },
  { stage: 'launching', label: 'Launching', radius: 98, color: '#e78a36' },
  { stage: 'qa_ready', label: 'QA & Ready', radius: 116, color: '#cd4a81' },
  { stage: 'development', label: 'Development', radius: 134, color: '#7f84f2' },
  { stage: 'planning', label: 'Planning', radius: 152, color: '#8edd78' },
  { stage: 'ideation', label: 'Ideation', radius: 170, color: '#3878eb' }
];

// NEW FRAMEWORK: Funnel Stage Plane Definitions
// 0° = Awareness (TOFU), 30° = Consideration (MOFU), 60° = Conversion (BOFU), 90° = Retention (Post-funnel)
const FUNNEL_PLANES: Array<{ stage: FunnelStage; label: string; tilt: number }> = [
  { stage: 'awareness', label: 'Awareness (TOFU)', tilt: 0 },
  { stage: 'consideration', label: 'Consideration (MOFU)', tilt: 30 },
  { stage: 'conversion', label: 'Conversion (BOFU)', tilt: 60 },
  { stage: 'retention', label: 'Retention (Post-funnel)', tilt: 90 }
];

interface OrbitalRingSystemProps {
  channels: Channel[];
  campaigns: Campaign[];
  zoomLevel: number;
  visibleChannels?: Record<string, boolean>;
  visibleTiers?: Record<'flat' | 'thirty' | 'sixty' | 'ninety', boolean>;
  visibleLifecycleStages?: Record<LifecycleStage, boolean>;
  visibleFunnelStages?: Record<FunnelStage, boolean>;
  layoutMode?: 'default' | 'launch_readiness';
  visibleBands?: Record<'under20' | '20to40' | '40to60' | '60to80' | 'over80', boolean>;
}

/* cspell:words Mul MOFU BOFU TOFU UX */
interface OrbitalRingProps {
  radius: number;
  color: string;
  label: string;
  opacity: number;
  zoomLevel: number;
  // Funnel plane visibility multipliers
  retentionMul: number;    // 0° plane visibility
  conversionMul: number;   // 30° plane visibility
  considerationMul: number; // 60° plane visibility
  awarenessMul: number;    // 90° plane visibility
  lifecycleMul: number;    // multiplier when lifecycle stage is hidden
}

const OrbitalRing = ({ 
  radius, 
  color, 
  label, 
  opacity, 
  zoomLevel, 
  retentionMul, 
  conversionMul, 
  considerationMul, 
  awarenessMul, 
  lifecycleMul
}: OrbitalRingProps) => {
  // Create ring geometry
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // NEW FRAMEWORK: Create materials for each funnel plane (all dashed)
  // All use LineDashedMaterial with consistent dash patterns
  const awarenessMaterial = React.useMemo(() => {
    const mat = new THREE.LineDashedMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.55 * opacity * awarenessMul * lifecycleMul, 
      dashSize: 0.6, 
      gapSize: 0.6 
    });
    mat.depthTest = true;
    mat.depthWrite = false;
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [color, awarenessMul, lifecycleMul]);
  
  const considerationMaterial = React.useMemo(() => {
    const mat = new THREE.LineDashedMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.55 * opacity * considerationMul * lifecycleMul, 
      dashSize: 0.9, 
      gapSize: 0.5 
    });
    mat.depthTest = true;
    mat.depthWrite = false;
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [color, considerationMul, lifecycleMul]);
  
  const conversionMaterial = React.useMemo(() => {
    const mat = new THREE.LineDashedMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.55 * opacity * conversionMul * lifecycleMul, 
      dashSize: 1.2, 
      gapSize: 0.4 
    });
    mat.depthTest = true;
    mat.depthWrite = false;
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [color, conversionMul, lifecycleMul]);
  
  const retentionMaterial = React.useMemo(() => {
    const mat = new THREE.LineDashedMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.55 * opacity * retentionMul * lifecycleMul, 
      dashSize: 1.5, 
      gapSize: 0.3 
    });
    mat.depthTest = true;
    mat.depthWrite = false;
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [color, retentionMul, lifecycleMul]);

  // Create line objects
  const retentionLine = React.useMemo(() => {
    const ln = new THREE.Line(geometry, retentionMaterial);
    (ln as any).computeLineDistances?.();
    return ln;
  }, [geometry, retentionMaterial]);
  
  const conversionLine = React.useMemo(() => {
    const ln = new THREE.Line(geometry, conversionMaterial);
    (ln as any).computeLineDistances?.();
    return ln;
  }, [geometry, conversionMaterial]);
  
  const considerationLine = React.useMemo(() => {
    const ln = new THREE.Line(geometry, considerationMaterial);
    (ln as any).computeLineDistances?.();
    return ln;
  }, [geometry, considerationMaterial]);
  
  const awarenessLine = React.useMemo(() => {
    const ln = new THREE.Line(geometry, awarenessMaterial);
    (ln as any).computeLineDistances?.();
    return ln;
  }, [geometry, awarenessMaterial]);
  
  const currentLayer = Math.floor(zoomLevel / 20);
  
  return (
    <group>
      {/* NEW FRAMEWORK: Rings for each funnel stage plane */}
      {/* Awareness: 0° (flat plane) - TOFU */}
      <primitive object={awarenessLine} />
      {/* Consideration: 30° tilt - MOFU */}
      <primitive object={considerationLine} rotation={[(30 * Math.PI) / 180, 0, 0]} />
      {/* Conversion: 60° tilt - BOFU */}
      <primitive object={conversionLine} rotation={[(60 * Math.PI) / 180, 0, 0]} />
      {/* Retention: 90° tilt - Post-funnel (perpendicular) */}
      <primitive object={retentionLine} rotation={[(90 * Math.PI) / 180, 0, 0]} />
      
      {/* Lifecycle Stage Label - shown next to each ring on the 0° (Awareness) plane */}
      {currentLayer <= 1 && (
        <CosmosLabel
          position={[radius + 2, 0, 0]}
          text={label}
          size="sm"
          variant="chip"
          dimOpacity={0.6}
          style={{ fontSize: '0.6em', fontWeight: 400 }}
        />
      )}
      
    </group>
  );
};

// Separate component for Funnel Stage Labels
// Renders labels for each tilted orbital plane at the outermost ring edge
// Following UI and UX best practices: labels positioned at the "signature" point of each plane
// where it extends furthest from the flat plane, creating an arc from front to bottom
const FunnelPlaneLabels = ({ 
  radius, 
  currentLayer,
  awarenessMul,
  considerationMul,
  conversionMul,
  retentionMul
}: {
  radius: number;
  currentLayer: number;
  awarenessMul: number;
  considerationMul: number;
  conversionMul: number;
  retentionMul: number;
}) => {
  if (currentLayer > 1) {
    return null;
  }
  
  // Position labels at IDENTICAL RELATIVE POSITIONS on each orbital plane
  // Following Retention's perfect placement at the MAJOR AXIS VERTEX
  // But we must keep labels in TOP-RIGHT quadrant from camera view (+X, +Y, -Z)
  const R = radius + 5; // Slightly beyond the ring edge (108)
  
  // Helper function to calculate position on tilted ring
  // theta = angle around the ring (in degrees)
  // tiltDeg = tilt angle of the plane (in degrees)
  const calcRingPosition = (theta: number, tiltDeg: number): [number, number, number] => {
    const thetaRad = (theta * Math.PI) / 180;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    
    const x = R * Math.cos(thetaRad);
    const y = R * Math.sin(thetaRad) * Math.sin(tiltRad);
    const z = R * Math.sin(thetaRad) * Math.cos(tiltRad);
    
    return [x, y, z];
  };
  
  // === LABELS IN TOP-RIGHT QUADRANT AT OUTER EDGE ===
  // All labels at radius R, positioned in the right-side arc from top to front
  // Y values proportional to sin(tilt) for visual consistency
  // Negative Z values ensure they appear on the RIGHT side from camera
  
  // RETENTION (90° tilt): Top center - Y = R, Z = 0 (perfect)
  const retentionPos: [number, number, number] = [R * 0.1, R, 0];
  
  // CONVERSION (60° tilt): At the OUTER EDGE in TOP-RIGHT quadrant
  // Positioned consistently between Retention (Y=R) and Consideration (Y=0.35R)
  // Y height proportional to sin(60°) ≈ 0.75R, at the outermost boundary
  const conversionPos: [number, number, number] = [R * 0.45, R * 0.75, -R * 0.45];
  
  // CONSIDERATION (30° tilt): Middle-right - Y proportional to sin(30°)
  // Position at outer edge in the middle-right quadrant
  const considerationPos: [number, number, number] = [R * 0.7, R * 0.35, -R * 0.6];
  
  // AWARENESS (0° tilt): Right-front - Y = 0 (flat plane)
  const awarenessPos: [number, number, number] = [R * 0.707, 0, -R * 0.707];
  
  return (
    <group>
      {/* Awareness (0° tilt) - flat plane */}
      <CosmosLabel
        position={awarenessPos}
        text="Awareness"
        size="sm"
        variant="chip"
        dimOpacity={0.6 * awarenessMul}
        style={{ fontSize: '0.6em', fontWeight: 400 }}
      />
      
      {/* Consideration (30° tilt) */}
      <CosmosLabel
        position={considerationPos}
        text="Consideration"
        size="sm"
        variant="chip"
        dimOpacity={0.6 * considerationMul}
        style={{ fontSize: '0.6em', fontWeight: 400 }}
      />
      
      {/* Conversion (60° tilt) */}
      <CosmosLabel
        position={conversionPos}
        text="Conversion"
        size="sm"
        variant="chip"
        dimOpacity={0.6 * conversionMul}
        style={{ fontSize: '0.6em', fontWeight: 400 }}
      />
      
      {/* Retention (90° tilt) - perpendicular plane */}
      <CosmosLabel
        position={retentionPos}
        text="Retention"
        size="sm"
        variant="chip"
        dimOpacity={0.6 * retentionMul}
        style={{ fontSize: '0.6em', fontWeight: 400 }}
      />
    </group>
  );
};

export const OrbitalRingSystem = ({ 
  channels, 
  campaigns, 
  zoomLevel, 
  visibleChannels, 
  visibleTiers, 
  visibleLifecycleStages,
  visibleFunnelStages,
  layoutMode = 'default', 
  visibleBands 
}: OrbitalRingSystemProps) => {
  const currentLayer = Math.floor(zoomLevel / 20);
  
  if (layoutMode === 'launch_readiness') {
    // Build percent-complete bands: >80%, 60–80%, 40–60%, 20–40%, <20%
    const minR = 28;
    const maxR = 92;
    const rFor = (pc: number) => maxR - (pc / 100) * (maxR - minR);
    const bands = [
      { key: 'under20' as const, label: 'Under 20%', atPc: 20, color: '#ef4444' },
      { key: '20to40' as const, label: '20% - 40%', atPc: 40, color: '#f97316' },
      { key: '40to60' as const, label: '40% - 60%', atPc: 60, color: '#f59e0b' },
      { key: '60to80' as const, label: '60% - 80%', atPc: 80, color: '#10b981' },
      { key: 'over80' as const, label: 'Over 80%', atPc: 90, color: '#3b82f6' }
    ];
    const opacity = 1.0;
    const retentionMul = visibleTiers && visibleTiers.flat === false ? 0.0 : 1.0;
    const conversionMul = visibleTiers && visibleTiers.thirty === false ? 0.0 : 1.0;
    const considerationMul = visibleTiers && visibleTiers.sixty === false ? 0.0 : 1.0;
    const awarenessMul = visibleTiers && visibleTiers.ninety === false ? 0.0 : 1.0;
    return (
      <group>
        {bands.map((b) => {
          const radius = rFor(b.atPc);
          const visible = visibleBands ? (visibleBands[b.key] !== false) : true;
          return (
            <OrbitalRing
              key={`readiness-${b.key}`}
              radius={radius}
              color={b.color}
              label={b.label}
              opacity={opacity}
              zoomLevel={zoomLevel}
              retentionMul={retentionMul}
              conversionMul={conversionMul}
              considerationMul={considerationMul}
              awarenessMul={awarenessMul}
              lifecycleMul={visible ? 1.0 : 0.0}
            />
          );
        })}
      </group>
    );
  }
  
  // NEW FRAMEWORK: Default mode uses Lifecycle Stage rings
  // Each ring represents a lifecycle stage (concept phase → in-market)
  const opacity = 1.0;
  
  // Funnel plane visibility multipliers
  const retentionMul = visibleFunnelStages && visibleFunnelStages.retention === false ? 0.2 : 1.0;
  const conversionMul = visibleFunnelStages && visibleFunnelStages.conversion === false ? 0.2 : 1.0;
  const considerationMul = visibleFunnelStages && visibleFunnelStages.consideration === false ? 0.2 : 1.0;
  const awarenessMul = visibleFunnelStages && visibleFunnelStages.awareness === false ? 0.2 : 1.0;
  
  // Outermost ring radius for funnel stage label positioning
  const outermostRadius = 103; // Ideation ring radius
  const labelOffset = 15; // Larger offset beyond the outermost ring for visibility
  const labelRadius = outermostRadius + labelOffset;
  
  return (
    <group>
      {LIFECYCLE_RINGS.map((ring) => {
        // Lifecycle stage visibility
        const lifecycleMul = visibleLifecycleStages && visibleLifecycleStages[ring.stage] === false ? 0.2 : 1.0;
        
        return (
          <OrbitalRing
            key={ring.stage}
            radius={ring.radius}
            color={ring.color}
            label={ring.label}
            opacity={opacity}
            zoomLevel={zoomLevel}
            retentionMul={retentionMul}
            conversionMul={conversionMul}
            considerationMul={considerationMul}
            awarenessMul={awarenessMul}
            lifecycleMul={lifecycleMul}
          />
        );
      })}
      {/* Funnel Stage Labels removed */}
    </group>
  );
};

