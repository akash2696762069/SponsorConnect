import { PrismaClient } from "@prisma/client";
import { 
  users, sponsorships, platforms, applications, paymentMethods,
  type User, type InsertUser, type Sponsorship, type InsertSponsorship,
  type Platform, type InsertPlatform, type Application, type InsertApplication,
  type PaymentMethod, type InsertPaymentMethod
} from "@shared/schema";

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

export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getUser(id: number): Promise<User | undefined> {
    return (await this.prisma.user.findUnique({ where: { id } })) || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return (await this.prisma.user.findUnique({ where: { telegramId } })) || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    return (await this.prisma.user.update({
      where: { id },
      data: updates,
    })) || undefined;
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    return this.prisma.sponsorship.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
  }

  async getSponsorship(id: number): Promise<Sponsorship | undefined> {
    return (await this.prisma.sponsorship.findUnique({ where: { id } })) || undefined;
  }

  async createSponsorship(sponsorship: InsertSponsorship): Promise<Sponsorship> {
    return this.prisma.sponsorship.create({ data: sponsorship });
  }

  async updateSponsorship(id: number, updates: Partial<InsertSponsorship>): Promise<Sponsorship | undefined> {
    return (await this.prisma.sponsorship.update({
      where: { id },
      data: updates,
    })) || undefined;
  }

  async getUserPlatforms(userId: number): Promise<Platform[]> {
    return this.prisma.platform.findMany({ where: { userId } });
  }

  async createPlatform(platform: InsertPlatform): Promise<Platform> {
    return this.prisma.platform.create({ data: platform });
  }

  async updatePlatform(id: number, updates: Partial<InsertPlatform>): Promise<Platform | undefined> {
    return (await this.prisma.platform.update({
      where: { id },
      data: updates,
    })) || undefined;
  }

  async getPendingPlatformVerifications(): Promise<Platform[]> {
    return this.prisma.platform.findMany({ where: { isVerified: false } });
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return this.prisma.application.findMany({ where: { userId }, include: { sponsorship: true } });
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    return this.prisma.application.create({ data: application });
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    return (await this.prisma.application.update({
      where: { id },
      data: updates,
    })) || undefined;
  }

  async getPendingApplications(): Promise<Application[]> {
    return this.prisma.application.findMany({ where: { status: "pending" } });
  }

  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({ where: { userId, isActive: true } });
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    return this.prisma.paymentMethod.create({ data: paymentMethod });
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    return (await this.prisma.paymentMethod.update({
      where: { id },
      data: updates,
    })) || undefined;
  }
}

export const prismaClient = new PrismaClient();
export const storage = new PrismaStorage(prismaClient);
