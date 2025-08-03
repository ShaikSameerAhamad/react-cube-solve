import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { RubiksCubeCanvas } from '@/components/RubiksCube3D';
import { ColorPalette } from '@/components/ColorPalette';
import { FaceInput } from '@/components/FaceInput';
import { SolutionControls } from '@/components/SolutionControls';
import { 
  CubeState, 
  CubeColor, 
  Move, 
  parseCubeInput, 
  isValidCube, 
  solveCube, 
  getSolvedCube,
  applyMove
} from '@/lib/kociemba';
import { Box, Palette, Play } from 'lucide-react';

const Index = () => {
  const [cubeState, setCubeState] = useState<CubeState>(getSolvedCube());
  const [inputValues, setInputValues] = useState({
    U: 'wwwwwwwww',
    D: 'yyyyyyyyy',
    F: 'rrrrrrrrr',
    B: 'ooooooooo',
    L: 'bbbbbbbbb',
    R: 'ggggggggg',
  });
  const [selectedColor, setSelectedColor] = useState<CubeColor>('W');
  const [solution, setSolution] = useState<Move[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleInputChange = (face: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [face]: value
    }));
  };

  const handleResetCube = () => {
    const solvedCube = getSolvedCube();
    setCubeState(solvedCube);
    setInputValues({
      U: 'wwwwwwwww',
      D: 'yyyyyyyyy', 
      F: 'rrrrrrrrr',
      B: 'ooooooooo',
      L: 'bbbbbbbbb',
      R: 'ggggggggg',
    });
    setSolution([]);
    setCurrentStep(0);
    setIsPlaying(false);
    toast('Cube reset to solved state');
  };

  const handleApplyColors = () => {
    try {
      const newCubeState = parseCubeInput(inputValues);
      
      if (!isValidCube(newCubeState)) {
        toast.error('Invalid cube configuration. Each color must appear exactly 9 times.');
        return;
      }
      
      setCubeState(newCubeState);
      setSolution([]);
      setCurrentStep(0);
      setIsPlaying(false);
      toast.success('Colors applied to cube successfully');
    } catch (error) {
      toast.error('Error applying colors to cube');
    }
  };

  const handleSolveCube = () => {
    try {
      const moves = solveCube(cubeState);
      setSolution(moves);
      setCurrentStep(0);
      setIsPlaying(false);
      
      if (moves.length === 0) {
        toast.success('Cube is already solved!');
      } else {
        toast.success(`Solution found with ${moves.length} moves`);
      }
    } catch (error) {
      toast.error('Error solving cube: ' + (error as Error).message);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setIsAnimating(true);
    
    // Apply moves up to current step
    let currentCube = parseCubeInput(inputValues);
    for (let i = 0; i < step; i++) {
      if (solution[i]) {
        currentCube = applyMove(currentCube, solution[i]);
      }
    }
    setCubeState(currentCube);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSolutionReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCubeState(parseCubeInput(inputValues));
    toast('Solution reset to starting position');
  };


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Box className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-cube bg-clip-text text-transparent">
              Rubik's Cube Solver
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Interactive 3D cube solver using Kociemba's algorithm
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - 3D Cube */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                3D Cube Visualization
              </h2>
              <RubiksCubeCanvas 
                cubeState={cubeState} 
                isAnimating={isAnimating}
                currentMove={solution[currentStep - 1]}
              />
            </Card>

            {/* Solution Controls */}
            {solution.length > 0 && (
              <SolutionControls
                solution={solution}
                currentStep={currentStep}
                isPlaying={isPlaying}
                onStepChange={handleStepChange}
                onPlayToggle={handlePlayToggle}
                onReset={handleSolutionReset}
              />
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            {/* Color Palette */}
            <ColorPalette 
              onColorSelect={setSelectedColor}
              selectedColor={selectedColor}
            />

            {/* Face Inputs */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cube Configuration
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(inputValues).map(([face, value]) => (
                  <FaceInput
                    key={face}
                    face={face as 'U' | 'D' | 'F' | 'B' | 'L' | 'R'}
                    value={value}
                    onChange={handleInputChange}
                    selectedColor={selectedColor}
                  />
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button 
                  variant="destructive" 
                  onClick={handleResetCube}
                  className="flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  Reset Cube
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleApplyColors}
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Apply Colors
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSolveCube}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Solve Cube
                </Button>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">How to Use</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. <strong>Select colors</strong> from the palette above</p>
                <p>2. <strong>Click tiles</strong> or type in the face inputs (W/Y/R/O/B/G)</p>
                <p>3. <strong>Apply Colors</strong> to update the 3D cube</p>
                <p>4. <strong>Solve Cube</strong> to generate solution moves</p>
                <p>5. Use <strong>playback controls</strong> to watch the solution</p>
                
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
