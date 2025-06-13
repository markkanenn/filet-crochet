import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Code, Cog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WidgetConfig {
  width: string;
  theme: string;
  maxResults: number;
  showDownload: boolean;
  showFooter: boolean;
}

interface Props {
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export default function EmbedCodeGenerator({ config, onConfigChange }: Props) {
  const [activeTab, setActiveTab] = useState("iframe");
  const { toast } = useToast();

  const generateEmbedMutation = useMutation({
    mutationFn: async (embedConfig: WidgetConfig) => {
      const response = await apiRequest("POST", "/api/embed/generate", embedConfig);
      return response.json();
    },
  });

  const handleConfigChange = (key: keyof WidgetConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    onConfigChange(newConfig);
  };

  const handleGenerateEmbed = () => {
    generateEmbedMutation.mutate(config);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Code copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const embedCodes = generateEmbedMutation.data?.embedCodes || {};

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Code className="w-6 h-6" />
          Embed Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Cog className="w-5 h-5" />
              <h3 className="text-lg font-medium text-gray-900">Widget Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Widget Width</Label>
                <Select value={config.width} onValueChange={(value) => handleConfigChange('width', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Responsive)</SelectItem>
                    <SelectItem value="400px">400px (Fixed)</SelectItem>
                    <SelectItem value="600px">600px (Fixed)</SelectItem>
                    <SelectItem value="800px">800px (Fixed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Theme</Label>
                <Select value={config.theme} onValueChange={(value) => handleConfigChange('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light (Default)</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Max Results</Label>
                <Select 
                  value={config.maxResults.toString()} 
                  onValueChange={(value) => handleConfigChange('maxResults', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 images</SelectItem>
                    <SelectItem value="6">6 images</SelectItem>
                    <SelectItem value="8">8 images</SelectItem>
                    <SelectItem value="12">12 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showDownload"
                    checked={config.showDownload}
                    onCheckedChange={(checked) => handleConfigChange('showDownload', checked)}
                  />
                  <Label htmlFor="showDownload" className="text-sm text-gray-700">
                    Show download buttons
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showFooter"
                    checked={config.showFooter}
                    onCheckedChange={(checked) => handleConfigChange('showFooter', checked)}
                  />
                  <Label htmlFor="showFooter" className="text-sm text-gray-700">
                    Show powered by footer
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleGenerateEmbed}
                disabled={generateEmbedMutation.isPending}
                className="w-full"
              >
                {generateEmbedMutation.isPending ? "Generating..." : "Generate Embed Code"}
              </Button>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Embed Code</h3>
            
            {embedCodes.iframe && (
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="iframe">iFrame</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                  </TabsList>

                  <TabsContent value="iframe" className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                        <code>{embedCodes.iframe}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(embedCodes.iframe)}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="javascript" className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                        <code>{embedCodes.javascript}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(embedCodes.javascript)}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="react" className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                        <code>{embedCodes.react}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(embedCodes.react)}
                        className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={() => {
                    const currentCode = embedCodes[activeTab as keyof typeof embedCodes];
                    if (currentCode) copyToClipboard(currentCode);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Selected Code
                </Button>
              </div>
            )}

            {!embedCodes.iframe && (
              <div className="text-center py-8 text-gray-500">
                <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Click "Generate Embed Code" to see the code</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
