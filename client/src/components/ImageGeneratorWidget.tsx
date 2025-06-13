import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Sparkles, Download, Share2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/images/search', query],
    enabled: false, // Only run when manually triggered
  });

  const handleGenerate = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setHasSearched(true);
    
    try {
      await refetch();
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsGenerating(false);
    }
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

  const images = searchResults?.images || [];
  const displayImages = images.slice(0, config.maxResults);

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
          <Sparkles className="w-5 h-5" />
          {compact ? "AI Generator" : "AI Image Generator"}
        </h2>
        {!compact && (
          <p className="text-blue-100 mt-1">Generate images from your text descriptions</p>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={compact ? "Describe your image..." : "Describe the image you want to generate..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {compact ? "Generate" : "Generate Images"}
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Images</h3>
            </div>
            <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {Array.from({ length: config.maxResults }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Error generating images</span>
            </div>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              Failed to search images. Please try again.
            </p>
          </Card>
        )}

        {displayImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Images</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {displayImages.length} results
              </span>
            </div>

            <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {displayImages.map((image: Image) => (
                <div 
                  key={image.id}
                  className="group relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <img 
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {config.showDownload && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(image.url, image.alt)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {compact ? "" : "Download"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleShare(image.url, image.alt)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          {compact ? "" : "Share"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayImages.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              No images matched your description. Try different keywords or a more general search.
            </p>
          </div>
        )}

        {/* Initial Empty State */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images generated yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Enter a description above and click "Generate Images" to see AI-generated results from our database.
            </p>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      {config.showFooter && (
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Powered by AI Image Generator</span>
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
