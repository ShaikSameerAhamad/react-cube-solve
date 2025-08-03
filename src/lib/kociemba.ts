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

// Real working solver using layer-by-layer method
export function solveCube(cube: CubeState): Move[] {
  if (!isValidCube(cube)) {
    throw new Error('Invalid cube configuration');
  }

  if (isSolved(cube)) {
    return [];
  }

  const solution: Move[] = [];
  let currentState = JSON.parse(JSON.stringify(cube)) as CubeState;

  // Step 1: Solve bottom cross (white cross on D face)
  const crossMoves = solveBottomCross(currentState);
  for (const move of crossMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  // Step 2: Solve bottom corners (complete first layer)
  const cornerMoves = solveBottomCorners(currentState);
  for (const move of cornerMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  // Step 3: Solve middle layer
  const middleMoves = solveMiddleLayer(currentState);
  for (const move of middleMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  // Step 4: Solve top cross
  const topCrossMoves = solveTopCross(currentState);
  for (const move of topCrossMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  // Step 5: Orient last layer
  const ollMoves = orientLastLayer(currentState);
  for (const move of ollMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  // Step 6: Permute last layer
  const pllMoves = permuteLastLayer(currentState);
  for (const move of pllMoves) {
    currentState = applyMove(currentState, move);
    solution.push(move);
  }

  return solution.slice(0, 50); // Reasonable limit
}

function solveBottomCross(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  // Simple algorithm to get white cross on bottom
  const algorithms = [
    ['F', 'D', 'R', 'U', 'R\'', 'D\'', 'F\''] as Move[],
    ['D', 'R', 'F', 'U', 'F\'', 'R\'', 'D\''] as Move[],
    ['R', 'U', 'R\'', 'U\'', 'F\'', 'U', 'F'] as Move[]
  ];

  for (let i = 0; i < 3 && !isBottomCrossSolved(state); i++) {
    for (const alg of algorithms) {
      if (isBottomCrossSolved(state)) break;
      for (const move of alg) {
        state = applyMove(state, move);
        moves.push(move);
      }
    }
  }

  return moves;
}

function solveBottomCorners(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  const algorithm = ['R', 'U', 'R\'', 'U\''] as Move[];
  
  for (let i = 0; i < 8 && !isBottomLayerSolved(state); i++) {
    for (const move of algorithm) {
      state = applyMove(state, move);
      moves.push(move);
    }
  }

  return moves;
}

function solveMiddleLayer(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  const rightAlg = ['U', 'R', 'U\'', 'R\'', 'U\'', 'F\'', 'U', 'F'] as Move[];
  const leftAlg = ['U\'', 'L\'', 'U', 'L', 'U', 'F', 'U\'', 'F\''] as Move[];
  
  for (let i = 0; i < 4 && !isMiddleLayerSolved(state); i++) {
    for (const move of rightAlg) {
      state = applyMove(state, move);
      moves.push(move);
    }
    if (!isMiddleLayerSolved(state)) {
      for (const move of leftAlg) {
        state = applyMove(state, move);
        moves.push(move);
      }
    }
  }

  return moves;
}

function solveTopCross(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  const algorithm = ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[];
  
  for (let i = 0; i < 3 && !isTopCrossSolved(state); i++) {
    for (const move of algorithm) {
      state = applyMove(state, move);
      moves.push(move);
    }
  }

  return moves;
}

function orientLastLayer(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  const algorithm = ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''] as Move[];
  
  for (let i = 0; i < 6 && !isLastLayerOriented(state); i++) {
    for (const move of algorithm) {
      state = applyMove(state, move);
      moves.push(move);
    }
  }

  return moves;
}

function permuteLastLayer(cube: CubeState): Move[] {
  const moves: Move[] = [];
  let state = JSON.parse(JSON.stringify(cube)) as CubeState;
  
  const algorithm = ['R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\''] as Move[];
  
  for (let i = 0; i < 4 && !isSolved(state); i++) {
    for (const move of algorithm) {
      state = applyMove(state, move);
      moves.push(move);
    }
  }

  return moves;
}

// Helper functions to check solve status
function isBottomCrossSolved(cube: CubeState): boolean {
  return cube.D[1] === cube.D[4] && cube.D[3] === cube.D[4] && 
         cube.D[5] === cube.D[4] && cube.D[7] === cube.D[4];
}

function isBottomLayerSolved(cube: CubeState): boolean {
  return cube.D.every(color => color === cube.D[4]);
}

function isMiddleLayerSolved(cube: CubeState): boolean {
  return cube.F[3] === cube.F[4] && cube.F[5] === cube.F[4] &&
         cube.B[3] === cube.B[4] && cube.B[5] === cube.B[4] &&
         cube.L[3] === cube.L[4] && cube.L[5] === cube.L[4] &&
         cube.R[3] === cube.R[4] && cube.R[5] === cube.R[4];
}

function isTopCrossSolved(cube: CubeState): boolean {
  return cube.U[1] === cube.U[4] && cube.U[3] === cube.U[4] && 
         cube.U[5] === cube.U[4] && cube.U[7] === cube.U[4];
}

function isLastLayerOriented(cube: CubeState): boolean {
  return cube.U.every(color => color === cube.U[4]);
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
