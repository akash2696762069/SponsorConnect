import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSponsorshipSchema, insertPlatformSchema, 
  insertApplicationSchema, insertPaymentMethodSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs'; // Removed as no longer using file system
// import path from 'path'; // Removed as no longer using file system
// import { fileURLToPath } from "url"; // Removed as no longer using file system

// const __filename = fileURLToPath(import.meta.url); // Removed
// const __dirname = path.dirname(__filename); // Removed

// Removed file paths as no longer needed
// const PROFILE_PATH = path.join(__dirname, 'profile.json');
// const SPONSORSHIPS_PATH = path.join(__dirname, 'sponsorships.json');
// const APPLICATIONS_PATH = path.join(__dirname, 'apply.json');
// const PLATFORMS_PATH = path.join(__dirname, 'platforms.json');
// const PAYMENT_METHODS_PATH = path.join(__dirname, 'payment_methods.json');

// Removed file read/write functions
// function readProfile() {
//   if (!fs.existsSync(PROFILE_PATH)) return {};
//   return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
// }
// function writeProfile(data: any) {
//   fs.writeFileSync(PROFILE_PATH, JSON.stringify(data, null, 2));
// }
// function readSponsorships() {
//   if (!fs.existsSync(SPONSORSHIPS_PATH)) return [];
//   return JSON.parse(fs.readFileSync(SPONSORSHIPS_PATH, 'utf-8'));
// }
// function readApplications() {
//   if (!fs.existsSync(APPLICATIONS_PATH)) return [];
//   return JSON.parse(fs.readFileSync(APPLICATIONS_PATH, 'utf-8'));
// }
// function writeApplications(data: any) {
//   fs.writeFileSync(APPLICATIONS_PATH, JSON.stringify(data, null, 2));
// }
// function readPlatforms() {
//   if (!fs.existsSync(PLATFORMS_PATH)) return [];
//   return JSON.parse(fs.readFileSync(PLATFORMS_PATH, 'utf-8'));
// }
// function writePlatforms(data: any) {
//   fs.writeFileSync(PLATFORMS_PATH, JSON.stringify(data, null, 2));
// }
// function readPaymentMethods() {
//   if (!fs.existsSync(PAYMENT_METHODS_PATH)) return [];
//   return JSON.parse(fs.readFileSync(PAYMENT_METHODS_PATH, 'utf-8'));
// }
// function writePaymentMethods(data: any) {
//   fs.writeFileSync(PAYMENT_METHODS_PATH, JSON.stringify(data, null, 2));
// }

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, profilePhoto } = req.body;

      console.log("Received Telegram Auth Request:", { telegramId, username, firstName, lastName, profilePhoto });
      
      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        console.log("User not found, creating new user...");
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
        console.log("New user created:", user);
      } else {
        console.log("User found:", user);
        // Optional: Update user details if they change (e.g., username, photo)
        // await storage.updateUser(user.id, { username, firstName, lastName, profilePhoto });
        // console.log("User details updated:", user);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error in /api/auth/telegram:", error);
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

  // Profile photo upload endpoint
  app.post("/api/upload/profile-photo", upload.single('profilePhoto'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "sponsorconnect_profiles", // Cloudinary folder name
      });

      res.json({ profilePhotoUrl: result.secure_url });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });

  // Sponsorship routes
  app.get("/api/sponsorships", async (req, res) => {
    try {
      const sponsorships = await storage.getAllSponsorships();
      res.json(sponsorships);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sponsorships" });
    }
  });

  app.get("/api/sponsorship/:id", async (req, res) => {
    try {
      const s = await storage.getSponsorship(parseInt(req.params.id));
      if (!s) return res.status(404).json({ message: 'Not found' });
      res.json(s);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sponsorship" });
    }
  });

  app.post("/api/apply", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to create application" });
    }
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

  app.get('/api/platforms', async (req, res) => {
    try {
      const platforms = await storage.getPendingPlatformVerifications(); // Assuming this was meant to be all platforms
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get platforms" });
    }
  });

  app.post('/api/platforms', async (req, res) => {
    try {
      const platformData = insertPlatformSchema.parse(req.body);
      const newPlatform = await storage.createPlatform({ ...platformData, isVerified: false });
      res.status(201).json(newPlatform);
    } catch (error) {
      res.status(500).json({ message: "Failed to create platform" });
    }
  });

  app.patch('/api/platforms/:id', async (req, res) => {
    try {
      const updates = insertPlatformSchema.partial().parse(req.body);
      const platform = await storage.updatePlatform(parseInt(req.params.id), updates);
      if (!platform) return res.status(404).json({ message: 'Platform not found' });
      res.json(platform);
    } catch (error) {
      res.status(500).json({ message: "Failed to update platform" });
    }
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
      res.status(500).json({ message: "Failed to get user payment methods" });
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

  const server = createServer(app);
  return server;
}
