import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTaskSchema, insertTaskProgressSchema, insertChallengeSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

interface WSMessage {
  type: string;
  payload: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // HTTP API Routes
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  // Tasks
  app.post("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const tasks = await storage.getTasksByUserId(req.user!.id);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) return res.status(400).json({ message: "Invalid task ID" });
      
      const task = await storage.getTask(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
      
      await storage.deleteTask(taskId);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Task Progress
  app.post("/api/tasks/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) return res.status(400).json({ message: "Invalid task ID" });
      
      const task = await storage.getTask(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
      
      // Parse date or use today
      let progressDate = new Date();
      if (req.body.date) {
        progressDate = new Date(req.body.date);
      }
      
      // Check if progress exists for this date
      const existingProgress = await storage.getTaskProgressByDate(taskId, progressDate);
      
      // Generate feedback based on task value vs progress value
      let feedback = "";
      const progressValue = req.body.value;
      
      if (progressValue >= task.unitValue * 1.5) {
        feedback = "Wow! Great job!";
      } else if (progressValue >= task.unitValue) {
        feedback = "Goal achieved!";
      } else if (progressValue >= task.unitValue * 0.75) {
        feedback = "Almost there!";
      } else if (progressValue >= task.unitValue * 0.5) {
        feedback = "Keep going!";
      } else {
        feedback = "Just started!";
      }
      
      const progressData = insertTaskProgressSchema.parse({
        taskId,
        date: progressDate,
        value: progressValue,
        feedback,
        synced: req.body.synced ?? true
      });
      
      if (existingProgress) {
        // Update logic would go here if we had an update method
        // For now, simulate by creating a new record
        const updatedProgress = await storage.createTaskProgress({
          ...progressData,
          id: existingProgress.id
        });
        res.status(200).json(updatedProgress);
      } else {
        const newProgress = await storage.createTaskProgress(progressData);
        res.status(201).json(newProgress);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/tasks/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) return res.status(400).json({ message: "Invalid task ID" });
      
      const task = await storage.getTask(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
      
      const progress = await storage.getTaskProgressByTaskId(taskId);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve progress" });
    }
  });

  // Challenges
  app.post("/api/challenges", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        creatorId: req.user!.id
      });
      
      const newChallenge = await storage.createChallenge(challengeData);
      res.status(201).json(newChallenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid challenge data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  app.get("/api/challenges", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challenges = await storage.getChallengesByUserId(req.user!.id);
      res.json(challenges);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve challenges" });
    }
  });
  
  app.get("/api/challenges/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) return res.status(400).json({ message: "Invalid challenge ID" });
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      
      // Check if user is either creator or participant
      if (challenge.creatorId !== req.user!.id && challenge.participantId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(challenge);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve challenge" });
    }
  });
  
  app.patch("/api/challenges/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) return res.status(400).json({ message: "Invalid challenge ID" });
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      
      // Allow updates from participant for accepting/declining
      // For status changes, only check if user is creator or participant
      if (req.body.status) {
        if (challenge.creatorId !== req.user!.id && challenge.participantId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        // For other updates, user must be the creator
        if (challenge.creatorId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const updatedChallenge = await storage.updateChallenge(challengeId, req.body);
      res.json(updatedChallenge);
    } catch (err) {
      res.status(500).json({ message: "Failed to update challenge" });
    }
  });

  // Challenge Progress
  app.post("/api/challenges/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) return res.status(400).json({ message: "Invalid challenge ID" });
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      
      // Check if user is either creator or participant
      if (challenge.creatorId !== req.user!.id && challenge.participantId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create progress record
      // Check if progress exists for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingProgress = await storage.getChallengeProgressByDate(challengeId, req.user!.id, today);
      if (existingProgress) {
        return res.status(400).json({ message: "Progress already submitted for today" });
      }

      const progressData = {
        challengeId,
        userId: req.user!.id,
        date: today,
        value: req.body.value,
        synced: req.body.synced ?? true
      };
      
      const newProgress = await storage.createChallengeProgress(progressData);
      
      // Send notification via WebSocket to the other participant
      const otherUserId = challenge.creatorId === req.user!.id ? challenge.participantId : challenge.creatorId;
      if (otherUserId) {
        sendWebSocketMessage(otherUserId, {
          type: 'challenge_progress',
          payload: {
            challengeId,
            message: `${req.user!.displayName || req.user!.username} has completed their challenge for today!`,
            date: format(new Date(), 'yyyy-MM-dd')
          }
        });
      }
      
      res.status(201).json(newProgress);
    } catch (err) {
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/challenges/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) return res.status(400).json({ message: "Invalid challenge ID" });
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      
      // Check if user is either creator or participant
      if (challenge.creatorId !== req.user!.id && challenge.participantId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const progress = await storage.getChallengeProgressByUserId(challengeId, req.user!.id);
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve progress" });
    }
  });

  // Challenge Messages
  app.get("/api/challenges/:id/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) return res.status(400).json({ message: "Invalid challenge ID" });
      
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      
      // Check if user is either creator or participant
      if (challenge.creatorId !== req.user!.id && challenge.participantId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const messages = await storage.getMessagesByChallengeId(challengeId);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve messages" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat and notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with their user IDs
  const clients = new Map<number, WebSocketClient[]>();
  
  // Helper function to send a message to a specific user
  function sendWebSocketMessage(userId: number, message: WSMessage): void {
    const userClients = clients.get(userId) || [];
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  wss.on('connection', (ws: WebSocketClient) => {
    ws.isAlive = true;
    
    // Ping to keep connection alive
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Authenticate and store client with user ID
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          const userId = parseInt(message.userId);
          if (!isNaN(userId)) {
            ws.userId = userId;
            
            // Add client to the list for this user
            if (!clients.has(userId)) {
              clients.set(userId, []);
            }
            clients.get(userId)!.push(ws);
            
            // Acknowledge authentication
            ws.send(JSON.stringify({ type: 'auth_success' }));
          }
        } else if (message.type === 'chat_message' && ws.userId) {
          // Handle chat message
          if (!message.challengeId || !message.content) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message format' }));
            return;
          }
          
          // Verify user has access to this challenge
          const challengeId = parseInt(message.challengeId);
          const challenge = await storage.getChallengeById(challengeId);
          
          if (!challenge || (challenge.creatorId !== ws.userId && challenge.participantId !== ws.userId)) {
            ws.send(JSON.stringify({ type: 'error', payload: 'Unauthorized access to challenge' }));
            return;
          }
          
          // Store message in database
          const newMessage = await storage.createMessage({
            challengeId,
            userId: ws.userId,
            content: message.content,
            synced: true
          });
          
          // Broadcast to all users in this challenge (creator and participant)
          const recipientIds = [challenge.creatorId];
          if (challenge.participantId) recipientIds.push(challenge.participantId);
          
          recipientIds.forEach(userId => {
            sendWebSocketMessage(userId, {
              type: 'chat_message',
              payload: newMessage
            });
          });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });
    
    // Remove client on disconnection
    ws.on('close', () => {
      if (ws.userId) {
        const userClients = clients.get(ws.userId);
        if (userClients) {
          const index = userClients.indexOf(ws);
          if (index !== -1) {
            userClients.splice(index, 1);
          }
          if (userClients.length === 0) {
            clients.delete(ws.userId);
          }
        }
      }
    });
  });
  
  // Cleanup interval for dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) return ws.terminate();
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });

  return httpServer;
}
