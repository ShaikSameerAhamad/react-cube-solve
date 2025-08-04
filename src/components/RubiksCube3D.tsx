import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CubeState, CubeColor, Move } from '@/lib/kociemba';

interface CubieProps {
  position: [number, number, number];
  colors: { [face: string]: CubeColor };
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
  const cubieRefs = useRef<THREE.Mesh[]>([]);
  
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    currentMove: Move | null;
    startTime: number;
    duration: number;
    targetAngle: number;
    axis: 'x' | 'y' | 'z';
    face: string;
    animatingCubies: number[];
  } | null>(null);

  // Generate cubie colors and positions based on cube state
  const generateCubieColors = () => {
    const cubies: { position: [number, number, number]; colors: { [face: string]: CubeColor } }[] = [];
    
    // Generate 27 cubies (3x3x3)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const colors: { [face: string]: CubeColor } = {};
          
          // Map cube state to cubie positions
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

  // Get cubies that belong to a face
  const getCubiesForFace = (face: string): number[] => {
    const indices: number[] = [];
    
    cubies.forEach((cubie, index) => {
      const [x, y, z] = cubie.position;
      
      switch (face) {
        case 'R':
          if (Math.abs(x - 1.02) < 0.01) indices.push(index);
          break;
        case 'L':
          if (Math.abs(x + 1.02) < 0.01) indices.push(index);
          break;
        case 'U':
          if (Math.abs(y - 1.02) < 0.01) indices.push(index);
          break;
        case 'D':
          if (Math.abs(y + 1.02) < 0.01) indices.push(index);
          break;
        case 'F':
          if (Math.abs(z - 1.02) < 0.01) indices.push(index);
          break;
        case 'B':
          if (Math.abs(z + 1.02) < 0.01) indices.push(index);
          break;
      }
    });
    
    return indices;
  };

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
    
    let axis: 'x' | 'y' | 'z' = 'y';
    switch (face) {
      case 'R':
        axis = 'x';
        break;
      case 'L':
        axis = 'x';
        angle = -angle;
        break;
      case 'U':
        axis = 'y';
        break;
      case 'D':
        axis = 'y';
        angle = -angle;
        break;
      case 'F':
        axis = 'z';
        break;
      case 'B':
        axis = 'z';
        angle = -angle;
        break;
    }
    
    return { face, angle, axis };
  };

  // Start animation for a move
  const startMoveAnimation = (move: Move) => {
    const { face, angle, axis } = parseMoveString(move);
    const animatingCubies = getCubiesForFace(face);
    
    setAnimationState({
      isAnimating: true,
      currentMove: move,
      startTime: Date.now(),
      duration: 300,
      targetAngle: angle,
      axis,
      face,
      animatingCubies
    });
  };

  // Process move queue
  useEffect(() => {
    if ((!animationState || !animationState.isAnimating) && moveQueue.length > 0) {
      startMoveAnimation(moveQueue[0]);
    }
  }, [moveQueue, animationState]);

  // Easing function
  const easeInOut = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  useFrame(() => {
    if (animationState?.isAnimating && cubieRefs.current.length > 0) {
      const elapsed = Date.now() - animationState.startTime;
      const progress = Math.min(elapsed / animationState.duration, 1);
      const easedProgress = easeInOut(progress);
      
      const currentAngle = animationState.targetAngle * easedProgress;
      
      // Get center point for rotation
      let center = new THREE.Vector3();
      switch (animationState.face) {
        case 'R':
          center.set(1.02, 0, 0);
          break;
        case 'L':
          center.set(-1.02, 0, 0);
          break;
        case 'U':
          center.set(0, 1.02, 0);
          break;
        case 'D':
          center.set(0, -1.02, 0);
          break;
        case 'F':
          center.set(0, 0, 1.02);
          break;
        case 'B':
          center.set(0, 0, -1.02);
          break;
      }
      
      // Rotate the animating cubies
      animationState.animatingCubies.forEach(cubieIndex => {
        const cubie = cubieRefs.current[cubieIndex];
        if (cubie) {
          // Get original position
          const originalPos = new THREE.Vector3(...cubies[cubieIndex].position);
          
          // Translate to origin
          const relativePos = originalPos.clone().sub(center);
          
          // Create rotation matrix
          let rotationMatrix = new THREE.Matrix4();
          if (animationState.axis === 'x') {
            rotationMatrix.makeRotationX(currentAngle);
          } else if (animationState.axis === 'y') {
            rotationMatrix.makeRotationY(currentAngle);
          } else if (animationState.axis === 'z') {
            rotationMatrix.makeRotationZ(currentAngle);
          }
          
          // Apply rotation
          relativePos.applyMatrix4(rotationMatrix);
          
          // Translate back and set position
          const finalPos = relativePos.add(center);
          cubie.position.copy(finalPos);
          
          // Also rotate the cubie itself
          cubie.rotation.set(0, 0, 0);
          if (animationState.axis === 'x') {
            cubie.rotation.x = currentAngle;
          } else if (animationState.axis === 'y') {
            cubie.rotation.y = currentAngle;
          } else if (animationState.axis === 'z') {
            cubie.rotation.z = currentAngle;
          }
        }
      });
      
      if (progress >= 1) {
        // Reset positions and rotations
        animationState.animatingCubies.forEach(cubieIndex => {
          const cubie = cubieRefs.current[cubieIndex];
          if (cubie) {
            cubie.position.set(...cubies[cubieIndex].position);
            cubie.rotation.set(0, 0, 0);
          }
        });
        
        setAnimationState(null);
        onMoveComplete?.();
      }
    }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((cubie, index) => (
        <mesh
          key={index}
          ref={(ref) => {
            if (ref) cubieRefs.current[index] = ref;
          }}
          position={cubie.position}
        >
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshLambertMaterial color={colorMap[cubie.colors.right || 'W']} attach="material-0" />
          <meshLambertMaterial color={colorMap[cubie.colors.left || 'W']} attach="material-1" />
          <meshLambertMaterial color={colorMap[cubie.colors.top || 'W']} attach="material-2" />
          <meshLambertMaterial color={colorMap[cubie.colors.bottom || 'W']} attach="material-3" />
          <meshLambertMaterial color={colorMap[cubie.colors.front || 'W']} attach="material-4" />
          <meshLambertMaterial color={colorMap[cubie.colors.back || 'W']} attach="material-5" />
        </mesh>
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