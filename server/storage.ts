import { 
  users, tasks, taskProgress, challenges, challengeProgress, messages, categories,
  type User, type InsertUser, type Task, type InsertTask, 
  type TaskProgress, type InsertTaskProgress, type Challenge, type InsertChallenge,
  type ChallengeProgress, type InsertChallengeProgress, type Message, type InsertMessage,
  type Category
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

async function getChallengeProgressByDate(challengeId: number, userId: number, date: Date): Promise<ChallengeProgress | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.query.challengeProgress.findFirst({
    where: (progress, { and, eq, gte, lte }) => and(
      eq(progress.challengeId, challengeId),
      eq(progress.userId, userId),
      gte(progress.date, startOfDay),
      lte(progress.date, endOfDay)
    )
  });

  return result;
}

// Default categories
const defaultCategories: Category[] = [
  { id: 1, name: "Exercise", icon: "fa-dumbbell" },
  { id: 2, name: "Study", icon: "fa-book" },
  { id: 3, name: "Work", icon: "fa-briefcase" },
  { id: 4, name: "Mindfulness", icon: "fa-brain" },
  { id: 5, name: "Other", icon: "fa-list" }
];

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task Progress
  createTaskProgress(progress: InsertTaskProgress): Promise<TaskProgress>;
  getTaskProgressByTaskId(taskId: number): Promise<TaskProgress[]>;
  getTaskProgressByDate(taskId: number, date: Date): Promise<TaskProgress | undefined>;
  
  // Challenges
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallengesByUserId(userId: number): Promise<Challenge[]>;
  updateChallenge(id: number, challengeData: Partial<Challenge>): Promise<Challenge>;
  
  // Challenge Progress
  createChallengeProgress(progress: InsertChallengeProgress): Promise<ChallengeProgress>;
  getChallengeProgressByUserId(challengeId: number, userId: number): Promise<ChallengeProgress[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChallengeId(challengeId: number): Promise<Message[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
}

// Import for database integration
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Seed default categories if they don't exist
    this.seedDefaultCategories();
  }

  private async seedDefaultCategories() {
    try {
      const existingCategories = await this.getCategories();
      
      if (existingCategories.length === 0) {
        // Insert default categories
        for (const category of defaultCategories) {
          await db.insert(categories).values(category).onConflictDoNothing();
        }
      }
    } catch (error) {
      console.error("Error seeding default categories:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userWithDefaults = {
      ...insertUser,
      language: "en",
      theme: "light",
      rtl: false,
      compactMode: false,
      notifications: {
        taskReminders: true,
        challengeUpdates: true,
        chatMessages: true
      },
      offlineMode: true,
      lastSynced: new Date()
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  // Task methods
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        createdAt: new Date()
      })
      .returning();
    return newTask;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return result !== null;
  }

  // Task Progress methods
  async createTaskProgress(progress: InsertTaskProgress): Promise<TaskProgress> {
    const [newProgress] = await db
      .insert(taskProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async getTaskProgressByTaskId(taskId: number): Promise<TaskProgress[]> {
    return db
      .select()
      .from(taskProgress)
      .where(eq(taskProgress.taskId, taskId));
  }
  
  async getTaskProgressByDate(taskId: number, date: Date): Promise<TaskProgress | undefined> {
    // Format date to compare only year, month, day
    const dateStr = date.toISOString().split('T')[0];
    
    const results = await db
      .select()
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.taskId, taskId),
          sql`date_trunc('day', ${taskProgress.date}) = date_trunc('day', ${sql.placeholder('date')})`
        )
      )
      .prepare('find_progress_by_date')
      .execute({ date: dateStr });
    
    return results[0];
  }

  // Challenge methods
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db
      .insert(challenges)
      .values({
        ...challenge,
        createdAt: new Date()
      })
      .returning();
    return newChallenge;
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengesByUserId(userId: number): Promise<Challenge[]> {
    return db
      .select()
      .from(challenges)
      .where(
        sql`${challenges.creatorId} = ${userId} OR ${challenges.participantId} = ${userId}`
      )
      .orderBy(desc(challenges.createdAt));
  }
  
  async updateChallenge(id: number, challengeData: Partial<Challenge>): Promise<Challenge> {
    const [updatedChallenge] = await db
      .update(challenges)
      .set(challengeData)
      .where(eq(challenges.id, id))
      .returning();
      
    if (!updatedChallenge) {
      throw new Error("Challenge not found");
    }
    
    return updatedChallenge;
  }

  // Challenge Progress methods
  async createChallengeProgress(progress: InsertChallengeProgress): Promise<ChallengeProgress> {
    const [newProgress] = await db
      .insert(challengeProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async getChallengeProgressByUserId(challengeId: number, userId: number): Promise<ChallengeProgress[]> {
    return db
      .select()
      .from(challengeProgress)
      .where(
        and(
          eq(challengeProgress.challengeId, challengeId),
          eq(challengeProgress.userId, userId)
        )
      );
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        createdAt: new Date()
      })
      .returning();
    return newMessage;
  }

  async getMessagesByChallengeId(challengeId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.challengeId, challengeId))
      .orderBy(messages.createdAt);
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
}

export const storage = new DatabaseStorage();
