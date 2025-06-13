import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GaugeSettings {
  stitchesPerInch: number;
  rowsPerInch: number;
}

interface Props {
  onGaugeChange: (gauge: GaugeSettings | undefined) => void;
  gauge?: GaugeSettings;
}

export default function GaugeCalculator({ onGaugeChange, gauge }: Props) {
  const [stitchesPerInch, setStitchesPerInch] = useState(gauge?.stitchesPerInch?.toString() || "4");
  const [rowsPerInch, setRowsPerInch] = useState(gauge?.rowsPerInch?.toString() || "4");
  const [useGauge, setUseGauge] = useState(!!gauge);

  const handleApplyGauge = () => {
    const stitches = parseFloat(stitchesPerInch);
    const rows = parseFloat(rowsPerInch);
    
    if (stitches > 0 && rows > 0) {
      onGaugeChange({ stitchesPerInch: stitches, rowsPerInch: rows });
      setUseGauge(true);
    }
  };

  const handleResetGauge = () => {
    onGaugeChange(undefined);
    setUseGauge(false);
    setStitchesPerInch("4");
    setRowsPerInch("4");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Gauge Calculator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Adjust pattern size based on your crochet gauge. Standard filet crochet is typically 4 stitches and 4 rows per inch.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stitches" className="text-sm font-medium">
              Stitches per inch
            </Label>
            <Input
              id="stitches"
              type="number"
              step="0.1"
              min="0.1"
              max="20"
              value={stitchesPerInch}
              onChange={(e) => setStitchesPerInch(e.target.value)}
              placeholder="4.0"
            />
          </div>
          <div>
            <Label htmlFor="rows" className="text-sm font-medium">
              Rows per inch
            </Label>
            <Input
              id="rows"
              type="number"
              step="0.1"
              min="0.1"
              max="20"
              value={rowsPerInch}
              onChange={(e) => setRowsPerInch(e.target.value)}
              placeholder="4.0"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleApplyGauge}
            disabled={!stitchesPerInch || !rowsPerInch}
            className="flex-1"
            variant={useGauge ? "default" : "outline"}
          >
            {useGauge ? "Update Gauge" : "Apply Gauge"}
          </Button>
          {useGauge && (
            <Button
              onClick={handleResetGauge}
              variant="outline"
              className="flex-1"
            >
              Reset to Standard
            </Button>
          )}
        </div>

        {useGauge && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              Pattern will be scaled {((parseFloat(stitchesPerInch) / 4) * 100).toFixed(0)}% horizontally and {((parseFloat(rowsPerInch) / 4) * 100).toFixed(0)}% vertically from standard size.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}