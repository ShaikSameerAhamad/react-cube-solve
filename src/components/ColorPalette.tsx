import { CubeColor } from '@/lib/kociemba';

interface ColorPaletteProps {
  onColorSelect: (color: CubeColor) => void;
  selectedColor?: CubeColor;
}

const colors: { color: CubeColor; name: string; bgClass: string; borderClass: string }[] = [
  { color: 'W', name: 'White', bgClass: 'bg-cube-white', borderClass: 'border-gray-300' },
  { color: 'Y', name: 'Yellow', bgClass: 'bg-cube-yellow', borderClass: 'border-yellow-400' },
  { color: 'R', name: 'Red', bgClass: 'bg-cube-red', borderClass: 'border-red-400' },
  { color: 'O', name: 'Orange', bgClass: 'bg-cube-orange', borderClass: 'border-orange-400' },
  { color: 'B', name: 'Blue', bgClass: 'bg-cube-blue', borderClass: 'border-blue-400' },
  { color: 'G', name: 'Green', bgClass: 'bg-cube-green', borderClass: 'border-green-400' },
];

export function ColorPalette({ onColorSelect, selectedColor }: ColorPaletteProps) {
  return (
    <div className="flex gap-2 p-4 bg-card rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground self-center mr-2">Colors:</span>
      {colors.map(({ color, name, bgClass, borderClass }) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${bgClass} ${
            selectedColor === color 
              ? `${borderClass} ring-2 ring-primary` 
              : 'border-border hover:border-primary'
          }`}
          title={name}
        />
      ))}
    </div>
  );
}