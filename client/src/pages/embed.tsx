import { useEffect, useState } from "react";
import ImageGeneratorWidget from "@/components/ImageGeneratorWidget";

export default function EmbedPage() {
  const [config, setConfig] = useState({
    width: "auto",
    theme: "light",
    maxResults: 4,
    showDownload: true,
    showFooter: true,
  });

  useEffect(() => {
    // Parse URL parameters for embed configuration
    const urlParams = new URLSearchParams(window.location.search);
    const newConfig = { ...config };

    if (urlParams.get('theme')) {
      newConfig.theme = urlParams.get('theme') || 'light';
    }
    if (urlParams.get('width')) {
      newConfig.width = urlParams.get('width') || 'auto';
    }
    if (urlParams.get('maxResults')) {
      newConfig.maxResults = parseInt(urlParams.get('maxResults') || '4');
    }
    if (urlParams.get('showFooter')) {
      newConfig.showFooter = urlParams.get('showFooter') === 'true';
    }
    if (urlParams.get('showDownload')) {
      newConfig.showDownload = urlParams.get('showDownload') === 'true';
    }

    setConfig(newConfig);

    // Apply theme class to body for iframe embedding
    if (newConfig.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Set background for seamless embedding
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = newConfig.theme === 'dark' ? '#0f0f23' : '#ffffff';
  }, []);

  return (
    <div className="p-2">
      <ImageGeneratorWidget 
        config={config}
        showEmbedButton={false}
        embedded={true}
      />
    </div>
  );
}
