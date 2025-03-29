import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { 
  insertPhraseSchema, 
  insertCallLogSchema, 
  updateCallLogSchema, 
  insertCallMessageSchema 
} from '@shared/schema';
import { randomUUID } from "crypto";

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

  // Call logs endpoints
  app.get('/api/call-logs', async (req, res) => {
    try {
      // For demo purposes, we're using a fixed user ID
      const userId = 1;
      const callLogs = await storage.getCallLogsByUserId(userId);
      res.json(callLogs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch call logs' });
    }
  });

  app.get('/api/call-logs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid call log ID' });
      }
      
      const callLog = await storage.getCallLog(id);
      
      if (!callLog) {
        return res.status(404).json({ message: 'Call log not found' });
      }
      
      res.json(callLog);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch call log' });
    }
  });

  app.post('/api/call-logs', async (req, res) => {
    try {
      const callLogData = insertCallLogSchema.parse(req.body);
      const callLog = await storage.createCallLog(callLogData);
      res.status(201).json(callLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid call log data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create call log' });
      }
    }
  });

  app.patch('/api/call-logs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid call log ID' });
      }
      
      const updateData = updateCallLogSchema.parse(req.body);
      const updatedCallLog = await storage.updateCallLog(id, updateData);
      
      if (!updatedCallLog) {
        return res.status(404).json({ message: 'Call log not found' });
      }
      
      res.json(updatedCallLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid update data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update call log' });
      }
    }
  });

  app.get('/api/call-logs/:id/messages', async (req, res) => {
    try {
      const callId = parseInt(req.params.id);
      
      if (isNaN(callId)) {
        return res.status(400).json({ message: 'Invalid call log ID' });
      }
      
      const messages = await storage.getCallMessages(callId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch call messages' });
    }
  });

  app.post('/api/call-logs/:id/messages', async (req, res) => {
    try {
      const callId = parseInt(req.params.id);
      
      if (isNaN(callId)) {
        return res.status(400).json({ message: 'Invalid call log ID' });
      }
      
      const messageData = insertCallMessageSchema.parse({
        ...req.body,
        callId
      });
      
      const message = await storage.createCallMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create message' });
      }
    }
  });

  // Recording endpoints
  app.post('/api/recordings', async (req, res) => {
    try {
      // In a real implementation, this would process an audio blob
      // For now, just generate a path and return success
      const recordingId = randomUUID();
      const recordingPath = `/recordings/${recordingId}.mp3`;
      
      res.status(201).json({
        id: recordingId,
        path: recordingPath
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save recording' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
