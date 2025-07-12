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

  // Hotel Manager dashboard routes
  app.get('/api/hotel-manager/hotels', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotels = await storage.getHotelsByManager(userId);
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels' });
    }
  });

  app.post('/api/hotel-manager/hotels', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelData = { ...req.body, managerId: userId };
      const hotel = await storage.createHotel(hotelData);
      res.json(hotel);
    } catch (error) {
      console.error('Error creating hotel:', error);
      res.status(500).json({ message: 'Failed to create hotel' });
    }
  });

  app.put('/api/hotel-manager/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.id);
      const hotel = await storage.updateHotel(hotelId, req.body);
      res.json(hotel);
    } catch (error) {
      console.error('Error updating hotel:', error);
      res.status(500).json({ message: 'Failed to update hotel' });
    }
  });

  app.delete('/api/hotel-manager/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.id);
      await storage.deleteHotel(hotelId);
      res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      res.status(500).json({ message: 'Failed to delete hotel' });
    }
  });

  // Room categories routes
  app.get('/api/hotel-manager/hotels/:hotelId/rooms', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.hotelId);
      const roomCategories = await storage.getRoomCategoriesByHotel(hotelId);
      res.json(roomCategories);
    } catch (error) {
      console.error('Error fetching room categories:', error);
      res.status(500).json({ message: 'Failed to fetch room categories' });
    }
  });

  app.post('/api/hotel-manager/hotels/:hotelId/rooms', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.hotelId);
      const roomData = { ...req.body, hotelId };
      const roomCategory = await storage.createRoomCategory(roomData);
      res.json(roomCategory);
    } catch (error) {
      console.error('Error creating room category:', error);
      res.status(500).json({ message: 'Failed to create room category' });
    }
  });

  app.put('/api/hotel-manager/rooms/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const roomId = parseInt(req.params.id);
      const roomCategory = await storage.updateRoomCategory(roomId, req.body);
      res.json(roomCategory);
    } catch (error) {
      console.error('Error updating room category:', error);
      res.status(500).json({ message: 'Failed to update room category' });
    }
  });

  app.delete('/api/hotel-manager/rooms/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const roomId = parseInt(req.params.id);
      await storage.deleteRoomCategory(roomId);
      res.json({ message: 'Room category deleted successfully' });
    } catch (error) {
      console.error('Error deleting room category:', error);
      res.status(500).json({ message: 'Failed to delete room category' });
    }
  });

  // Booking requests routes
  app.get('/api/hotel-manager/hotels/:hotelId/booking-requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.hotelId);
      const bookingRequests = await storage.getBookingRequestsByHotel(hotelId);
      res.json(bookingRequests);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      res.status(500).json({ message: 'Failed to fetch booking requests' });
    }
  });

  app.get('/api/hotel-manager/hotels/:hotelId/pending-requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const hotelId = parseInt(req.params.hotelId);
      const pendingRequests = await storage.getPendingBookingRequests(hotelId);
      res.json(pendingRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ message: 'Failed to fetch pending requests' });
    }
  });

  app.patch('/api/hotel-manager/booking-requests/:id/approve', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const requestId = parseInt(req.params.id);
      const updatedRequest = await storage.updateBookingRequestStatus(requestId, 'approved', userId);
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error approving booking request:', error);
      res.status(500).json({ message: 'Failed to approve booking request' });
    }
  });

  app.patch('/api/hotel-manager/booking-requests/:id/reject', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'hotel_manager') {
        return res.status(403).json({ message: 'Access denied - Hotel Managers only' });
      }

      const requestId = parseInt(req.params.id);
      const { reason } = req.body;
      const updatedRequest = await storage.updateBookingRequestStatus(requestId, 'rejected', userId, reason);
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error rejecting booking request:', error);
      res.status(500).json({ message: 'Failed to reject booking request' });
    }
  });

  // Admin hotel approval routes
  app.get('/api/admin/hotels/pending', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager', 'event_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin or Event Manager only' });
      }

      const pendingHotels = await storage.getPendingHotels();
      res.json(pendingHotels);
    } catch (error) {
      console.error('Error fetching pending hotels:', error);
      res.status(500).json({ message: 'Failed to fetch pending hotels' });
    }
  });

  app.patch('/api/admin/hotels/:id/approve', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager', 'event_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin or Event Manager only' });
      }

      const hotelId = parseInt(req.params.id);
      const approvedHotel = await storage.approveHotel(hotelId, userId);
      res.json(approvedHotel);
    } catch (error) {
      console.error('Error approving hotel:', error);
      res.status(500).json({ message: 'Failed to approve hotel' });
    }
  });

  app.patch('/api/admin/hotels/:id/reject', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager', 'event_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin or Event Manager only' });
      }

      const hotelId = parseInt(req.params.id);
      const { reason } = req.body;
      await storage.rejectHotel(hotelId, reason);
      res.json({ message: 'Hotel rejected successfully' });
    } catch (error) {
      console.error('Error rejecting hotel:', error);
      res.status(500).json({ message: 'Failed to reject hotel' });
    }
  });

  // Admin tournament approval routes
  app.get('/api/admin/tournaments/pending', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const pendingTournaments = await storage.getPendingTournaments();
      res.json(pendingTournaments);
    } catch (error) {
      console.error('Error fetching pending tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch pending tournaments' });
    }
  });

  app.patch('/api/admin/tournaments/:id/approve', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const tournamentId = parseInt(req.params.id);
      const approvedTournament = await storage.approveTournament(tournamentId, userId);
      res.json(approvedTournament);
    } catch (error) {
      console.error('Error approving tournament:', error);
      res.status(500).json({ message: 'Failed to approve tournament' });
    }
  });

  app.patch('/api/admin/tournaments/:id/reject', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const tournamentId = parseInt(req.params.id);
      const { reason } = req.body;
      await storage.rejectTournament(tournamentId, reason);
      res.json({ message: 'Tournament rejected successfully' });
    } catch (error) {
      console.error('Error rejecting tournament:', error);
      res.status(500).json({ message: 'Failed to reject tournament' });
    }
  });

  // City management routes
  app.get('/api/cities', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Event Manager or Admin only' });
      }

      const cities = await storage.getApprovedCities();
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });

  app.post('/api/cities/request', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Event Manager or Admin only' });
      }

      const cityData = { ...req.body, requestedBy: userId };
      const city = await storage.createCityRequest(cityData);
      res.json(city);
    } catch (error) {
      console.error('Error creating city request:', error);
      res.status(500).json({ message: 'Failed to create city request' });
    }
  });

  // Admin city approval routes
  app.get('/api/admin/cities/pending', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const pendingCities = await storage.getPendingCities();
      res.json(pendingCities);
    } catch (error) {
      console.error('Error fetching pending cities:', error);
      res.status(500).json({ message: 'Failed to fetch pending cities' });
    }
  });

  app.patch('/api/admin/cities/:id/approve', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const cityId = parseInt(req.params.id);
      const approvedCity = await storage.approveCity(cityId, userId);
      res.json(approvedCity);
    } catch (error) {
      console.error('Error approving city:', error);
      res.status(500).json({ message: 'Failed to approve city' });
    }
  });

  app.patch('/api/admin/cities/:id/reject', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }

      const cityId = parseInt(req.params.id);
      const { reason } = req.body;
      await storage.rejectCity(cityId, reason);
      res.json({ message: 'City rejected successfully' });
    } catch (error) {
      console.error('Error rejecting city:', error);
      res.status(500).json({ message: 'Failed to reject city' });
    }
  });

  // Event Manager routes
  // Tournament management
  app.get('/api/event-manager/tournaments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const tournaments = await storage.getTournamentsByManager(user.id);
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.post('/api/event-manager/tournaments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Convert date strings to Date objects
      const tournamentData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        createdBy: user.id
      };
      
      const tournament = await storage.createTournament(tournamentData);
      res.json(tournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  app.put('/api/event-manager/tournaments/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Convert date strings to Date objects if they exist
      const tournamentData = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) })
      };
      
      const tournament = await storage.updateTournament(parseInt(req.params.id), tournamentData);
      res.json(tournament);
    } catch (error) {
      console.error("Error updating tournament:", error);
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  app.delete('/api/event-manager/tournaments/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteTournament(parseInt(req.params.id));
      res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
      console.error("Error deleting tournament:", error);
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  // Match management
  app.get('/api/event-manager/matches', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const matches = await storage.getMatchesByManager(user.id);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.get('/api/event-manager/tournaments/:id/matches', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const matches = await storage.getMatchesByTournament(parseInt(req.params.id));
      res.json(matches);
    } catch (error) {
      console.error("Error fetching tournament matches:", error);
      res.status(500).json({ message: "Failed to fetch tournament matches" });
    }
  });

  app.post('/api/event-manager/matches', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Convert date and time strings to proper format
      const matchData = { 
        ...req.body, 
        createdBy: user.id,
        matchDate: new Date(req.body.matchDate),
        clusterId: req.body.clusterId ? parseInt(req.body.clusterId) : null
      };
      const match = await storage.createMatch(matchData);
      res.json(match);
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  app.put('/api/event-manager/matches/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Convert date and time strings to proper format if they exist
      const matchData = {
        ...req.body,
        ...(req.body.matchDate && { matchDate: new Date(req.body.matchDate) }),
        ...(req.body.clusterId && { clusterId: parseInt(req.body.clusterId) })
      };
      
      const match = await storage.updateMatch(parseInt(req.params.id), matchData);
      res.json(match);
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  app.delete('/api/event-manager/matches/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteMatch(parseInt(req.params.id));
      res.json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ message: "Failed to delete match" });
    }
  });

  // Hotel cluster management
  app.get('/api/event-manager/clusters', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const clusters = await storage.getHotelClustersByManager(user.id);
      res.json(clusters);
    } catch (error) {
      console.error("Error fetching hotel clusters:", error);
      res.status(500).json({ message: "Failed to fetch hotel clusters" });
    }
  });

  app.get('/api/event-manager/all-clusters', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const clusters = await storage.getHotelClusters();
      res.json(clusters);
    } catch (error) {
      console.error("Error fetching all hotel clusters:", error);
      res.status(500).json({ message: "Failed to fetch all hotel clusters" });
    }
  });

  app.post('/api/event-manager/clusters', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const clusterData = { ...req.body, createdBy: user.id };
      const cluster = await storage.createHotelCluster(clusterData);
      res.json(cluster);
    } catch (error) {
      console.error("Error creating hotel cluster:", error);
      res.status(500).json({ message: "Failed to create hotel cluster" });
    }
  });

  app.put('/api/event-manager/clusters/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const cluster = await storage.updateHotelCluster(parseInt(req.params.id), req.body);
      res.json(cluster);
    } catch (error) {
      console.error("Error updating hotel cluster:", error);
      res.status(500).json({ message: "Failed to update hotel cluster" });
    }
  });

  app.delete('/api/event-manager/clusters/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteHotelCluster(parseInt(req.params.id));
      res.json({ message: "Hotel cluster deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel cluster:", error);
      res.status(500).json({ message: "Failed to delete hotel cluster" });
    }
  });

  // Assign hotel to cluster
  app.put('/api/event-manager/hotels/:hotelId/assign-cluster', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user?.id;
      const user = await storage.getUser(userId);
      if (!user || !['event_manager', 'admin', 'lead_admin', 'state_admin_manager'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { clusterId } = req.body;
      const hotel = await storage.assignHotelToCluster(parseInt(req.params.hotelId), clusterId);
      res.json(hotel);
    } catch (error) {
      console.error("Error assigning hotel to cluster:", error);
      res.status(500).json({ message: "Failed to assign hotel to cluster" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
