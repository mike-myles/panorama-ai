/* cspell:disable-file */
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * CosmosBackground - Sets the Three.js scene background to pure black
 */
export const CosmosBackground: React.FC = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    // Set scene background to pure black to match header
    scene.background = new THREE.Color(0x0a0a0c);
    // Add subtle depth fog to darken distant objects for depth cueing
    // Soften fog: push start/falloff farther so distant objects are only slightly dimmer
    const fogNear = 220;
    const fogFar = 800;
    scene.fog = new THREE.Fog(new THREE.Color(0x0a0a0c), fogNear, fogFar);
    
    return () => {
      // Cleanup
      if (scene.background) {
        scene.background = null;
      }
      if (scene.fog) {
        scene.fog = null as any;
      }
    };
  }, [scene]);

  return null;
};
