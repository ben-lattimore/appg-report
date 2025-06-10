import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { appgFileSchema, type APPGFile } from "@shared/schema";
import { realAppgFiles } from "./data/appg-files";

// Function to register routes only (for Vercel)
export async function setupRoutes(app: Express): Promise<void> {
  // Get real APPG data
  app.get("/api/sample-data", async (req, res) => {
    try {
      const result = await storage.processAppgFiles(realAppgFiles);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Process uploaded files (keeping for future functionality)
  app.post("/api/process-files", async (req, res) => {
    try {
      // For now, return the real data since we have the actual files
      const result = await storage.processAppgFiles(realAppgFiles);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/benefits-analysis", async (req, res) => {
    try {
      const result = await storage.processBenefitsData(realAppgFiles);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Function to register routes and create HTTP server (for local development)
export async function registerRoutes(app: Express): Promise<Server> {
  await setupRoutes(app);
  const httpServer = createServer(app);
  return httpServer;
}
