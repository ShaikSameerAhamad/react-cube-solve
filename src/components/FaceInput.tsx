import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CubeColor } from '@/lib/kociemba';

interface FaceInputProps {
  face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
  value: string;
  onChange: (face: string, value: string) => void;
  selectedColor?: CubeColor;
}

const faceNames = {
  U: 'Top (U)',
  D: 'Bottom (D)', 
  F: 'Front (F)',
  B: 'Back (B)',
  L: 'Left (L)',
  R: 'Right (R)',
};

const faceColors = {
  U: 'bg-cube-white',
  D: 'bg-cube-yellow',
  F: 'bg-cube-red', 
  B: 'bg-cube-orange',
  L: 'bg-cube-blue',
  R: 'bg-cube-green',
};

export function FaceInput({ face, value, onChange, selectedColor }: FaceInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    // Ensure only valid characters and max 9 length
    const cleanValue = newValue.toLowerCase().replace(/[^wygobr]/g, '').slice(0, 9);
    setLocalValue(cleanValue);
    onChange(face, cleanValue);
  };

  const handleTileClick = (index: number) => {
    if (selectedColor) {
      const chars = localValue.split('');
      while (chars.length < 9) chars.push('w');
      chars[index] = selectedColor.toLowerCase();
      const newValue = chars.join('');
      setLocalValue(newValue);
      onChange(face, newValue);
    }
  };

  const renderTiles = () => {
    const chars = localValue.split('');
    while (chars.length < 9) chars.push('w');
    
    const colorMap = {
      'w': 'bg-cube-white border-gray-300',
      'y': 'bg-cube-yellow border-yellow-400',
      'r': 'bg-cube-red border-red-400',
      'o': 'bg-cube-orange border-orange-400',
      'b': 'bg-cube-blue border-blue-400',
      'g': 'bg-cube-green border-green-400',
    };

    return (
      <div className="grid grid-cols-3 gap-1 w-20 h-20 mb-2">
        {chars.slice(0, 9).map((char, index) => (
          <div
            key={index}
            onClick={() => handleTileClick(index)}
            className={`border cursor-pointer hover:scale-110 transition-transform ${
              colorMap[char as keyof typeof colorMap] || 'bg-gray-200 border-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`face-${face}`} className="text-sm font-medium">
        {faceNames[face]}
      </Label>
      {renderTiles()}
      <Input
        id={`face-${face}`}
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="wwwwwwwww"
        className="text-xs font-mono"
        maxLength={9}
      />
      <p className="text-xs text-muted-foreground">
        Click tiles or type: W/Y/R/O/B/G
      </p>
    </div>
  );
}