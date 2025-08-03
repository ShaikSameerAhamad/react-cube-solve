import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CubeState, CubeColor } from '@/lib/kociemba';

interface CubieProps {
  position: [number, number, number];
  colors: { [face: string]: CubeColor };
  rotationGroup?: THREE.Group;
}

const colorMap = {
  'W': '#ffffff',
  'Y': '#ffff00', 
  'R': '#ff0000',
  'O': '#ff8000',
  'B': '#0000ff',
  'G': '#00ff00'
};

function Cubie({ position, colors }: CubieProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create materials for each face
  const materials = [
    new THREE.MeshLambertMaterial({ color: colorMap[colors.right || 'W'] }), // Right
    new THREE.MeshLambertMaterial({ color: colorMap[colors.left || 'W'] }),  // Left
    new THREE.MeshLambertMaterial({ color: colorMap[colors.top || 'W'] }),   // Top
    new THREE.MeshLambertMaterial({ color: colorMap[colors.bottom || 'W'] }), // Bottom
    new THREE.MeshLambertMaterial({ color: colorMap[colors.front || 'W'] }), // Front
    new THREE.MeshLambertMaterial({ color: colorMap[colors.back || 'W'] }),  // Back
  ];

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {materials.map((material, index) => (
        <primitive key={index} object={material} attach={`material-${index}`} />
      ))}
    </mesh>
  );
}

interface RubiksCube3DProps {
  cubeState: CubeState;
  isAnimating?: boolean;
  currentMove?: string;
}

export function RubiksCube3D({ cubeState, isAnimating = false, currentMove }: RubiksCube3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationSpeed] = useState(0.01);

  // Generate cubie colors based on cube state
  const generateCubieColors = () => {
    const cubies: { position: [number, number, number]; colors: { [face: string]: CubeColor } }[] = [];
    
    // Generate 27 cubies (3x3x3)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const colors: { [face: string]: CubeColor } = {};
          
          // Map cube state to cubie positions
          // This is a simplified mapping - in a real implementation,
          // you'd need more complex position-to-face mapping
          
          if (y === 1) { // Top face
            const index = (z + 1) * 3 + (x + 1);
            colors.top = cubeState.U[index] || 'W';
          }
          if (y === -1) { // Bottom face
            const index = (1 - z) * 3 + (x + 1);
            colors.bottom = cubeState.D[index] || 'W';
          }
          if (z === 1) { // Front face
            const index = (1 - y) * 3 + (x + 1);
            colors.front = cubeState.F[index] || 'W';
          }
          if (z === -1) { // Back face
            const index = (1 - y) * 3 + (1 - x);
            colors.back = cubeState.B[index] || 'W';
          }
          if (x === -1) { // Left face
            const index = (1 - y) * 3 + (1 - z);
            colors.left = cubeState.L[index] || 'W';
          }
          if (x === 1) { // Right face
            const index = (1 - y) * 3 + (z + 1);
            colors.right = cubeState.R[index] || 'W';
          }
          
          cubies.push({
            position: [x * 1.02, y * 1.02, z * 1.02],
            colors
          });
        }
      }
    }
    
    return cubies;
  };

  const cubies = generateCubieColors();

  useFrame(() => {
    if (!isAnimating && groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((cubie, index) => (
        <Cubie
          key={index}
          position={cubie.position}
          colors={cubie.colors}
        />
      ))}
    </group>
  );
}

interface RubiksCubeCanvasProps {
  cubeState: CubeState;
  isAnimating?: boolean;
  currentMove?: string;
}

export function RubiksCubeCanvas({ cubeState, isAnimating, currentMove }: RubiksCubeCanvasProps) {
  return (
    <div className="w-full h-96 bg-background border border-border rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />
        <RubiksCube3D cubeState={cubeState} isAnimating={isAnimating} currentMove={currentMove} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}