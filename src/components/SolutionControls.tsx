import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Move } from '@/lib/kociemba';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  RotateCw,
  Square,
  CheckCircle
} from 'lucide-react';

interface SolutionControlsProps {
  solution: Move[];
  currentStep: number;
  isPlaying: boolean;
  onStepChange: (step: number) => void;
  onPlayToggle: () => void;
  onReset: () => void;
}

export function SolutionControls({
  solution,
  currentStep,
  isPlaying,
  onStepChange,
  onPlayToggle,
  onReset
}: SolutionControlsProps) {
  const [playSpeed] = useState(1000); // 1 second per move

  useEffect(() => {
    if (isPlaying && currentStep < solution.length) {
      const timer = setTimeout(() => {
        onStepChange(currentStep + 1);
      }, playSpeed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, solution.length, playSpeed, onStepChange]);

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < solution.length) {
      onStepChange(currentStep + 1);
    }
  };

  const handleStart = () => {
    onStepChange(0);
  };

  const handleEnd = () => {
    onStepChange(solution.length);
  };

  const getMoveDescription = (move: Move): string => {
    const descriptions: { [key in Move]: string } = {
      'U': 'Rotate top face clockwise',
      'U\'': 'Rotate top face counter-clockwise',
      'U2': 'Rotate top face 180°',
      'D': 'Rotate bottom face clockwise',
      'D\'': 'Rotate bottom face counter-clockwise', 
      'D2': 'Rotate bottom face 180°',
      'F': 'Rotate front face clockwise',
      'F\'': 'Rotate front face counter-clockwise',
      'F2': 'Rotate front face 180°',
      'B': 'Rotate back face clockwise',
      'B\'': 'Rotate back face counter-clockwise',
      'B2': 'Rotate back face 180°',
      'L': 'Rotate left face clockwise',
      'L\'': 'Rotate left face counter-clockwise',
      'L2': 'Rotate left face 180°',
      'R': 'Rotate right face clockwise',
      'R\'': 'Rotate right face counter-clockwise',
      'R2': 'Rotate right face 180°',
    };
    return descriptions[move] || 'Unknown move';
  };

  if (solution.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Cube Already Solved!</h3>
        <p className="text-muted-foreground">The cube is already in its solved state.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Solution Steps</h3>
        <Badge variant="secondary">
          {currentStep} / {solution.length}
        </Badge>
      </div>

      {/* Current Move Display */}
      {currentStep > 0 && currentStep <= solution.length && (
        <div className="p-3 bg-primary/10 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{solution[currentStep - 1]}</Badge>
            <span className="text-sm font-medium">Step {currentStep}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {getMoveDescription(solution[currentStep - 1])}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStart}
          disabled={currentStep === 0}
        >
          <Square className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onPlayToggle}
          disabled={currentStep >= solution.length}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentStep >= solution.length}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleEnd}
          disabled={currentStep >= solution.length}
        >
          <CheckCircle className="w-4 h-4" />
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Solution Preview */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Solution Sequence:</h4>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {solution.map((move, index) => (
            <Badge
              key={index}
              variant={index < currentStep ? "default" : "secondary"}
              className={`text-xs ${
                index === currentStep - 1 ? 'ring-2 ring-primary' : ''
              }`}
            >
              {move}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}