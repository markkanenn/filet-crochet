export interface EmbedConfig {
  width?: string;
  theme?: 'light' | 'dark' | 'auto';
  maxResults?: number;
  showDownload?: boolean;
  showFooter?: boolean;
}

export function generateEmbedUrl(baseUrl: string, config: EmbedConfig): string {
  const params = new URLSearchParams();
  
  if (config.width) params.set('width', config.width);
  if (config.theme) params.set('theme', config.theme);
  if (config.maxResults) params.set('maxResults', config.maxResults.toString());
  if (config.showDownload !== undefined) params.set('showDownload', config.showDownload.toString());
  if (config.showFooter !== undefined) params.set('showFooter', config.showFooter.toString());
  
  return `${baseUrl}/embed?${params.toString()}`;
}

export function generateIframeCode(baseUrl: string, config: EmbedConfig): string {
  const embedUrl = generateEmbedUrl(baseUrl, config);
  return `<iframe 
  src="${embedUrl}"
  width="100%" 
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>`;
}

export function generateJavaScriptCode(baseUrl: string, config: EmbedConfig): string {
  const embedUrl = generateEmbedUrl(baseUrl, config);
  return `<div id="ai-image-widget"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.width = '100%';
  iframe.height = '600';
  iframe.frameBorder = '0';
  iframe.style.cssText = 'border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';
  document.getElementById('ai-image-widget').appendChild(iframe);
})();
</script>`;
}

export function generateReactCode(baseUrl: string, config: EmbedConfig): string {
  const embedUrl = generateEmbedUrl(baseUrl, config);
  return `import React from 'react';

function AIImageWidget() {
  return (
    <iframe 
      src="${embedUrl}"
      width="100%" 
      height="600"
      frameBorder="0"
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    />
  );
}

export default AIImageWidget;`;
}
