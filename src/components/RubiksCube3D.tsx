import { useRef, useEffect, useState, useCallback } from 'react';
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

interface AnimationState {
  isAnimating: boolean;
  targetRotation: number;
  currentRotation: number;
  startRotation: number;
  startTime: number;
  duration: number;
  axis: 'x' | 'y' | 'z';
  face: string;
  onComplete?: () => void;
}

interface RubiksCube3DProps {
  cubeState: CubeState;
  isAnimating?: boolean;
  currentMove?: string;
  onMoveComplete?: () => void;
  moveQueue?: string[];
}

export function RubiksCube3D({ cubeState, isAnimating = false, currentMove, onMoveComplete, moveQueue = [] }: RubiksCube3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const faceGroupsRef = useRef<{ [key: string]: THREE.Group }>({});
  const [rotationSpeed] = useState(0.01);
  const [animationState, setAnimationState] = useState<AnimationState | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // Parse move notation to get rotation details
  const parseMoveNotation = useCallback((move: string) => {
    const baseFace = move.charAt(0);
    const modifier = move.slice(1);
    
    let angle = Math.PI / 2; // 90 degrees
    if (modifier === '2') angle = Math.PI; // 180 degrees
    if (modifier === "'") angle = -Math.PI / 2; // -90 degrees
    
    const faceConfig: { [key: string]: { axis: 'x' | 'y' | 'z'; direction: number } } = {
      'R': { axis: 'x', direction: 1 },
      'L': { axis: 'x', direction: -1 },
      'U': { axis: 'y', direction: 1 },
      'D': { axis: 'y', direction: -1 },
      'F': { axis: 'z', direction: 1 },
      'B': { axis: 'z', direction: -1 }
    };
    
    const config = faceConfig[baseFace];
    if (!config) return null;
    
    return {
      face: baseFace,
      axis: config.axis,
      angle: angle * config.direction
    };
  }, []);

  // Easing function for smooth animation
  const easeInOut = useCallback((t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }, []);

  // Get cubies that belong to a specific face
  const getFaceCubies = useCallback((face: string) => {
    const faceCubies: number[] = [];
    const cubies = generateCubieColors();
    
    cubies.forEach((cubie, index) => {
      const [x, y, z] = cubie.position;
      const tolerance = 0.5;
      
      switch (face) {
        case 'R':
          if (x > tolerance) faceCubies.push(index);
          break;
        case 'L':
          if (x < -tolerance) faceCubies.push(index);
          break;
        case 'U':
          if (y > tolerance) faceCubies.push(index);
          break;
        case 'D':
          if (y < -tolerance) faceCubies.push(index);
          break;
        case 'F':
          if (z > tolerance) faceCubies.push(index);
          break;
        case 'B':
          if (z < -tolerance) faceCubies.push(index);
          break;
      }
    });
    
    return faceCubies;
  }, []);

  // Start animation for a move
  const startMoveAnimation = useCallback((move: string) => {
    const moveConfig = parseMoveNotation(move);
    if (!moveConfig) return;
    
    setAnimationState({
      isAnimating: true,
      targetRotation: moveConfig.angle,
      currentRotation: 0,
      startRotation: 0,
      startTime: Date.now(),
      duration: 300, // 300ms per move
      axis: moveConfig.axis,
      face: moveConfig.face,
      onComplete: () => {
        setAnimationState(null);
        onMoveComplete?.();
      }
    });
  }, [parseMoveNotation, onMoveComplete]);

  // Process move queue
  useEffect(() => {
    if (!animationState && moveQueue.length > 0 && currentMoveIndex < moveQueue.length) {
      const nextMove = moveQueue[currentMoveIndex];
      startMoveAnimation(nextMove);
      setCurrentMoveIndex(prev => prev + 1);
    } else if (currentMoveIndex >= moveQueue.length && moveQueue.length > 0) {
      setCurrentMoveIndex(0);
    }
  }, [animationState, moveQueue, currentMoveIndex, startMoveAnimation]);

  // Process single current move
  useEffect(() => {
    if (currentMove && !animationState && !moveQueue.length) {
      startMoveAnimation(currentMove);
    }
  }, [currentMove, animationState, moveQueue.length, startMoveAnimation]);

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

  // Initialize face rotation groups
  useEffect(() => {
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    faces.forEach(face => {
      if (!faceGroupsRef.current[face]) {
        faceGroupsRef.current[face] = new THREE.Group();
      }
    });
  }, []);

  useFrame(() => {
    // Handle animation
    if (animationState && animationState.isAnimating) {
      const elapsed = Date.now() - animationState.startTime;
      const progress = Math.min(elapsed / animationState.duration, 1);
      const easedProgress = easeInOut(progress);
      
      const currentRotation = animationState.startRotation + 
        (animationState.targetRotation - animationState.startRotation) * easedProgress;
      
      // Apply rotation to the face group
      const faceGroup = faceGroupsRef.current[animationState.face];
      if (faceGroup) {
        faceGroup.rotation.set(0, 0, 0);
        if (animationState.axis === 'x') faceGroup.rotation.x = currentRotation;
        if (animationState.axis === 'y') faceGroup.rotation.y = currentRotation;
        if (animationState.axis === 'z') faceGroup.rotation.z = currentRotation;
      }
      
      // Check if animation is complete
      if (progress >= 1) {
        setAnimationState(prev => prev ? { ...prev, isAnimating: false } : null);
        setTimeout(() => {
          animationState.onComplete?.();
        }, 0);
      }
    }

    // Idle rotation disabled for better move visibility
    // if (!animationState?.isAnimating && groupRef.current) {
    //   groupRef.current.rotation.y += rotationSpeed;
    // }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((cubie, index) => {
        const [x, y, z] = cubie.position;
        const tolerance = 0.5;
        
        // Determine which face groups this cubie belongs to
        let faceGroup = null;
        
        if (animationState?.isAnimating) {
          const face = animationState.face;
          switch (face) {
            case 'R':
              if (x > tolerance) faceGroup = faceGroupsRef.current[face];
              break;
            case 'L':
              if (x < -tolerance) faceGroup = faceGroupsRef.current[face];
              break;
            case 'U':
              if (y > tolerance) faceGroup = faceGroupsRef.current[face];
              break;
            case 'D':
              if (y < -tolerance) faceGroup = faceGroupsRef.current[face];
              break;
            case 'F':
              if (z > tolerance) faceGroup = faceGroupsRef.current[face];
              break;
            case 'B':
              if (z < -tolerance) faceGroup = faceGroupsRef.current[face];
              break;
          }
        }
        
        const CubieComponent = (
          <Cubie
            key={index}
            position={cubie.position}
            colors={cubie.colors}
          />
        );
        
        // If this cubie is part of the animating face, wrap it in the face group
        if (faceGroup) {
          return (
            <primitive key={`face-${index}`} object={faceGroup}>
              {CubieComponent}
            </primitive>
          );
        }
        
        return CubieComponent;
      })}
    </group>
  );
}

interface RubiksCubeCanvasProps {
  cubeState: CubeState;
  isAnimating?: boolean;
  currentMove?: string;
  onMoveComplete?: () => void;
  moveQueue?: string[];
}

export function RubiksCubeCanvas({ cubeState, isAnimating, currentMove, onMoveComplete, moveQueue }: RubiksCubeCanvasProps) {
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
          onMoveComplete={onMoveComplete}
          moveQueue={moveQueue}
        />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}