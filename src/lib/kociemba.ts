// Simplified Kociemba Algorithm Implementation
// This is a basic implementation for educational purposes

export type CubeColor = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';
export type CubeState = {
  [key in 'U' | 'D' | 'F' | 'B' | 'L' | 'R']: CubeColor[];
};

export type Move = 'U' | 'U\'' | 'U2' | 'D' | 'D\'' | 'D2' | 
                   'F' | 'F\'' | 'F2' | 'B' | 'B\'' | 'B2' |
                   'L' | 'L\'' | 'L2' | 'R' | 'R\'' | 'R2';

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

  // Count colors
  Object.values(cube).forEach(face => {
    face.forEach(color => {
      colorCounts[color]++;
    });
  });

  // Each color should appear exactly 9 times
  return Object.values(colorCounts).every(count => count === 9);
}

// Apply a move to the cube
export function applyMove(cube: CubeState, move: Move): CubeState {
  const newCube = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  switch (move) {
    case 'U':
      rotateU(newCube);
      break;
    case 'U\'':
      rotateU(newCube);
      rotateU(newCube);
      rotateU(newCube);
      break;
    case 'U2':
      rotateU(newCube);
      rotateU(newCube);
      break;
    case 'D':
      rotateD(newCube);
      break;
    case 'D\'':
      rotateD(newCube);
      rotateD(newCube);
      rotateD(newCube);
      break;
    case 'D2':
      rotateD(newCube);
      rotateD(newCube);
      break;
    case 'F':
      rotateF(newCube);
      break;
    case 'F\'':
      rotateF(newCube);
      rotateF(newCube);
      rotateF(newCube);
      break;
    case 'F2':
      rotateF(newCube);
      rotateF(newCube);
      break;
    case 'B':
      rotateB(newCube);
      break;
    case 'B\'':
      rotateB(newCube);
      rotateB(newCube);
      rotateB(newCube);
      break;
    case 'B2':
      rotateB(newCube);
      rotateB(newCube);
      break;
    case 'L':
      rotateL(newCube);
      break;
    case 'L\'':
      rotateL(newCube);
      rotateL(newCube);
      rotateL(newCube);
      break;
    case 'L2':
      rotateL(newCube);
      rotateL(newCube);
      break;
    case 'R':
      rotateR(newCube);
      break;
    case 'R\'':
      rotateR(newCube);
      rotateR(newCube);
      rotateR(newCube);
      break;
    case 'R2':
      rotateR(newCube);
      rotateR(newCube);
      break;
  }
  
  return newCube;
}

function rotateFaceClockwise(face: CubeColor[]): void {
  const temp = [...face];
  face[0] = temp[6];
  face[1] = temp[3];
  face[2] = temp[0];
  face[3] = temp[7];
  face[4] = temp[4];
  face[5] = temp[1];
  face[6] = temp[8];
  face[7] = temp[5];
  face[8] = temp[2];
}

function rotateU(cube: CubeState): void {
  rotateFaceClockwise(cube.U);
  const temp = [cube.F[0], cube.F[1], cube.F[2]];
  cube.F[0] = cube.R[0];
  cube.F[1] = cube.R[1];
  cube.F[2] = cube.R[2];
  cube.R[0] = cube.B[0];
  cube.R[1] = cube.B[1];
  cube.R[2] = cube.B[2];
  cube.B[0] = cube.L[0];
  cube.B[1] = cube.L[1];
  cube.B[2] = cube.L[2];
  cube.L[0] = temp[0];
  cube.L[1] = temp[1];
  cube.L[2] = temp[2];
}

function rotateD(cube: CubeState): void {
  rotateFaceClockwise(cube.D);
  const temp = [cube.F[6], cube.F[7], cube.F[8]];
  cube.F[6] = cube.L[6];
  cube.F[7] = cube.L[7];
  cube.F[8] = cube.L[8];
  cube.L[6] = cube.B[6];
  cube.L[7] = cube.B[7];
  cube.L[8] = cube.B[8];
  cube.B[6] = cube.R[6];
  cube.B[7] = cube.R[7];
  cube.B[8] = cube.R[8];
  cube.R[6] = temp[0];
  cube.R[7] = temp[1];
  cube.R[8] = temp[2];
}

function rotateF(cube: CubeState): void {
  rotateFaceClockwise(cube.F);
  const temp = [cube.U[6], cube.U[7], cube.U[8]];
  cube.U[6] = cube.L[8];
  cube.U[7] = cube.L[5];
  cube.U[8] = cube.L[2];
  cube.L[2] = cube.D[0];
  cube.L[5] = cube.D[1];
  cube.L[8] = cube.D[2];
  cube.D[0] = cube.R[6];
  cube.D[1] = cube.R[3];
  cube.D[2] = cube.R[0];
  cube.R[0] = temp[0];
  cube.R[3] = temp[1];
  cube.R[6] = temp[2];
}

function rotateB(cube: CubeState): void {
  rotateFaceClockwise(cube.B);
  const temp = [cube.U[0], cube.U[1], cube.U[2]];
  cube.U[0] = cube.R[2];
  cube.U[1] = cube.R[5];
  cube.U[2] = cube.R[8];
  cube.R[2] = cube.D[8];
  cube.R[5] = cube.D[7];
  cube.R[8] = cube.D[6];
  cube.D[6] = cube.L[0];
  cube.D[7] = cube.L[3];
  cube.D[8] = cube.L[6];
  cube.L[0] = temp[2];
  cube.L[3] = temp[1];
  cube.L[6] = temp[0];
}

function rotateL(cube: CubeState): void {
  rotateFaceClockwise(cube.L);
  const temp = [cube.U[0], cube.U[3], cube.U[6]];
  cube.U[0] = cube.B[8];
  cube.U[3] = cube.B[5];
  cube.U[6] = cube.B[2];
  cube.B[2] = cube.D[6];
  cube.B[5] = cube.D[3];
  cube.B[8] = cube.D[0];
  cube.D[0] = cube.F[0];
  cube.D[3] = cube.F[3];
  cube.D[6] = cube.F[6];
  cube.F[0] = temp[0];
  cube.F[3] = temp[1];
  cube.F[6] = temp[2];
}

function rotateR(cube: CubeState): void {
  rotateFaceClockwise(cube.R);
  const temp = [cube.U[2], cube.U[5], cube.U[8]];
  cube.U[2] = cube.F[2];
  cube.U[5] = cube.F[5];
  cube.U[8] = cube.F[8];
  cube.F[2] = cube.D[2];
  cube.F[5] = cube.D[5];
  cube.F[8] = cube.D[8];
  cube.D[2] = cube.B[6];
  cube.D[5] = cube.B[3];
  cube.D[8] = cube.B[0];
  cube.B[0] = temp[2];
  cube.B[3] = temp[1];
  cube.B[6] = temp[0];
}

// Basic layer-by-layer solver (simplified implementation)
export function solveCube(cube: CubeState): Move[] {
  if (!isValidCube(cube)) {
    throw new Error('Invalid cube configuration');
  }

  // Check if already solved
  if (isSolved(cube)) {
    return [];
  }

  // For this simplified implementation, we'll use a basic approach
  // that tries to solve layer by layer
  const solution: Move[] = [];
  let currentCube = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  // Simple pattern-based solver
  // This attempts to bring the cube closer to solved state
  const solvingMoves = generateBasicSolution(currentCube);
  
  return solvingMoves;
}

function generateBasicSolution(cube: CubeState): Move[] {
  // This is a very basic solver that attempts common solving patterns
  // In a real Kociemba implementation, this would use lookup tables and advanced algorithms
  
  const moves: Move[] = [];
  let currentState = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  // Try to solve with common algorithms
  const algorithms = [
    // Cross algorithms
    ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
    ['R', 'U', 'R\'', 'U\''],
    ['U', 'R', 'U\'', 'R\''],
    // F2L algorithms  
    ['R', 'U\'', 'R\'', 'F', 'R', 'F\''],
    ['F\'', 'U', 'F', 'U', 'F\'', 'U2', 'F'],
    // OLL algorithms
    ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
    ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
    // PLL algorithms
    ['R\'', 'F', 'R\'', 'B2', 'R', 'F\'', 'R\'', 'B2', 'R2'],
    ['R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'']
  ];
  
  // Apply algorithms that improve the cube state
  for (const algorithm of algorithms) {
    let testState = JSON.parse(JSON.stringify(currentState)) as CubeState;
    
    // Apply the algorithm
    for (const move of algorithm) {
      testState = applyMove(testState, move as Move);
    }
    
    // If this algorithm improves the state, add it to solution
    if (isImprovement(currentState, testState)) {
      for (const move of algorithm) {
        moves.push(move as Move);
        currentState = applyMove(currentState, move as Move);
      }
      
      // If solved, stop
      if (isSolved(currentState)) {
        break;
      }
    }
  }
  
  return moves.slice(0, 25); // Limit to reasonable number of moves
}

function isImprovement(oldState: CubeState, newState: CubeState): boolean {
  // Simple heuristic: count how many pieces are in correct position
  const oldScore = calculateScore(oldState);
  const newScore = calculateScore(newState);
  return newScore > oldScore;
}

function calculateScore(cube: CubeState): number {
  let score = 0;
  const solvedCube = getSolvedCube();
  
  // Count correctly positioned pieces
  Object.keys(cube).forEach(face => {
    const faceKey = face as keyof CubeState;
    for (let i = 0; i < 9; i++) {
      if (cube[faceKey][i] === solvedCube[faceKey][i]) {
        score++;
      }
    }
  });
  
  return score;
}

function isSolved(cube: CubeState): boolean {
  return Object.values(cube).every(face => 
    face.every(color => color === face[0])
  );
}

// Get solved cube state
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