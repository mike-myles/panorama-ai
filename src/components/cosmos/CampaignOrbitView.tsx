// @ts-nocheck
/* cspell:disable-file */
/* cspell:words drei idx */
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Line, Text } from '@react-three/drei';
import { CosmosLabel } from './CosmosLabel';
import { Campaign } from '../../types';

interface CampaignOrbitViewProps {
  campaign: Campaign | null;
  opacity?: number; // 0..1 fade-in factor
  sceneScale?: number;
  onSelect?: (payload: any) => void;
  selectedChild?: any | null;
  filterQuery?: string;
}

const computeOrbitPosition = (angle: number, radius: number, tiltRadians: number) => {
  const x = Math.cos(angle) * radius;
  const zBase = Math.sin(angle) * radius;
  const y = -zBase * Math.sin(tiltRadians);
  const z = zBase * Math.cos(tiltRadians);
  return { x, y, z };
};

export const CampaignOrbitView = ({ campaign, opacity = 1, sceneScale = 1, onSelect, selectedChild, filterQuery }: CampaignOrbitViewProps) => {
  const tiltRadians = (30 * Math.PI) / 180; // slight tilt for 3D effect

  const creativesRaw = (campaign?.creatives ?? []).map((c: any) => ({ ...c, percentComplete: typeof c.percentComplete === 'number' ? c.percentComplete : 50 }));
  const alertsRaw = (campaign?.alerts ?? []).map((a: any) => ({ ...a, percentComplete: typeof a.percentComplete === 'number' ? a.percentComplete : 50 }));

  const tasks = [
    { name: 'Budget Review', percentComplete: 15 },
    { name: 'Optimize Bids', percentComplete: 55 },
    { name: 'Audience Audit', percentComplete: 85 }
  ];
  const documents = [
    { name: 'Campaign Brief', percentComplete: 30 },
    { name: 'KPI Sheet', percentComplete: 70 }
  ];

  const makeCircle = (radius: number, segments: number = 96) => Array.from({ length: segments + 1 }, (_, i) => {
    const ang = (i / segments) * Math.PI * 2;
    const p = computeOrbitPosition(ang, radius, tiltRadians);
    return new THREE.Vector3(p.x, p.y, p.z);
  });

  const emissiveOpacity = Math.max(0, Math.min(1, opacity));
  const panelOpen = !!selectedChild;
  const uidFor = React.useCallback((type: string, item: any) => {
    const key = item?.id || item?.name || item?.message || JSON.stringify(item || {});
    return `${type}:${String(key)}`;
  }, []);
  const isSelected = React.useCallback((type: string, item: any) => {
    if (!selectedChild) return false;
    const selectedType = (selectedChild.type || '').toString();
    if (selectedType !== type) {
      // If a stable uid exists on selectedChild, allow direct uid comparison
      if (selectedChild?.uid) {
        return selectedChild.uid === uidFor(type, item);
      }
      return false;
    }
    // Prefer uid match when available
    if (selectedChild?.uid && uidFor(type, item) === selectedChild.uid) return true;
    if (item?.id && selectedChild?.id && item.id === selectedChild.id) return true;
    if (item?.name && selectedChild?.name && item.name === selectedChild.name) return true;
    if (item?.message && selectedChild?.message && item.message === selectedChild.message) return true;
    return false;
  }, [selectedChild, uidFor]);

  // Central alert ring no longer spins
  const centerRingRef = React.useRef<THREE.Mesh>(null);

  // Simple name filter for child nodes
  const q = (filterQuery || '').trim().toLowerCase();
  const matches = (text?: string) => {
    if (!q) return true;
    if (!text) return false;
    return text.toLowerCase().includes(q);
  };

  return (
    <group scale={[sceneScale, sceneScale, sceneScale]}>      
      {/* Central sun / Campaign core */}
      {(() => {
        const selected = isSelected('campaign', campaign);
        const coreOpacity = panelOpen ? (selected ? 1 : 0.2) : 1;
        // Match Cosmos behavior: show ring if ANY alert exists (regardless of severity)
        const hasAnyAlert = !!campaign && (((campaign as any).alert === true) || (Array.isArray((campaign as any).alerts) && (campaign as any).alerts.length > 0));
        // If filtering and campaign name does not match, hide central node too
        const q = (filterQuery || '').trim().toLowerCase();
        if (q && !(campaign?.name || '').toLowerCase().includes(q)) return null;
        return (
          <group onClick={() => onSelect && onSelect({ type: 'campaign', ...campaign })}>
            <mesh scale={selected ? 1.1 : 1}>
              <sphereGeometry args={[5, 48, 48]} />
              <meshStandardMaterial 
                color="#FDE68A" 
                emissive="#FDE68A" 
                emissiveIntensity={(selected ? 1.0 : 0.7) * emissiveOpacity} 
                opacity={0.9 * opacity * coreOpacity} 
                transparent 
              />
            </mesh>
            {selected && (
              <mesh scale={1.25}>
                <sphereGeometry args={[5.8, 32, 32]} />
                <meshBasicMaterial color="#FDE68A" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
              </mesh>
            )}
            {/* Rotating alert ring when campaign has any alert */}
            {hasAnyAlert && (
              <mesh ref={centerRingRef} rotation={[tiltRadians + Math.PI / 2, 0, 0]} scale={1.6}>
                <torusGeometry args={[5.8, 0.18, 16, 96]} />
                <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1.8} transparent opacity={0.95} />
              </mesh>
            )}
            <Billboard position={[0, 7.5, 0]}>
              <Text fontSize={1.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.06} outlineColor="#000">
                {campaign?.name || 'Campaign Orbit'}
              </Text>
            </Billboard>
          </group>
        );
      })()}

      {/* Percent-complete rings (0% outer → 100% inner) and evenly distributed items per band */}
      {(() => {
        const bandPercents = [0, 20, 40, 60, 80, 100];
        // Increase gaps by 50% (keep innermost at 16): gaps 6 vs old 4
        const ringRadii = [46, 40, 34, 28, 22, 16]; // outer → inner
        const clampPc = (v: any) => {
          const n = Math.max(0, Math.min(100, Number(v) || 0));
          return n;
        };
        const bandFor = (pc: number) => {
          if (pc >= 100) return 5;
          return Math.max(0, Math.min(5, Math.floor(pc / 20)));
        };
        type OrbitItem = { type: 'creative' | 'alert' | 'task' | 'document'; data: any; name: string; pc: number; color: string; size: number };
        const collected: OrbitItem[] = [];
        creativesRaw.forEach((cr: any) => {
          if (!matches(cr?.name)) return;
          collected.push({ type: 'creative', data: cr, name: cr.name, pc: clampPc(cr.percentComplete ?? 50), color: '#34D399', size: 1.4 });
        });
        alertsRaw.forEach((al: any) => {
          if (!matches(al?.message)) return;
          collected.push({ type: 'alert', data: al, name: al.message, pc: clampPc(al.percentComplete ?? 50), color: '#F59E0B', size: 1.6 });
        });
        tasks.forEach((t) => {
          if (!matches(t?.name)) return;
          collected.push({ type: 'task', data: t, name: t.name, pc: clampPc(t.percentComplete ?? 50), color: '#60A5FA', size: 1.5 });
        });
        documents.forEach((d) => {
          if (!matches(d?.name)) return;
          collected.push({ type: 'document', data: d, name: d.name, pc: clampPc(d.percentComplete ?? 50), color: '#A78BFA', size: 1.3 });
        });
        // Draw rings + labels
        const ringLabels = [
          '0–19%',
          '20–39%',
          '40–59%',
          '60–79%',
          '80–99%',
          '100%'
        ];
        // Color palette (outer → inner): red → pink → amber → purple → blue → green
        const ringColors = ['#EF4444', '#EC4899', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'];
        const rings = ringRadii.map((radius, idx) => {
          // Shift labels 20° clockwise per ring moving outward from center
          // inner (index 5) => 0°, next outward => +20°, ... outermost => +100°
          const ringsCount = ringRadii.length;
          const stepsFromInner = (ringsCount - 1 - idx);
          const labelAngle = (stepsFromInner * 20 * Math.PI) / 180;
          const lp = computeOrbitPosition(labelAngle, radius + 1.8, tiltRadians);
          return (
            <group key={`pct-ring-${idx}-${radius}`}>
              <Line
                points={makeCircle(radius)}
                color={ringColors[idx]}
                lineWidth={1}
                dashed
                dashSize={0.5}
                gapSize={0.8}
                transparent
                opacity={0.6 * opacity}
              />
              {/* Label positioned with band-specific angle to avoid overlap */}
              <CosmosLabel
                position={[lp.x, lp.y, lp.z]}
                text={ringLabels[idx]}
                size="sm"
                variant="chip"
                dimOpacity={0.4}
                style={{ fontSize: '0.6em', fontWeight: 400 }}
              />
            </group>
          );
        });
        // Group items by band
        const itemsByBand: Record<number, OrbitItem[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
        collected.forEach(item => {
          const band = bandFor(item.pc);
          itemsByBand[band].push(item);
        });
        const itemNodes: React.ReactNode[] = [];
        // Deterministic hash [0,1)
        const hash01 = (s: string) => {
          let h = 2166136261 >>> 0;
          for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
          }
          return (h % 100000) / 100000;
        };
        const wrap = (a: number) => {
          let t = a % (Math.PI * 2);
          return t < 0 ? t + Math.PI * 2 : t;
        };
        // Use band-specific base offsets using golden-angle spacing to avoid cross-ring alignments
        const golden = (Math.PI * (3 - Math.sqrt(5))); // ≈ 2.399963, good for de-correlation
        const bandBaseSeed = hash01((campaign?.id || 'orbit') + ':bandBase') * Math.PI * 2;
        bandPercents.forEach((_, bandIdx) => {
          const arr = itemsByBand[bandIdx];
          const n = arr.length;
          if (n === 0) return;
          const step = (Math.PI * 2) / n;
          // distinct base per band to prevent vertical alignments across rings
          const base = wrap(bandBaseSeed + bandIdx * golden);
          for (let i = 0; i < n; i++) {
            const it = arr[i];
            // Add small, deterministic jitter within 40% of step to break residual alignment
            const jitter = (hash01(it.name + ':' + i) - 0.5) * (0.4 * step);
            const angle = wrap(base + i * step + jitter);
            const radius = ringRadii[bandIdx];
            const p = computeOrbitPosition(angle, radius, tiltRadians);
            const selected = isSelected(it.type, it.data);
            const itemOpacity = panelOpen ? (selected ? 1 : 0.2) : 1;
            const uid = uidFor(it.type, it.data);
            itemNodes.push(
              <group key={`${it.type}-${bandIdx}-${i}`} position={[p.x, p.y, p.z]} onClick={() => onSelect && onSelect({ type: it.type, uid, ...it.data })}>
                <>
                  <mesh scale={selected ? 1.25 : 1}>
                    <sphereGeometry args={[it.size, 24, 24]} />
                    <meshStandardMaterial color={it.color} emissive={it.color} emissiveIntensity={(selected ? 1.0 : 0.6) * emissiveOpacity} opacity={opacity * itemOpacity} transparent />
                  </mesh>
                  {selected && (
                    <mesh scale={1.35}>
                      <sphereGeometry args={[it.size * 1.2, 24, 24]} />
                      <meshBasicMaterial color={it.color} transparent opacity={0.22} blending={THREE.AdditiveBlending} />
                    </mesh>
                  )}
                </>
                <Billboard position={[0, it.size + 1.2, 0]}>
                  <Text fontSize={0.9} color="white" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000">{it.name}</Text>
                </Billboard>
              </group>
            );
          }
        });
        return (
          <>
            {rings}
            {itemNodes}
          </>
        );
      })()}
    </group>
  );
};


