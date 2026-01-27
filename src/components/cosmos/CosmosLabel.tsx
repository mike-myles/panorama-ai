import React from 'react';
/* cspell:words drei Vec bg FC */
import { Html } from '@react-three/drei';

type Vec3 = [number, number, number];

interface CosmosLabelProps {
  position: Vec3;
  text?: string;
  children?: React.ReactNode;
  center?: boolean;
  transform?: boolean;
  sprite?: boolean;
  className?: string;
  style?: React.CSSProperties;
  pointerEventsNone?: boolean;
  dimOpacity?: number; // 0..1 multiplier for opacity when parent is dimmed
  size?: 'sm' | 'md' | 'lg';
  variant?: 'panel' | 'chip' | 'plain';
}

const sizeToClasses: Record<NonNullable<CosmosLabelProps['size']>, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

const variantToClasses: Record<NonNullable<CosmosLabelProps['variant']>, string> = {
  panel: 'bg-gray-900/90 backdrop-blur-md border border-white/30 rounded-lg shadow-xl whitespace-nowrap',
  chip: 'bg-black/50 backdrop-blur-sm rounded whitespace-nowrap',
  plain: 'whitespace-nowrap'
};

export const CosmosLabel: React.FC<CosmosLabelProps> = ({
  position,
  text,
  children,
  center = true,
  transform = false,
  sprite = true,
  className,
  style,
  pointerEventsNone = true,
  dimOpacity = 1,
  size = 'md',
  variant = 'panel'
}) => {
  const containerClass = [
    variantToClasses[variant],
    sizeToClasses[size],
    'text-white font-semibold',
    className || ''
  ].join(' ').trim();

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

  return (
    <Html
      position={position}
      center={center}
      transform={transform}
      sprite={sprite}
      portal={htmlPortalRef as any}
      zIndexRange={[0, 0]}
      style={{ pointerEvents: pointerEventsNone ? 'none' : 'auto', zIndex: 1 }}
    >
      <div className={containerClass} style={{ opacity: dimOpacity, ...style }}>
        {children ?? text}
      </div>
    </Html>
  );
};

export default CosmosLabel;


