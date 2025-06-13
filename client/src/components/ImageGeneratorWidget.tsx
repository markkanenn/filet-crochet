import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Grid3X3, Download, Share2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Image {
  id: number;
  url: string;
  alt: string;
  tags: string[];
}

interface WidgetConfig {
  width: string;
  theme: string;
  maxResults: number;
  showDownload: boolean;
  showFooter: boolean;
}

interface Props {
  config: WidgetConfig;
  compact?: boolean;
  showEmbedButton?: boolean;
  embedded?: boolean;
  onShowEmbed?: () => void;
}

export default function ImageGeneratorWidget({ 
  config, 
  compact = false, 
  showEmbedButton = false,
  embedded = false,
  onShowEmbed 
}: Props) {
  const [query, setQuery] = useState("");
  const [generatedPattern, setGeneratedPattern] = useState<Image | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const generatePatternMutation = useMutation({
    mutationFn: async (digits: string) => {
      const response = await apiRequest("POST", "/api/pattern/generate", { digits });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPattern(data.pattern);
      setHasGenerated(true);
    },
    onError: (error) => {
      console.error("Pattern generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate pattern. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = async () => {
    const cleanDigits = query.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      toast({
        title: "Error",
        description: "Please enter numbers to create a pattern",
        variant: "destructive",
      });
      return;
    }

    generatePatternMutation.mutate(cleanDigits);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const handleDownload = async (imageUrl: string, alt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${alt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string, alt: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alt,
          url: imageUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Success",
        description: "Image URL copied to clipboard",
      });
    }
  };

  const isLoading = generatePatternMutation.isPending;
  const error = generatePatternMutation.error;

  const widgetClasses = `
    w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden
    ${config.width !== 'auto' ? `max-w-[${config.width}]` : ''}
    ${embedded ? 'shadow-none border-0' : ''}
  `;

  return (
    <div className={widgetClasses}>
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className={`font-semibold flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
          <Grid3X3 className="w-5 h-5" />
          {compact ? "Crochet Pattern" : "Filet Crochet Pattern Generator"}
        </h2>
        {!compact && (
          <p className="text-blue-100 mt-1">Generate filet crochet patterns for numbers</p>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={compact ? "Enter numbers..." : "Enter numbers (e.g., 1999, 2024)"}
              value={query}
              onChange={(e) => {
                // Only allow numbers
                const filteredValue = e.target.value.replace(/[^0-9]/g, '');
                setQuery(filteredValue);
              }}
              onKeyPress={handleKeyPress}
              className="pr-12"
              maxLength={10}
            />
            <Grid3X3 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4 mr-2" />
                {compact ? "Generate" : "Generate Pattern"}
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generating Pattern</h3>
            </div>
            <Skeleton className="w-full h-32 rounded-lg" />
          </div>
        )}

        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Error generating pattern</span>
            </div>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              Failed to generate pattern. Please try again.
            </p>
          </Card>
        )}

        {generatedPattern && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filet Crochet Pattern</h3>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-center">
                <img 
                  src={generatedPattern.url}
                  alt={generatedPattern.alt}
                  className="mx-auto max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Black squares = solid stitches, White squares = open spaces
                </p>
              </div>
              
              {config.showDownload && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(generatedPattern.url, generatedPattern.alt)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download Pattern
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleShare(generatedPattern.url, generatedPattern.alt)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Share Pattern
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial Empty State */}
        {!hasGenerated && !isLoading && !generatedPattern && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to generate</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Enter numbers above and click "Generate Pattern" to create your filet crochet pattern.
            </p>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      {config.showFooter && (
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Powered by Image Search Widget</span>
            {showEmbedButton && onShowEmbed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowEmbed}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Code className="w-4 h-4 mr-1" />
                Get Embed Code
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
