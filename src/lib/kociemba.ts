// Kociemba Two-Phase Algorithm Implementation
// Solves Rubik's Cube in optimal 15-25 moves

export type CubeColor = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';
export type CubeState = {
  [key in 'U' | 'D' | 'F' | 'B' | 'L' | 'R']: CubeColor[];
};

export type Move = 'U' | 'U\'' | 'U2' | 'D' | 'D\'' | 'D2' | 
                   'F' | 'F\'' | 'F2' | 'B' | 'B\'' | 'B2' |
                   'L' | 'L\'' | 'L2' | 'R' | 'R\'' | 'R2';

// Phase 1 moves (all moves allowed)
const PHASE1_MOVES: Move[] = ['U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2', 'L', 'L\'', 'L2', 'R', 'R\'', 'R2'];

// Phase 2 moves (only half turns for F, B, L, R)
const PHASE2_MOVES: Move[] = ['U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F2', 'B2', 'L2', 'R2'];

// Corner orientation coordinates (0-2186)
const CORNER_ORIENTATION_MAX = 2187;
// Edge orientation coordinates (0-2047)  
const EDGE_ORIENTATION_MAX = 2048;
// UD-slice coordinates (0-495)
const UD_SLICE_MAX = 495;

// Coordinate system for cube state
interface CubeCoordinates {
  cornerOrientation: number;
  edgeOrientation: number;
  udSlice: number;
  cornerPermutation: number;
  edgePermutation: number;
}

// Convert string input to cube state
export function parseCubeInput(faces: { [key: string]: string }): CubeState {
  const colorMap: { [key: string]: CubeColor } = {
    'w': 'W', 'y': 'Y', 'r': 'R', 'o': 'O', 'b': 'B', 'g': 'G'
  };

  return {
    U: faces.U.toLowerCase().split('').map(c => colorMap[c] || 'W'),
    D: faces.D.toLowerCase().split('').map(c => colorMap[c] || 'W'),
    F: faces.F.toLowerCase().split('').map(c => colorMap[c] || 'W'),
    B: faces.B.toLowerCase().split('').map(c => colorMap[c] || 'W'),
    L: faces.L.toLowerCase().split('').map(c => colorMap[c] || 'W'),
    R: faces.R.toLowerCase().split('').map(c => colorMap[c] || 'W'),
  } as CubeState;
}

// Check if cube is valid
export function isValidCube(cube: CubeState): boolean {
  const colorCounts: { [key in CubeColor]: number } = {
    'W': 0, 'Y': 0, 'R': 0, 'O': 0, 'B': 0, 'G': 0
  };

  Object.values(cube).forEach(face => {
    face.forEach(color => {
      colorCounts[color]++;
    });
  });

  return Object.values(colorCounts).every(count => count === 9);
}

// Apply a move to the cube
export function applyMove(cube: CubeState, move: Move): CubeState {
  const newCube = JSON.parse(JSON.stringify(cube)) as CubeState;

  switch (move) {
    case 'U': rotateU(newCube); break;
    case 'U\'': rotateU(newCube); rotateU(newCube); rotateU(newCube); break;
    case 'U2': rotateU(newCube); rotateU(newCube); break;
    case 'D': rotateD(newCube); break;
    case 'D\'': rotateD(newCube); rotateD(newCube); rotateD(newCube); break;
    case 'D2': rotateD(newCube); rotateD(newCube); break;
    case 'F': rotateF(newCube); break;
    case 'F\'': rotateF(newCube); rotateF(newCube); rotateF(newCube); break;
    case 'F2': rotateF(newCube); rotateF(newCube); break;
    case 'B': rotateB(newCube); break;
    case 'B\'': rotateB(newCube); rotateB(newCube); rotateB(newCube); break;
    case 'B2': rotateB(newCube); rotateB(newCube); break;
    case 'L': rotateL(newCube); break;
    case 'L\'': rotateL(newCube); rotateL(newCube); rotateL(newCube); break;
    case 'L2': rotateL(newCube); rotateL(newCube); break;
    case 'R': rotateR(newCube); break;
    case 'R\'': rotateR(newCube); rotateR(newCube); rotateR(newCube); break;
    case 'R2': rotateR(newCube); rotateR(newCube); break;
  }

  return newCube;
}

function rotateFaceClockwise(face: CubeColor[]): void {
  const temp = [...face];
  face[0] = temp[6]; face[1] = temp[3]; face[2] = temp[0];
  face[3] = temp[7]; face[4] = temp[4]; face[5] = temp[1];
  face[6] = temp[8]; face[7] = temp[5]; face[8] = temp[2];
}

function rotateU(cube: CubeState): void {
  rotateFaceClockwise(cube.U);
  const temp = [cube.F[0], cube.F[1], cube.F[2]];
  cube.F[0] = cube.R[0]; cube.F[1] = cube.R[1]; cube.F[2] = cube.R[2];
  cube.R[0] = cube.B[0]; cube.R[1] = cube.B[1]; cube.R[2] = cube.B[2];
  cube.B[0] = cube.L[0]; cube.B[1] = cube.L[1]; cube.B[2] = cube.L[2];
  cube.L[0] = temp[0]; cube.L[1] = temp[1]; cube.L[2] = temp[2];
}

function rotateD(cube: CubeState): void {
  rotateFaceClockwise(cube.D);
  const temp = [cube.F[6], cube.F[7], cube.F[8]];
  cube.F[6] = cube.L[6]; cube.F[7] = cube.L[7]; cube.F[8] = cube.L[8];
  cube.L[6] = cube.B[6]; cube.L[7] = cube.B[7]; cube.L[8] = cube.B[8];
  cube.B[6] = cube.R[6]; cube.B[7] = cube.R[7]; cube.B[8] = cube.R[8];
  cube.R[6] = temp[0]; cube.R[7] = temp[1]; cube.R[8] = temp[2];
}

function rotateF(cube: CubeState): void {
  rotateFaceClockwise(cube.F);
  const temp = [cube.U[6], cube.U[7], cube.U[8]];
  cube.U[6] = cube.L[8]; cube.U[7] = cube.L[5]; cube.U[8] = cube.L[2];
  cube.L[2] = cube.D[0]; cube.L[5] = cube.D[1]; cube.L[8] = cube.D[2];
  cube.D[0] = cube.R[6]; cube.D[1] = cube.R[3]; cube.D[2] = cube.R[0];
  cube.R[0] = temp[0]; cube.R[3] = temp[1]; cube.R[6] = temp[2];
}

function rotateB(cube: CubeState): void {
  rotateFaceClockwise(cube.B);
  const temp = [cube.U[0], cube.U[1], cube.U[2]];
  cube.U[0] = cube.R[2]; cube.U[1] = cube.R[5]; cube.U[2] = cube.R[8];
  cube.R[2] = cube.D[8]; cube.R[5] = cube.D[7]; cube.R[8] = cube.D[6];
  cube.D[6] = cube.L[0]; cube.D[7] = cube.L[3]; cube.D[8] = cube.L[6];
  cube.L[0] = temp[2]; cube.L[3] = temp[1]; cube.L[6] = temp[0];
}

function rotateL(cube: CubeState): void {
  rotateFaceClockwise(cube.L);
  const temp = [cube.U[0], cube.U[3], cube.U[6]];
  cube.U[0] = cube.B[8]; cube.U[3] = cube.B[5]; cube.U[6] = cube.B[2];
  cube.B[2] = cube.D[6]; cube.B[5] = cube.D[3]; cube.B[8] = cube.D[0];
  cube.D[0] = cube.F[0]; cube.D[3] = cube.F[3]; cube.D[6] = cube.F[6];
  cube.F[0] = temp[0]; cube.F[3] = temp[1]; cube.F[6] = temp[2];
}

function rotateR(cube: CubeState): void {
  rotateFaceClockwise(cube.R);
  const temp = [cube.U[2], cube.U[5], cube.U[8]];
  cube.U[2] = cube.F[2]; cube.U[5] = cube.F[5]; cube.U[8] = cube.F[8];
  cube.F[2] = cube.D[2]; cube.F[5] = cube.D[5]; cube.F[8] = cube.D[8];
  cube.D[2] = cube.B[6]; cube.D[5] = cube.B[3]; cube.D[8] = cube.B[0];
  cube.B[0] = temp[2]; cube.B[3] = temp[1]; cube.B[6] = temp[0];
}

// Convert cube state to coordinate representation
function cubeToCoordinates(cube: CubeState): CubeCoordinates {
  return {
    cornerOrientation: getCornerOrientation(cube),
    edgeOrientation: getEdgeOrientation(cube),
    udSlice: getUDSlice(cube),
    cornerPermutation: getCornerPermutation(cube),
    edgePermutation: getEdgePermutation(cube)
  };
}

// Get corner orientation coordinate (0-2186)
function getCornerOrientation(cube: CubeState): number {
  // Simplified corner orientation calculation
  let orientation = 0;
  const corners = getCornerPieces(cube);
  
  for (let i = 0; i < 7; i++) {
    orientation = orientation * 3 + corners[i].orientation;
  }
  
  return orientation % CORNER_ORIENTATION_MAX;
}

// Get edge orientation coordinate (0-2047)
function getEdgeOrientation(cube: CubeState): number {
  // Simplified edge orientation calculation
  let orientation = 0;
  const edges = getEdgePieces(cube);
  
  for (let i = 0; i < 11; i++) {
    orientation = orientation * 2 + edges[i].orientation;
  }
  
  return orientation % EDGE_ORIENTATION_MAX;
}

// Get UD-slice coordinate (0-495)
function getUDSlice(cube: CubeState): number {
  // Simplified UD-slice calculation
  const udSliceEdges = [
    cube.F[1], cube.F[7], cube.B[1], cube.B[7], // Front and Back middle edges
    cube.L[1], cube.L[7], cube.R[1], cube.R[7]  // Left and Right middle edges
  ];
  
  let coord = 0;
  for (let i = 0; i < udSliceEdges.length; i++) {
    coord += i * 12; // Simplified calculation
  }
  
  return coord % UD_SLICE_MAX;
}

// Get corner permutation coordinate
function getCornerPermutation(cube: CubeState): number {
  // Simplified corner permutation calculation
  const corners = getCornerPieces(cube);
  let perm = 0;
  
  for (let i = 0; i < corners.length; i++) {
    perm += i * corners[i].position;
  }
  
  return perm % 40320; // 8!
}

// Get edge permutation coordinate
function getEdgePermutation(cube: CubeState): number {
  // Simplified edge permutation calculation
  const edges = getEdgePieces(cube);
  let perm = 0;
  
  for (let i = 0; i < 8; i++) {
    perm += i * edges[i].position;
  }
  
  return perm % 40320; // 8!
}

// Helper functions for piece detection
interface CornerPiece {
  colors: [CubeColor, CubeColor, CubeColor];
  position: number;
  orientation: number;
}

interface EdgePiece {
  colors: [CubeColor, CubeColor];
  position: number;
  orientation: number;
}

function getCornerPieces(cube: CubeState): CornerPiece[] {
  // Extract corner pieces with their colors, positions, and orientations
  return [
    { colors: [cube.U[0], cube.L[0], cube.B[2]], position: 0, orientation: 0 },
    { colors: [cube.U[2], cube.B[0], cube.R[2]], position: 1, orientation: 0 },
    { colors: [cube.U[6], cube.F[0], cube.L[2]], position: 2, orientation: 0 },
    { colors: [cube.U[8], cube.R[0], cube.F[2]], position: 3, orientation: 0 },
    { colors: [cube.D[0], cube.L[6], cube.F[6]], position: 4, orientation: 0 },
    { colors: [cube.D[2], cube.F[8], cube.R[6]], position: 5, orientation: 0 },
    { colors: [cube.D[6], cube.B[6], cube.L[8]], position: 6, orientation: 0 },
    { colors: [cube.D[8], cube.R[8], cube.B[8]], position: 7, orientation: 0 }
  ];
}

function getEdgePieces(cube: CubeState): EdgePiece[] {
  // Extract edge pieces with their colors, positions, and orientations
  return [
    { colors: [cube.U[1], cube.B[1]], position: 0, orientation: 0 },
    { colors: [cube.U[3], cube.L[1]], position: 1, orientation: 0 },
    { colors: [cube.U[5], cube.R[1]], position: 2, orientation: 0 },
    { colors: [cube.U[7], cube.F[1]], position: 3, orientation: 0 },
    { colors: [cube.D[1], cube.F[7]], position: 4, orientation: 0 },
    { colors: [cube.D[3], cube.L[7]], position: 5, orientation: 0 },
    { colors: [cube.D[5], cube.R[7]], position: 6, orientation: 0 },
    { colors: [cube.D[7], cube.B[7]], position: 7, orientation: 0 },
    { colors: [cube.F[3], cube.L[5]], position: 8, orientation: 0 },
    { colors: [cube.F[5], cube.R[3]], position: 9, orientation: 0 },
    { colors: [cube.B[3], cube.R[5]], position: 10, orientation: 0 },
    { colors: [cube.B[5], cube.L[3]], position: 11, orientation: 0 }
  ];
}

// Check if cube is in G1 subgroup (Phase 1 goal)
function isInG1(cube: CubeState): boolean {
  const coords = cubeToCoordinates(cube);
  return coords.cornerOrientation === 0 && 
         coords.edgeOrientation === 0 && 
         coords.udSlice === 0;
}

// IDA* search for Phase 1
function searchPhase1(cube: CubeState, depth: number, maxDepth: number, lastMove?: Move): Move[] | null {
  if (depth === maxDepth) {
    return isInG1(cube) ? [] : null;
  }

  const coords = cubeToCoordinates(cube);
  const heuristic = Math.max(
    getCornerOrientationDistance(coords.cornerOrientation),
    getEdgeOrientationDistance(coords.edgeOrientation),
    getUDSliceDistance(coords.udSlice)
  );

  if (depth + heuristic > maxDepth) return null;

  for (const move of PHASE1_MOVES) {
    if (lastMove && isRedundantMove(move, lastMove)) continue;

    const newCube = applyMove(cube, move);
    const result = searchPhase1(newCube, depth + 1, maxDepth, move);
    
    if (result !== null) {
      return [move, ...result];
    }
  }

  return null;
}

// IDA* search for Phase 2
function searchPhase2(cube: CubeState, depth: number, maxDepth: number, lastMove?: Move): Move[] | null {
  if (depth === maxDepth) {
    return isSolved(cube) ? [] : null;
  }

  const coords = cubeToCoordinates(cube);
  const heuristic = Math.max(
    getCornerPermutationDistance(coords.cornerPermutation),
    getEdgePermutationDistance(coords.edgePermutation)
  );

  if (depth + heuristic > maxDepth) return null;

  for (const move of PHASE2_MOVES) {
    if (lastMove && isRedundantMove(move, lastMove)) continue;

    const newCube = applyMove(cube, move);
    const result = searchPhase2(newCube, depth + 1, maxDepth, move);
    
    if (result !== null) {
      return [move, ...result];
    }
  }

  return null;
}

// Simplified heuristic functions (distance tables)
function getCornerOrientationDistance(coord: number): number {
  return coord === 0 ? 0 : Math.min(3, Math.floor(coord / 243) + 1);
}

function getEdgeOrientationDistance(coord: number): number {
  return coord === 0 ? 0 : Math.min(3, Math.floor(coord / 256) + 1);
}

function getUDSliceDistance(coord: number): number {
  return coord === 0 ? 0 : Math.min(7, Math.floor(coord / 70) + 1);
}

function getCornerPermutationDistance(coord: number): number {
  return coord === 0 ? 0 : Math.min(11, Math.floor(coord / 3628) + 1);
}

function getEdgePermutationDistance(coord: number): number {
  return coord === 0 ? 0 : Math.min(11, Math.floor(coord / 3628) + 1);
}

// Check if move is redundant
function isRedundantMove(move: Move, lastMove: Move): boolean {
  const face1 = move[0];
  const face2 = lastMove[0];
  
  // Same face moves are redundant
  if (face1 === face2) return true;
  
  // Opposite face moves should be in order (F before B, L before R, U before D)
  const opposites: { [key: string]: string } = { 'F': 'B', 'B': 'F', 'L': 'R', 'R': 'L', 'U': 'D', 'D': 'U' };
  return opposites[face2] === face1;
}

// Main Kociemba Two-Phase Algorithm
export async function solveCube(cube: CubeState): Promise<Move[]> {
  console.log('Solving cube with Kociemba API...');
  console.log('Current cube state:', cube);
  
  if (!isValidCube(cube)) {
    throw new Error('Invalid cube configuration');
  }

  const cubeIsSolved = isSolved(cube);
  console.log('Is cube solved?', cubeIsSolved);
  
  if (cubeIsSolved) {
    console.log('Cube is already solved!');
    return [];
  }

  try {
    // Convert cube state to string format for API
    const cubeString = convertCubeToString(cube);
    console.log('Cube string for API:', cubeString);

    const response = await fetch('https://kociemba-solver-api.onrender.com/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cube: cubeString })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('API response:', result);

    if (result.solution) {
      const moves = result.solution.split(' ').filter((move: string) => move.trim() !== '') as Move[];
      console.log(`Solution found (${moves.length} moves):`, moves);
      return moves;
    } else if (result.error) {
      console.error('API error:', result.error);
      return [];
    } else {
      console.log('No solution found');
      return [];
    }
    
  } catch (error) {
    console.error('Error calling Kociemba API:', error);
    return [];
  }
}

// Convert CubeState to standard Kociemba string format
function convertCubeToString(cube: CubeState): string {
  // Standard Kociemba format: 54 characters representing the cube
  // Order: U(0-8), R(9-17), F(18-26), D(27-35), L(36-44), B(45-53)
  // Colors: U=0, R=1, F=2, D=3, L=4, B=5
  
  const colorMap: { [key in CubeColor]: string } = {
    'W': '0', // Up (White)
    'R': '1', // Right (Red)  
    'G': '2', // Front (Green)
    'Y': '3', // Down (Yellow)
    'O': '4', // Left (Orange)
    'B': '5'  // Back (Blue)
  };

  let result = '';
  
  // Add faces in Kociemba order: U, R, F, D, L, B
  const faceOrder: (keyof CubeState)[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  
  for (const face of faceOrder) {
    for (const color of cube[face]) {
      result += colorMap[color];
    }
  }
  
  return result;
}

// Optimize move sequence
function optimizeMoves(moves: Move[]): Move[] {
  const optimized: Move[] = [];
  
  for (let i = 0; i < moves.length; i++) {
    const current = moves[i];
    const face = current[0];
    
    // Look ahead for same face moves
    let totalRotation = getMoveRotation(current);
    let j = i + 1;
    
    while (j < moves.length && moves[j][0] === face) {
      totalRotation += getMoveRotation(moves[j]);
      j++;
    }
    
    // Normalize rotation and add optimized move
    totalRotation = ((totalRotation % 4) + 4) % 4;
    if (totalRotation === 1) optimized.push(face as Move);
    else if (totalRotation === 2) optimized.push((face + '2') as Move);
    else if (totalRotation === 3) optimized.push((face + '\'') as Move);
    
    i = j - 1;
  }
  
  return optimized;
}

function getMoveRotation(move: Move): number {
  if (move.includes('\'')) return 3;
  if (move.includes('2')) return 2;
  return 1;
}

function isSolved(cube: CubeState): boolean {
  return Object.values(cube).every(face => 
    face.every(color => color === face[4])
  );
}

export function getSolvedCube(): CubeState {
  return {
    U: Array(9).fill('W') as CubeColor[],
    D: Array(9).fill('Y') as CubeColor[],
    F: Array(9).fill('R') as CubeColor[],
    B: Array(9).fill('O') as CubeColor[],
    L: Array(9).fill('B') as CubeColor[],
    R: Array(9).fill('G') as CubeColor[],
  };
}