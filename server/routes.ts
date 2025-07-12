import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { authService } from "./services/authService";
import { otpService } from "./services/otpService";
import { 
  registerSchema, 
  loginSchema, 
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterData,
  type LoginData,
  type OtpData,
  type ForgotPasswordData,
  type ResetPasswordData
} from "@shared/schema";

// Extend session data interface
declare module "express-session" {
  interface SessionData {
    user?: any;
    tempUser?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;
      
      const result = await authService.registerUser(userData);
      
      // Store user in session for OTP verification
      req.session.tempUser = result.user;
      
      res.json({
        message: "Registration successful. Please verify your account with the OTP sent to your email.",
        user: result.user,
        success: true,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        message: error.message || "Registration failed",
        success: false 
      });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.loginUser(validatedData);
      
      // Store user in session
      req.session.user = result.user;
      
      res.json({
        message: "Login successful",
        user: result.user,
        success: true,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        message: error.message || "Login failed",
        success: false 
      });
    }
  });

  // OTP verification endpoint
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const validatedData = otpSchema.parse(req.body);
      const { otp, userId } = validatedData;
      
      const isValid = await authService.verifyAccount(parseInt(userId), otp);
      
      if (isValid) {
        // Update session with verified user
        if (req.session.tempUser && req.session.tempUser.id.toString() === userId) {
          req.session.user = { ...req.session.tempUser, isVerified: "true" };
          delete req.session.tempUser;
        }
        
        res.json({
          message: "Account verified successfully",
          success: true,
        });
      } else {
        res.status(400).json({
          message: "Invalid or expired OTP",
          success: false,
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      res.status(400).json({ 
        message: error.message || "OTP verification failed",
        success: false 
      });
    }
  });

  // Resend OTP endpoint
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { userId, type } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = await otpService.createOTP(parseInt(userId), type || 'email');
      
      if (type === 'sms' && user.mobileNumber) {
        await otpService.sendOTPSMS(user.mobileNumber, otp);
      } else {
        await otpService.sendOTPEmail(user.email, otp);
      }

      res.json({
        message: "OTP sent successfully",
        success: true,
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to resend OTP",
        success: false 
      });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const { identifier } = validatedData;
      
      const result = await authService.forgotPassword(identifier);
      
      // Store user ID in session for password reset
      req.session.resetUserId = result.userId;
      
      res.json({
        message: "Reset code sent to your email and mobile number",
        userId: result.userId,
        success: true,
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to send reset code",
        success: false 
      });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const { otp, newPassword, userId } = validatedData;
      
      const success = await authService.resetPassword(parseInt(userId), otp, newPassword);
      
      if (success) {
        // Clear the reset session
        delete req.session.resetUserId;
        
        res.json({
          message: "Password reset successfully",
          success: true,
        });
      } else {
        res.status(400).json({
          message: "Password reset failed",
          success: false,
        });
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(400).json({ 
        message: error.message || "Password reset failed",
        success: false 
      });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req: any, res) => {
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Protected dashboard endpoint
  app.get("/api/dashboard", requireAuth, async (req: any, res) => {
    try {
      const user = req.session.user;
      res.json({
        message: `Welcome to your dashboard, ${user.firstName}!`,
        user: user,
        rolePermissions: getRolePermissions(user.role),
      });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  // Helper function for role permissions
  function getRolePermissions(role: string) {
    const permissions = {
      state_admin_manager: ["manage_all", "view_all", "create_events", "manage_users"],
      lead_admin: ["manage_organization", "view_organization", "create_events", "manage_teams"],
      admin: ["manage_events", "view_events", "manage_teams"],
      event_manager: ["manage_assigned_events", "view_assigned_events"],
      team_manager: ["manage_team", "view_team", "register_players"],
      player: ["view_profile", "view_assigned_events"],
      hotel_manager: ["manage_accommodations", "view_bookings"],
    };
    
    return permissions[role as keyof typeof permissions] || ["view_profile"];
  }

  // Player dashboard routes
  app.get('/api/player/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'player') {
        return res.status(403).json({ message: 'Access denied - Players only' });
      }

      const allBookings = await storage.getPlayerBookings(userId);
      const currentBookings = await storage.getPlayerCurrentBookings(userId);
      const pastBookings = await storage.getPlayerPastBookings(userId);

      res.json({
        all: allBookings,
        current: currentBookings,
        past: pastBookings
      });
    } catch (error) {
      console.error('Error fetching player bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  app.get('/api/tournaments', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch tournaments' });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  app.get('/api/hotels', async (req, res) => {
    try {
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
