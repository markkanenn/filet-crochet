import { useState } from "react";
import ImageGeneratorWidget from "@/components/ImageGeneratorWidget";
import EmbedCodeGenerator from "@/components/EmbedCodeGenerator";
import GaugeCalculator from "@/components/GaugeCalculator";
import PatternEditor from "@/components/PatternEditor";
import ImageUploader from "@/components/ImageUploader";

export default function WidgetPage() {
  const [embedConfig, setEmbedConfig] = useState({
    width: "auto",
    theme: "light",
    maxResults: 4,
    showDownload: true,
    showFooter: true,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Demo Page Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold text-gray-900">Filet Crochet Pattern Generator</h1>
          <p className="text-gray-600 mt-2">Embeddable widget for generating filet crochet patterns from numbers</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Widget Demo Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pattern Generator</h2>
            <p className="text-gray-600">Create filet crochet patterns with custom gauge and digit styles</p>
          </div>

          {/* Main Widget with Advanced Features */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pattern Generator Widget */}
              <div className="lg:col-span-2">
                <ImageGeneratorWidget 
                  key={refreshKey}
                  config={embedConfig}
                  showEmbedButton={true}
                  onShowEmbed={() => {
                    document.getElementById('embed-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
              
              {/* Advanced Settings Sidebar */}
              <div className="space-y-6">
                <GaugeCalculator 
                  onGaugeChange={(gauge) => {
                    // Force widget to re-render with new gauge settings
                    setRefreshKey(prev => prev + 1);
                  }}
                />
                
                <ImageUploader 
                  onPatternCreated={() => {
                    // Refresh widget when new pattern is created from image
                    setRefreshKey(prev => prev + 1);
                  }}
                />
                
                <PatternEditor 
                  onPatternCreated={() => {
                    // Refresh widget when new pattern is created
                    setRefreshKey(prev => prev + 1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Compact Widget Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mobile/Compact View</h3>
            <div className="max-w-sm mx-auto">
              <ImageGeneratorWidget 
                config={embedConfig}
                compact={true}
                showEmbedButton={false}
              />
            </div>
          </div>
        </section>

        {/* Embed Code Generator Section */}
        <section id="embed-section">
          <EmbedCodeGenerator 
            config={embedConfig}
            onConfigChange={setEmbedConfig}
          />
        </section>

        {/* Documentation Section */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Implementation Guide</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-code text-xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Integration</h3>
              <p className="text-gray-600">Copy and paste the embed code into your website. No additional dependencies required.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Works with any CMS</li>
                <li>• No JavaScript knowledge needed</li>
                <li>• Responsive out of the box</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-cogs text-xl text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Customizable</h3>
              <p className="text-gray-600">Configure appearance, behavior, and functionality to match your brand and needs.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom themes and colors</li>
                <li>• Adjustable dimensions</li>
                <li>• Feature toggles</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tachometer-alt text-xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Lightweight</h3>
              <p className="text-gray-600">Optimized for fast loading with minimal impact on your site's performance.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {"<"} 50KB total size</li>
                <li>• Lazy loading images</li>
                <li>• CDN delivery</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Browser Support</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Chrome 70+</li>
                  <li>• Firefox 65+</li>
                  <li>• Safari 12+</li>
                  <li>• Edge 79+</li>
                  <li>• Mobile browsers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• No jQuery required</li>
                  <li>• Vanilla JavaScript</li>
                  <li>• HTTPS recommended</li>
                  <li>• Modern CSS support</li>
                  <li>• API key for production</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
