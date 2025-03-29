import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { insertPhraseSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for phrases
  app.get('/api/phrases', async (req, res) => {
    try {
      // For demo purposes, we're using a fixed user ID
      const userId = 1;
      const phrases = await storage.getPhrasesByUserId(userId);
      res.json(phrases);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch phrases' });
    }
  });

  app.post('/api/phrases', async (req, res) => {
    try {
      // Validate request body
      const phraseData = insertPhraseSchema.parse(req.body);
      
      // Create phrase
      const phrase = await storage.createPhrase(phraseData);
      res.status(201).json(phrase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid phrase data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create phrase' });
      }
    }
  });

  app.delete('/api/phrases/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid phrase ID' });
      }
      
      await storage.deletePhrase(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete phrase' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
