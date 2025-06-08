import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSponsorshipSchema, insertPlatformSchema, 
  insertApplicationSchema, insertPaymentMethodSchema 
} from "@shared/schema";
import { z } from "zod";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROFILE_PATH = path.join(__dirname, 'profile.json');
const SPONSORSHIPS_PATH = path.join(__dirname, 'sponsorships.json');
const APPLICATIONS_PATH = path.join(__dirname, 'apply.json');
const PLATFORMS_PATH = path.join(__dirname, 'platforms.json');
const PAYMENT_METHODS_PATH = path.join(__dirname, 'payment_methods.json');

function readProfile() {
  if (!fs.existsSync(PROFILE_PATH)) return {};
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
}

function writeProfile(data: any) {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(data, null, 2));
}

function readSponsorships() {
  if (!fs.existsSync(SPONSORSHIPS_PATH)) return [];
  return JSON.parse(fs.readFileSync(SPONSORSHIPS_PATH, 'utf-8'));
}

function readApplications() {
  if (!fs.existsSync(APPLICATIONS_PATH)) return [];
  return JSON.parse(fs.readFileSync(APPLICATIONS_PATH, 'utf-8'));
}

function writeApplications(data: any) {
  fs.writeFileSync(APPLICATIONS_PATH, JSON.stringify(data, null, 2));
}

function readPlatforms() {
  if (!fs.existsSync(PLATFORMS_PATH)) return [];
  return JSON.parse(fs.readFileSync(PLATFORMS_PATH, 'utf-8'));
}

function writePlatforms(data: any) {
  fs.writeFileSync(PLATFORMS_PATH, JSON.stringify(data, null, 2));
}

function readPaymentMethods() {
  if (!fs.existsSync(PAYMENT_METHODS_PATH)) return [];
  return JSON.parse(fs.readFileSync(PAYMENT_METHODS_PATH, 'utf-8'));
}

function writePaymentMethods(data: any) {
  fs.writeFileSync(PAYMENT_METHODS_PATH, JSON.stringify(data, null, 2));
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, profilePhoto } = req.body;
      
      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        const adminTelegramId = process.env.ADMIN_TELEGRAM_ID || "admin_id";
        user = await storage.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          profilePhoto,
          email: null,
          isAdmin: telegramId === adminTelegramId,
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate user" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Sponsorship routes
  app.get("/api/sponsorships", (req, res) => {
    const sponsorships = readSponsorships();
      res.json(sponsorships);
  });

  app.get("/api/sponsorship/:id", (req, res) => {
    const sponsorships = readSponsorships();
    const s = sponsorships.find((x: any) => String(x.id) === String(req.params.id));
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  });

  app.post("/api/apply", (req, res) => {
    const { sponsorshipId, platform, followerCount, username, category, userId } = req.body;
    const applications = readApplications();
    const newApp = {
      id: applications.length + 1,
      sponsorshipId,
      platform,
      followerCount,
      username,
      category,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    applications.push(newApp);
    writeApplications(applications);
    res.json({ success: true, application: newApp });
  });

  // Platform routes
  app.get("/api/platforms/user/:userId", async (req, res) => {
    try {
      const platforms = await storage.getUserPlatforms(parseInt(req.params.userId));
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user platforms" });
    }
  });

  app.get('/api/platforms', (req, res) => {
    const platforms = readPlatforms();
    res.json(platforms);
  });

  app.post('/api/platforms', (req, res) => {
    const { userId, platformType, username, followerCount } = req.body;
    const platforms = readPlatforms();
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newPlatform = {
      id: platforms.length + 1,
      userId,
      platformType,
      username,
      followerCount,
        verificationCode,
        isVerified: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    platforms.push(newPlatform);
    writePlatforms(platforms);
    res.json({ success: true, platform: newPlatform });
  });

  app.patch('/api/platforms/:id', (req, res) => {
    const { isVerified, status } = req.body;
    const platforms = readPlatforms();
    const idx = platforms.findIndex((p: any) => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Platform not found' });
    if (typeof isVerified === 'boolean') platforms[idx].isVerified = isVerified;
    if (status) platforms[idx].status = status;
    writePlatforms(platforms);
    res.json({ success: true, platform: platforms[idx] });
  });

  app.get("/api/platforms/pending", async (req, res) => {
    try {
      const platforms = await storage.getPendingPlatformVerifications();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending platforms" });
    }
  });

  // Application routes
  app.get("/api/applications/user/:userId", async (req, res) => {
    try {
      const applications = await storage.getUserApplications(parseInt(req.params.userId));
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const updates = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(parseInt(req.params.id), updates);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.get("/api/applications/pending", async (req, res) => {
    try {
      const applications = await storage.getPendingApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending applications" });
    }
  });

  // Payment method routes
  app.get("/api/payment-methods/user/:userId", async (req, res) => {
    try {
      const paymentMethods = await storage.getUserPaymentMethods(parseInt(req.params.userId));
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment methods" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      const paymentMethodData = insertPaymentMethodSchema.parse(req.body);
      const paymentMethod = await storage.createPaymentMethod(paymentMethodData);
      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  app.patch("/api/payment-methods/:id", async (req, res) => {
    try {
      const updates = insertPaymentMethodSchema.partial().parse(req.body);
      const paymentMethod = await storage.updatePaymentMethod(parseInt(req.params.id), updates);
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.get('/api/profile', (req, res) => {
    const profile = readProfile();
    res.json(profile);
  });

  app.post('/api/profile', (req, res) => {
    const { username, telegramHandle, email, profilePhoto } = req.body;
    const profile = { username, telegramHandle, email, profilePhoto };
    writeProfile(profile);
    res.json({ success: true, profile });
  });

  // Payment Methods
  app.get('/api/payment-methods', (req, res) => {
    const methods = readPaymentMethods();
    res.json(methods);
  });
  app.post('/api/payment-methods', (req, res) => {
    const { userId, type, accountNumber, ifscCode, upiNumber, upiId } = req.body;
    const methods = readPaymentMethods();
    const newMethod = {
      id: methods.length + 1,
      userId,
      type,
      accountNumber,
      ifscCode,
      upiNumber,
      upiId,
      createdAt: new Date().toISOString()
    };
    methods.push(newMethod);
    writePaymentMethods(methods);
    res.json({ success: true, method: newMethod });
  });
  app.patch('/api/payment-methods/:id', (req, res) => {
    const methods = readPaymentMethods();
    const idx = methods.findIndex((m: any) => String(m.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Payment method not found' });
    Object.assign(methods[idx], req.body);
    writePaymentMethods(methods);
    res.json({ success: true, method: methods[idx] });
  });

  // Add new sponsorship
  app.post('/api/sponsorships', (req, res) => {
    const { title, description, bannerImage, budgetMin, budgetMax, minFollowers, category, deadline, isActive } = req.body;
    const sponsorships = readSponsorships();
    const newSponsorship = {
      id: sponsorships.length + 1,
      title,
      description,
      bannerImage,
      budgetMin,
      budgetMax,
      minFollowers,
      category,
      deadline,
      isActive: isActive !== false,
      createdAt: new Date().toISOString()
    };
    sponsorships.push(newSponsorship);
    fs.writeFileSync(SPONSORSHIPS_PATH, JSON.stringify(sponsorships, null, 2));
    res.json({ success: true, sponsorship: newSponsorship });
  });
  // Update sponsorship
  app.patch('/api/sponsorships/:id', (req, res) => {
    const sponsorships = readSponsorships();
    const idx = sponsorships.findIndex((s: any) => String(s.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Sponsorship not found' });
    Object.assign(sponsorships[idx], req.body);
    fs.writeFileSync(SPONSORSHIPS_PATH, JSON.stringify(sponsorships, null, 2));
    res.json({ success: true, sponsorship: sponsorships[idx] });
  });
  // Get pending platforms
  app.get('/api/platforms/pending', (req, res) => {
    const platforms = readPlatforms();
    const pending = platforms.filter((p: any) => !p.isVerified);
    res.json(pending);
  });
  // Get pending applications
  app.get('/api/applications/pending', (req, res) => {
    const applications = readApplications();
    const pending = applications.filter((a: any) => a.status === 'pending');
    res.json(pending);
  });
  // Update application status
  app.patch('/api/applications/:id', (req, res) => {
    const applications = readApplications();
    const idx = applications.findIndex((a: any) => String(a.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Application not found' });
    Object.assign(applications[idx], req.body);
    writeApplications(applications);
    res.json({ success: true, application: applications[idx] });
  });

  const httpServer = createServer(app);
  return httpServer;
}
