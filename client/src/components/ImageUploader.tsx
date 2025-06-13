import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onPatternCreated: () => void;
}

export default function ImageUploader({ onPatternCreated }: Props) {
  const [selectedDigit, setSelectedDigit] = useState("0");
  const [patternName, setPatternName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPattern, setProcessedPattern] = useState<string[][] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        processImageToPattern(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageToPattern = (imageData: string) => {
    setIsProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for pattern conversion
      const patternWidth = 8;
      const patternHeight = 10;
      canvas.width = patternWidth;
      canvas.height = patternHeight;

      // Draw and scale image to canvas
      ctx.drawImage(img, 0, 0, patternWidth, patternHeight);
      
      // Get image data and convert to pattern
      const imageData = ctx.getImageData(0, 0, patternWidth, patternHeight);
      const pixels = imageData.data;
      
      const pattern: string[][] = [];
      
      for (let y = 0; y < patternHeight; y++) {
        const row: string[] = [];
        for (let x = 0; x < patternWidth; x++) {
          const index = (y * patternWidth + x) * 4;
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const alpha = pixels[index + 3];
          
          // Calculate brightness (0-255)
          const brightness = (r + g + b) / 3;
          
          // Convert to black/white based on threshold
          // Lower brightness = darker = solid stitch
          const threshold = 128;
          const cell = brightness < threshold ? '█' : '░';
          row.push(cell);
        }
        pattern.push(row);
      }
      
      setProcessedPattern(pattern);
      setIsProcessing(false);
    };
    
    img.src = imageData;
  };

  const handleSavePattern = async () => {
    if (!processedPattern || !patternName.trim()) {
      toast({
        title: "Error",
        description: "Please upload an image and enter a pattern name",
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
          description: `Pattern created from uploaded image for digit ${selectedDigit}`,
          digit: selectedDigit,
          pattern: processedPattern,
          width: processedPattern[0].length,
          height: processedPattern.length,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pattern created from your image successfully!",
        });
        
        // Reset form
        setUploadedImage(null);
        setProcessedPattern(null);
        setPatternName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onPatternCreated();
      } else {
        throw new Error('Failed to create pattern');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pattern. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setProcessedPattern(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Digit Image
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
              placeholder="My Custom Style"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Image</Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            {!uploadedImage ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose Image File
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a clear image of your digit. It will be converted to a filet crochet pattern.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploaded Image</span>
                  <Button
                    onClick={handleClearImage}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={uploadedImage}
                  alt="Uploaded digit"
                  className="max-w-32 max-h-32 mx-auto border border-gray-300 rounded"
                />
                {isProcessing && (
                  <p className="text-sm text-gray-500">Converting to pattern...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {processedPattern && (
          <div className="space-y-2">
            <Label>Generated Pattern Preview</Label>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-center">
                <div 
                  className="inline-grid border border-gray-300 dark:border-gray-600 rounded gap-px bg-gray-300"
                  style={{ 
                    gridTemplateColumns: `repeat(${processedPattern[0].length}, minmax(0, 1fr))`
                  }}
                >
                  {processedPattern.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-6 h-6 text-xs font-mono flex items-center justify-center border-0 ${
                          cell === '█'
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        }`}
                        title={`${cell === '█' ? 'Solid' : 'Open'} stitch at row ${rowIndex}, col ${colIndex}`}
                      >
                        {cell}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                Black squares = solid stitches, White squares = open spaces
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleSavePattern}
          disabled={!processedPattern || !patternName.trim()}
          className="w-full"
        >
          <Check className="w-4 h-4 mr-2" />
          Save Pattern from Image
        </Button>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}