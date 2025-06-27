"use client";

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import type * as THREE from 'three';

function SpinningGlobe() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs on the client-side after the component mounts
    const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (computedColor) {
        // The value from CSS is like "225 100% 58%", we need "hsl(225, 100%, 58%)"
        setPrimaryColor(`hsl(${computedColor.split(' ').join(', ')})`);
    } else {
        setPrimaryColor('#4f46e5'); // Fallback if CSS variable is not found
    }
  }, []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.x += delta * 0.1;
    }
  });
  
  if (!primaryColor) {
      return null; // Don't render anything until color is determined to prevent flicker
  }

  return (
    <Sphere ref={meshRef} args={[1.5, 32, 32]}>
      <meshStandardMaterial wireframe color={primaryColor} emissive={primaryColor} emissiveIntensity={0.5} />
    </Sphere>
  );
}

export function Globe() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={200} />
        <SpinningGlobe />
    </Canvas>
  );
}
