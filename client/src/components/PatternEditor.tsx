import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, Plus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatternEditorProps {
  onPatternCreated: () => void;
}

export default function PatternEditor({ onPatternCreated }: PatternEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDigit, setSelectedDigit] = useState("0");
  const [patternName, setPatternName] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [gridSize, setGridSize] = useState({ width: 5, height: 7 });
  const [pattern, setPattern] = useState<string[][]>([]);
  const { toast } = useToast();

  const initializeGrid = () => {
    const newPattern = Array(gridSize.height).fill(null).map(() => 
      Array(gridSize.width).fill('░')
    );
    setPattern(newPattern);
  };

  const toggleCell = (row: number, col: number) => {
    const newPattern = [...pattern];
    newPattern[row][col] = newPattern[row][col] === '█' ? '░' : '█';
    setPattern(newPattern);
  };

  const handleCreatePattern = async () => {
    if (!patternName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a pattern name",
        variant: "destructive",
      });
      return;
    }

    if (pattern.length === 0) {
      toast({
        title: "Error", 
        description: "Please create a pattern grid",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/digit-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: patternName,
          description: patternDescription,
          digit: selectedDigit,
          pattern: pattern,
          width: gridSize.width,
          height: gridSize.height,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Custom pattern created successfully!",
        });
        setIsCreating(false);
        setPatternName("");
        setPatternDescription("");
        setPattern([]);
        onPatternCreated();
      } else {
        throw new Error('Failed to create pattern');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pattern. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (numValue >= 3 && numValue <= 15) {
      const newSize = { ...gridSize, [dimension]: numValue };
      setGridSize(newSize);
      
      // Reinitialize grid when size changes
      if (pattern.length > 0) {
        initializeGrid();
      }
    }
  };

  if (!isCreating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            Custom Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Digit Pattern
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Grid3X3 className="w-5 h-5" />
          Create Custom Pattern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="digit">Digit</Label>
            <Select value={selectedDigit} onValueChange={setSelectedDigit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5,6,7,8,9].map(digit => (
                  <SelectItem key={digit} value={digit.toString()}>
                    {digit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="name">Pattern Name</Label>
            <Input
              id="name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              placeholder="My Custom 1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={patternDescription}
            onChange={(e) => setPatternDescription(e.target.value)}
            placeholder="Describe your pattern style..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="width">Width (3-15)</Label>
            <Input
              id="width"
              type="number"
              min="3"
              max="15"
              value={gridSize.width}
              onChange={(e) => handleSizeChange('width', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (3-15)</Label>
            <Input
              id="height"
              type="number"
              min="3"
              max="15"
              value={gridSize.height}
              onChange={(e) => handleSizeChange('height', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Pattern Grid</Label>
            <Button
              onClick={initializeGrid}
              variant="outline"
              size="sm"
              disabled={pattern.length > 0}
            >
              {pattern.length > 0 ? "Grid Created" : "Create Grid"}
            </Button>
          </div>
          
          {pattern.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click squares to toggle between solid (█) and open (░) stitches
              </p>
              <div 
                className="inline-block border border-gray-300 dark:border-gray-600 rounded"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${gridSize.width}, 1fr)`,
                  gap: '1px',
                  backgroundColor: '#ccc'
                }}
              >
                {pattern.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => toggleCell(rowIndex, colIndex)}
                      className={`w-6 h-6 text-xs font-mono border-0 transition-colors ${
                        cell === '█'
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      title={`${cell === '█' ? 'Solid' : 'Open'} stitch at ${rowIndex},${colIndex}`}
                    >
                      {cell}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCreatePattern}
            disabled={!patternName.trim() || pattern.length === 0}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Save Pattern
          </Button>
          <Button
            onClick={() => {
              setIsCreating(false);
              setPattern([]);
              setPatternName("");
              setPatternDescription("");
            }}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}