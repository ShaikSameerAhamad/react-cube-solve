import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CubeState, CubeColor, Move } from '@/lib/kociemba';

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
  moveQueue?: Move[];
  onMoveComplete?: () => void;
}

export function RubiksCube3D({ cubeState, isAnimating = false, currentMove, moveQueue = [], onMoveComplete }: RubiksCube3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    currentMove: Move | null;
    startTime: number;
    duration: number;
    startRotation: THREE.Euler;
    targetRotation: THREE.Euler;
  }>({
    isAnimating: false,
    currentMove: null,
    startTime: 0,
    duration: 300,
    startRotation: new THREE.Euler(),
    targetRotation: new THREE.Euler()
  });

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
            const index = (1 - y) * 3 + (z + 1);
            colors.left = cubeState.L[index] || 'W';
          }
          if (x === 1) { // Right face
            const index = (1 - y) * 3 + (1 - z);
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

  // Parse move string to get rotation info
  const parseMoveString = (move: Move) => {
    const face = move[0];
    const modifier = move.slice(1);
    let angle = Math.PI / 2; // 90 degrees
    
    if (modifier === '2') {
      angle = Math.PI; // 180 degrees
    } else if (modifier === "'") {
      angle = -Math.PI / 2; // -90 degrees
    }
    
    return { face, angle };
  };

  // Start animation for a move
  const startMoveAnimation = (move: Move) => {
    if (!groupRef.current) return;
    
    const { face, angle } = parseMoveString(move);
    const startRotation = groupRef.current.rotation.clone();
    const targetRotation = startRotation.clone();
    
    // Apply rotation based on face
    switch (face) {
      case 'R':
        targetRotation.x += angle;
        break;
      case 'L':
        targetRotation.x -= angle;
        break;
      case 'U':
        targetRotation.y += angle;
        break;
      case 'D':
        targetRotation.y -= angle;
        break;
      case 'F':
        targetRotation.z += angle;
        break;
      case 'B':
        targetRotation.z -= angle;
        break;
    }
    
    setAnimationState({
      isAnimating: true,
      currentMove: move,
      startTime: Date.now(),
      duration: 300,
      startRotation,
      targetRotation
    });
  };

  // Process move queue
  useEffect(() => {
    if (!animationState.isAnimating && moveQueue.length > 0) {
      startMoveAnimation(moveQueue[0]);
    }
  }, [moveQueue, animationState.isAnimating]);

  // Easing function
  const easeInOut = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  useFrame(() => {
    if (animationState.isAnimating && groupRef.current) {
      const elapsed = Date.now() - animationState.startTime;
      const progress = Math.min(elapsed / animationState.duration, 1);
      const easedProgress = easeInOut(progress);
      
      // Interpolate rotation
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        animationState.startRotation.x,
        animationState.targetRotation.x,
        easedProgress
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        animationState.startRotation.y,
        animationState.targetRotation.y,
        easedProgress
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        animationState.startRotation.z,
        animationState.targetRotation.z,
        easedProgress
      );
      
      if (progress >= 1) {
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
        onMoveComplete?.();
      }
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
  moveQueue?: Move[];
  onMoveComplete?: () => void;
}

export function RubiksCubeCanvas({ cubeState, isAnimating, currentMove, moveQueue, onMoveComplete }: RubiksCubeCanvasProps) {
  return (
    <div className="w-full h-96 bg-background border border-border rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />
        <RubiksCube3D 
          cubeState={cubeState} 
          isAnimating={isAnimating} 
          currentMove={currentMove}
          moveQueue={moveQueue}
          onMoveComplete={onMoveComplete}
        />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}