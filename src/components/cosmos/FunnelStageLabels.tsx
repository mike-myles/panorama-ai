// @ts-nocheck
import React from 'react';
import { Html } from '@react-three/drei';
import { FunnelStage } from '../../types';

interface FunnelStageLabelsProps {
  visibleFunnelStages?: Record<FunnelStage, boolean>;
  zoomLevel: number;
  launchReadinessMode: boolean;
}

// Label styling to match lifecycle stage labels exactly
const labelStyle: React.CSSProperties = {
  fontSize: '0.6em',
  fontWeight: 400,
  padding: '4px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  color: 'white',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};

export const FunnelStageLabels: React.FC<FunnelStageLabelsProps> = ({
  visibleFunnelStages,
  zoomLevel,
  launchReadinessMode,
}) => {
  const currentLayer = Math.floor(zoomLevel / 20);
  
  // Only show in default mode and at zoom levels 0-1
  if (launchReadinessMode || currentLayer > 1) return null;
  
  // Portal reference for Html elements (same as CosmosLabel)
  const htmlPortalRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    let cancelled = false;
    const tryFind = (attempt: number) => {
      if (cancelled) return;
      const el = document.getElementById('cosmos-html-layer');
      if (el) { htmlPortalRef.current = el as HTMLElement; return; }
      if (attempt < 20) setTimeout(() => tryFind(attempt + 1), 50);
    };
    tryFind(0);
    return () => { cancelled = true; };
  }, []);

  // Outermost ring radius (Ideation = 103) + small offset
  const radius = 108;
  
  // Calculate opacity based on visibility settings
  const getOpacity = (stage: FunnelStage) => {
    return visibleFunnelStages?.[stage] === false ? 0.2 : 0.6;
  };

  // Helper function to calculate position on a tilted orbital plane
  // azimuthDeg: position around the ring (0° = right, 90° = back, 180° = left, 270° = front)
  // tiltDeg: plane tilt angle (rotation around X-axis)
  const getPositionOnPlane = (azimuthDeg: number, tiltDeg: number): [number, number, number] => {
    const azimuthRad = (azimuthDeg * Math.PI) / 180;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    
    const x = Math.cos(azimuthRad) * radius;
    const y = Math.sin(azimuthRad) * radius * Math.sin(tiltRad);
    const z = Math.sin(azimuthRad) * radius * Math.cos(tiltRad);
    
    return [x, y, z];
  };

  return (
    <group>
      {/* Retention (0° tilt) - flat horizontal plane, label at right edge (0° azimuth) */}
      <Html
        position={getPositionOnPlane(0, 0)}
        center
        sprite
        portal={htmlPortalRef as any}
        zIndexRange={[0, 0]}
        style={{ pointerEvents: 'none', zIndex: 1 }}
      >
        <div style={{ ...labelStyle, opacity: getOpacity('retention') }}>
          Retention
        </div>
      </Html>
      
      {/* Conversion (30° tilt) - tilted plane, label at right-front edge (30° azimuth) */}
      <Html
        position={getPositionOnPlane(30, 30)}
        center
        sprite
        portal={htmlPortalRef as any}
        zIndexRange={[0, 0]}
        style={{ pointerEvents: 'none', zIndex: 1 }}
      >
        <div style={{ ...labelStyle, opacity: getOpacity('conversion') }}>
          Conversion
        </div>
      </Html>
      
      {/* Consideration (60° tilt) - tilted plane, label at right-front edge (45° azimuth) */}
      <Html
        position={getPositionOnPlane(45, 60)}
        center
        sprite
        portal={htmlPortalRef as any}
        zIndexRange={[0, 0]}
        style={{ pointerEvents: 'none', zIndex: 1 }}
      >
        <div style={{ ...labelStyle, opacity: getOpacity('consideration') }}>
          Consideration
        </div>
      </Html>
      
      {/* Awareness (90° tilt) - perpendicular plane, label at right edge (0° azimuth) */}
      <Html
        position={getPositionOnPlane(0, 90)}
        center
        sprite
        portal={htmlPortalRef as any}
        zIndexRange={[0, 0]}
        style={{ pointerEvents: 'none', zIndex: 1 }}
      >
        <div style={{ ...labelStyle, opacity: getOpacity('awareness') }}>
          Awareness
        </div>
      </Html>
    </group>
  );
};

export default FunnelStageLabels;
