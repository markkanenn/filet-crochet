import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate pattern endpoint
  app.post("/api/pattern/generate", async (req, res) => {
    try {
      const { digits, patternSetId, gauge } = req.body;
      if (!digits || typeof digits !== 'string') {
        return res.status(400).json({ error: "Digits required" });
      }
      
      const pattern = await storage.generatePattern(digits, patternSetId, gauge);
      res.json({ pattern });
    } catch (error) {
      console.error("Error generating pattern:", error);
      res.status(500).json({ error: "Failed to generate pattern" });
    }
  });

  // Get all digit patterns
  app.get("/api/digit-patterns", async (req, res) => {
    try {
      const patterns = await storage.getAllDigitPatterns();
      res.json({ patterns });
    } catch (error) {
      console.error("Error fetching digit patterns:", error);
      res.status(500).json({ error: "Failed to fetch digit patterns" });
    }
  });

  // Get digit patterns by set
  app.get("/api/digit-patterns/set/:isDefault", async (req, res) => {
    try {
      const isDefault = req.params.isDefault === 'true';
      const patterns = await storage.getDigitPatternsBySet(isDefault);
      res.json({ patterns });
    } catch (error) {
      console.error("Error fetching digit patterns:", error);
      res.status(500).json({ error: "Failed to fetch digit patterns" });
    }
  });

  // Create custom digit pattern
  app.post("/api/digit-patterns", async (req, res) => {
    try {
      const { name, description, digit, pattern, width, height } = req.body;
      
      if (!name || !digit || !pattern || !width || !height) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const digitPattern = await storage.createDigitPattern({
        name,
        description,
        digit,
        pattern: JSON.stringify(pattern),
        width,
        height,
        isDefault: false
      });

      res.json({ pattern: digitPattern });
    } catch (error) {
      console.error("Error creating digit pattern:", error);
      res.status(500).json({ error: "Failed to create digit pattern" });
    }
  });

  // Delete custom digit pattern
  app.delete("/api/digit-patterns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDigitPattern(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Pattern not found" });
      }
    } catch (error) {
      console.error("Error deleting digit pattern:", error);
      res.status(500).json({ error: "Failed to delete digit pattern" });
    }
  });

  // Search images endpoint (for individual digits)
  app.get("/api/images/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const images = await storage.searchImages(query);
      res.json({ images, count: images.length });
    } catch (error) {
      console.error("Error searching images:", error);
      res.status(500).json({ error: "Failed to search images" });
    }
  });

  // Get all images endpoint
  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getAllImages();
      res.json({ images, count: images.length });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // Generate embed code endpoint
  app.post("/api/embed/generate", async (req, res) => {
    try {
      const configSchema = z.object({
        width: z.string().default("auto"),
        theme: z.string().default("light"),
        maxResults: z.number().default(4),
        showDownload: z.boolean().default(true),
        showFooter: z.boolean().default(true),
      });

      const config = configSchema.parse(req.body);
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : 'http://localhost:5000';

      const embedCodes = {
        iframe: `<iframe 
  src="${baseUrl}/embed?theme=${config.theme}&width=${config.width}&maxResults=${config.maxResults}&showFooter=${config.showFooter}"
  width="100%" 
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>`,
        javascript: `<div id="ai-image-widget"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed?theme=${config.theme}&width=${config.width}&maxResults=${config.maxResults}&showFooter=${config.showFooter}';
  iframe.width = '100%';
  iframe.height = '600';
  iframe.frameBorder = '0';
  iframe.style.cssText = 'border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';
  document.getElementById('ai-image-widget').appendChild(iframe);
})();
</script>`,
        react: `import React from 'react';

function AIImageWidget() {
  return (
    <iframe 
      src="${baseUrl}/embed?theme=${config.theme}&width=${config.width}&maxResults=${config.maxResults}&showFooter=${config.showFooter}"
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

export default AIImageWidget;`
      };

      res.json({ embedCodes, config });
    } catch (error) {
      console.error("Error generating embed code:", error);
      res.status(400).json({ error: "Invalid configuration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
