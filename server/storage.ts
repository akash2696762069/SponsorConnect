import { 
  users, sponsorships, platforms, applications, paymentMethods,
  type User, type InsertUser, type Sponsorship, type InsertSponsorship,
  type Platform, type InsertPlatform, type Application, type InsertApplication,
  type PaymentMethod, type InsertPaymentMethod
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Sponsorship operations
  getAllSponsorships(): Promise<Sponsorship[]>;
  getSponsorship(id: number): Promise<Sponsorship | undefined>;
  createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship>;
  updateSponsorship(id: number, updates: Partial<InsertSponsorship>): Promise<Sponsorship | undefined>;

  // Platform operations
  getUserPlatforms(userId: number): Promise<Platform[]>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: number, updates: Partial<InsertPlatform>): Promise<Platform | undefined>;
  getPendingPlatformVerifications(): Promise<Platform[]>;

  // Application operations
  getUserApplications(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined>;
  getPendingApplications(): Promise<Application[]>;

  // Payment method operations
  getUserPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
}

export class DrizzleStorage implements IStorage {
  constructor() {
    // No in-memory maps needed now
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    const result = await db.select().from(sponsorships).where(eq(sponsorships.isActive, true));
    return result;
  }

  async getSponsorship(id: number): Promise<Sponsorship | undefined> {
    const result = await db.select().from(sponsorships).where(eq(sponsorships.id, id)).limit(1);
    return result[0];
  }

  async createSponsorship(insertSponsorship: InsertSponsorship): Promise<Sponsorship> {
    const result = await db.insert(sponsorships).values(insertSponsorship).returning();
    return result[0];
  }

  async updateSponsorship(id: number, updates: Partial<InsertSponsorship>): Promise<Sponsorship | undefined> {
    const result = await db.update(sponsorships).set(updates).where(eq(sponsorships.id, id)).returning();
    return result[0];
  }

  async getUserPlatforms(userId: number): Promise<Platform[]> {
    const result = await db.select().from(platforms).where(eq(platforms.userId, userId));
    return result;
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const result = await db.insert(platforms).values(insertPlatform).returning();
    return result[0];
  }

  async updatePlatform(id: number, updates: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const result = await db.update(platforms).set(updates).where(eq(platforms.id, id)).returning();
    return result[0];
  }

  async getPendingPlatformVerifications(): Promise<Platform[]> {
    const result = await db.select().from(platforms).where(eq(platforms.isVerified, false));
    return result;
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    const result = await db.select().from(applications).where(eq(applications.userId, userId));
    return result;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(insertApplication).returning();
    return result[0];
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    const result = await db.update(applications).set(updates).where(eq(applications.id, id)).returning();
    return result[0];
  }

  async getPendingApplications(): Promise<Application[]> {
    const result = await db.select().from(applications).where(eq(applications.status, "pending"));
    return result;
  }

  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId).and(eq(paymentMethods.isActive, true)));
    return result;
  }

  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(insertPaymentMethod).returning();
    return result[0];
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const result = await db.update(paymentMethods).set(updates).where(eq(paymentMethods.id, id)).returning();
    return result[0];
  }
}

export const storage = new DrizzleStorage();
