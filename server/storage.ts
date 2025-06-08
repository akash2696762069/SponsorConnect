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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sponsorships: Map<number, Sponsorship>;
  private platforms: Map<number, Platform>;
  private applications: Map<number, Application>;
  private paymentMethods: Map<number, PaymentMethod>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.sponsorships = new Map();
    this.platforms = new Map();
    this.applications = new Map();
    this.paymentMethods = new Map();
    this.currentId = 1;

    // Initialize with some sample sponsorships
    this.initializeData();
  }

  private initializeData() {
    // Create sample sponsorships
    const sampleSponsorships: Sponsorship[] = [
      {
        id: this.currentId++,
        title: "FitTrack Pro - Fitness App Launch",
        description: "Looking for fitness influencers to promote our new workout tracking app with advanced features and user-friendly interface.",
        bannerImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        budgetMin: 25000,
        budgetMax: 50000,
        minFollowers: 10000,
        category: "Fitness & Health",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "GlowUp Skincare Collection",
        description: "Beauty creators wanted for our new organic skincare line launch with natural ingredients and cruelty-free products.",
        bannerImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        budgetMin: 15000,
        budgetMax: 30000,
        minFollowers: 5000,
        category: "Beauty & Fashion",
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        title: "TechFlow Wireless Headphones",
        description: "Looking for tech reviewers to showcase our premium wireless headphones with advanced noise cancellation and superior sound quality.",
        bannerImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        budgetMin: 20000,
        budgetMax: 40000,
        minFollowers: 15000,
        category: "Technology",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleSponsorships.forEach(sponsorship => {
      this.sponsorships.set(sponsorship.id, sponsorship);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllSponsorships(): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).filter(s => s.isActive);
  }

  async getSponsorship(id: number): Promise<Sponsorship | undefined> {
    return this.sponsorships.get(id);
  }

  async createSponsorship(insertSponsorship: InsertSponsorship): Promise<Sponsorship> {
    const id = this.currentId++;
    const sponsorship: Sponsorship = { 
      ...insertSponsorship, 
      id, 
      createdAt: new Date() 
    };
    this.sponsorships.set(id, sponsorship);
    return sponsorship;
  }

  async updateSponsorship(id: number, updates: Partial<InsertSponsorship>): Promise<Sponsorship | undefined> {
    const sponsorship = this.sponsorships.get(id);
    if (!sponsorship) return undefined;

    const updatedSponsorship = { ...sponsorship, ...updates };
    this.sponsorships.set(id, updatedSponsorship);
    return updatedSponsorship;
  }

  async getUserPlatforms(userId: number): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(p => p.userId === userId);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.currentId++;
    const platform: Platform = { 
      ...insertPlatform, 
      id, 
      createdAt: new Date() 
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: number, updates: Partial<InsertPlatform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;

    const updatedPlatform = { ...platform, ...updates };
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  async getPendingPlatformVerifications(): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(p => !p.isVerified);
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(a => a.userId === userId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      createdAt: new Date() 
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;

    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getPendingApplications(): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(a => a.status === "pending");
  }

  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(p => p.userId === userId && p.isActive);
  }

  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentId++;
    const paymentMethod: PaymentMethod = { 
      ...insertPaymentMethod, 
      id, 
      createdAt: new Date() 
    };
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const paymentMethod = this.paymentMethods.get(id);
    if (!paymentMethod) return undefined;

    const updatedPaymentMethod = { ...paymentMethod, ...updates };
    this.paymentMethods.set(id, updatedPaymentMethod);
    return updatedPaymentMethod;
  }
}

export const storage = new MemStorage();
