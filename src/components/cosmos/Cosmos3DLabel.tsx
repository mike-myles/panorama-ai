import React from 'react';
import { Billboard, Text } from '@react-three/drei';

type Vec3 = [number, number, number];

interface Cosmos3DLabelProps {
  position: Vec3;
  text: string;
  fontSize?: number; // world units
  color?: string;
  outlineWidth?: number;
  outlineColor?: string;
  anchorX?: 'left' | 'center' | 'right' | number;
  anchorY?: 'top' | 'middle' | 'bottom' | number;
  maxWidth?: number;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  follow?: boolean;
  lockX?: boolean;
  lockY?: boolean;
  lockZ?: boolean;
  fillOpacity?: number; // 0..1
}

export const Cosmos3DLabel: React.FC<Cosmos3DLabelProps> = ({
  position,
  text,
  fontSize = 0.9,
  color = 'white',
  outlineWidth = 0.05,
  outlineColor = '#000000',
  anchorX = 'center',
  anchorY = 'middle',
  maxWidth,
  textAlign = 'center',
  follow = true,
  lockX = false,
  lockY = false,
  lockZ = false,
  fillOpacity = 1,
}) => {
  return (
    <Billboard position={position} follow={follow} lockX={lockX} lockY={lockY} lockZ={lockZ}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        outlineWidth={outlineWidth}
        outlineColor={outlineColor}
        maxWidth={maxWidth}
        textAlign={textAlign}
        fillOpacity={fillOpacity}
      >
        {text}
      </Text>
    </Billboard>
  );
};

export default Cosmos3DLabel;


