import { pgTable, text, serial, varchar, timestamp, jsonb, index, integer, boolean, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with all required fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  mobileCountryCode: varchar("mobile_country_code", { length: 10 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
  whatsappCountryCode: varchar("whatsapp_country_code", { length: 10 }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  isVerified: varchar("is_verified", { length: 10 }).default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  otp: varchar("otp", { length: 6 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'email', 'sms', or 'both'
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: varchar("is_used", { length: 10 }).default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Country codes for mobile and WhatsApp
export const countryCodes = [
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
] as const;

// Validation schemas
export const userRoles = [
  "state_admin_manager",
  "lead_admin", 
  "admin",
  "event_manager",
  "team_manager",
  "player",
  "hotel_manager"
] as const;

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(userRoles, { errorMap: () => ({ message: "Invalid role selected" }) }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organization: z.string().min(1, "Organization is required"),
  mobileCountryCode: z.string().min(1, "Mobile country code is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  whatsappCountryCode: z.string().optional(),
  whatsappNumber: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, isVerified: true });

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  userId: z.string(),
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({ 
  id: true, 
  createdAt: true, 
  isUsed: true 
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
});

export const resetPasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  userId: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type OtpData = z.infer<typeof otpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Cities table (for approved cities)
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("India"),
  approved: varchar("approved", { length: 10 }).default("false"), // false, true, rejected
  requestedBy: integer("requested_by").references(() => users.id), // Event Manager ID who requested
  approvedBy: integer("approved_by").references(() => users.id), // Admin ID who approved
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cityIds: text("city_ids").notNull(), // JSON array of city IDs
  locations: text("locations").notNull(), // JSON array of city names (for backward compatibility)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  approved: varchar("approved", { length: 10 }).default("false"),
  createdBy: integer("created_by").references(() => users.id), // Event Manager ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 100 }).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events (matches) table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 100 }).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  date: timestamp("date").notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  teamsInvolved: text("teams_involved").notNull(), // JSON array of team names
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches table (for Event Manager to create/edit matches under tournaments)
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  eventId: integer("event_id").references(() => events.id), // Optional link to events
  matchName: varchar("match_name", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 100 }).notNull(),
  team1: varchar("team1", { length: 255 }).notNull(),
  team2: varchar("team2", { length: 255 }).notNull(),
  matchDate: timestamp("match_date").notNull(),
  matchTime: varchar("match_time", { length: 10 }).notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  venueAddress: text("venue_address"),
  clusterId: integer("cluster_id").references(() => hotelClusters.id), // Link to hotel cluster
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, ongoing, completed, cancelled
  result: text("result"), // Match result
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id), // Event Manager ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotel clusters table
export const hotelClusters = pgTable("hotel_clusters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  stadiumName: varchar("stadium_name", { length: 255 }),
  stadiumAddress: text("stadium_address"),
  description: text("description"),
  maxRadius: integer("max_radius").default(10), // km radius from stadium
  createdBy: integer("created_by").references(() => users.id), // Event Manager ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotels table
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  managerId: integer("manager_id").references(() => users.id),
  clusterId: integer("cluster_id").references(() => hotelClusters.id),
  proximityToVenue: varchar("proximity_to_venue", { length: 255 }),
  notableFeatures: text("notable_features"),
  totalRooms: integer("total_rooms").default(0),
  availableRooms: integer("available_rooms").default(0),
  address: text("address"),
  contactInfo: text("contact_info"), // JSON object with phone, email, etc.
  approved: varchar("approved", { length: 10 }).default("pending"),
  autoApproveBookings: boolean("auto_approve_bookings").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Room categories table
export const roomCategories = pgTable("room_categories", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").references(() => hotels.id),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  totalRooms: integer("total_rooms").default(0),
  availableRooms: integer("available_rooms").default(0),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }),
  amenities: text("amenities"), // JSON array of amenities
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking requests table
export const bookingRequests = pgTable("booking_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => users.id), // Team Manager ID
  hotelId: integer("hotel_id").references(() => hotels.id),
  roomCategoryId: integer("room_category_id").references(() => roomCategories.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  eventId: integer("event_id").references(() => events.id),
  teamName: varchar("team_name", { length: 255 }),
  numberOfRooms: integer("number_of_rooms").default(1),
  checkInDate: timestamp("check_in_date"),
  checkOutDate: timestamp("check_out_date"),
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id), // Hotel Manager ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player bookings table
export const playerBookings = pgTable("player_bookings", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id),
  bookingRequestId: integer("booking_request_id").references(() => bookingRequests.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  eventId: integer("event_id").references(() => events.id),
  hotelId: integer("hotel_id").references(() => hotels.id),
  roomCategoryId: integer("room_category_id").references(() => roomCategories.id),
  teamName: varchar("team_name", { length: 255 }),
  checkInDate: timestamp("check_in_date"),
  checkOutDate: timestamp("check_out_date"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  qrCode: varchar("qr_code", { length: 255 }).unique(),
  confirmationCode: varchar("confirmation_code", { length: 50 }).unique(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, checked_in, checked_out
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team management tables
export const teamRequests = pgTable("team_requests", {
  id: serial("id").primaryKey(),
  teamManagerId: integer("team_manager_id").references(() => users.id),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  sport: varchar("sport", { length: 100 }).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  approvedBy: integer("approved_by").references(() => users.id), // Event Manager or Admin
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamRequestId: integer("team_request_id").references(() => teamRequests.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneCountryCode: varchar("phone_country_code", { length: 10 }).default("+91"),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  alternateContact: varchar("alternate_contact", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  position: varchar("position", { length: 100 }),
  sport: varchar("sport", { length: 100 }).notNull(),
  requiresAccommodation: boolean("requires_accommodation").default(false),
  accommodationPreferences: text("accommodation_preferences"), // Special requests for accommodation
  userId: integer("user_id").references(() => users.id), // If user account exists
  accountCreated: boolean("account_created").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accountCreationRequests = pgTable("account_creation_requests", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id").references(() => teamMembers.id),
  email: varchar("email", { length: 255 }).notNull(),
  phoneCountryCode: varchar("phone_country_code", { length: 10 }).default("+91"),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  notificationsSent: boolean("notifications_sent").default(false),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  whatsappSent: boolean("whatsapp_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playerAccommodationRequests = pgTable("player_accommodation_requests", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id").references(() => teamMembers.id),
  teamRequestId: integer("team_request_id").references(() => teamRequests.id),
  clusterId: integer("cluster_id").references(() => hotelClusters.id),
  hotelId: integer("hotel_id").references(() => hotels.id),
  roomCategoryId: integer("room_category_id").references(() => roomCategories.id),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  accommodationPreferences: text("accommodation_preferences"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, hotel_assigned, hotel_approved, hotel_rejected, confirmed
  assignedBy: integer("assigned_by").references(() => users.id), // Event Manager who assigned
  assignedAt: timestamp("assigned_at"),
  hotelResponseReason: text("hotel_response_reason"),
  hotelRespondedBy: integer("hotel_responded_by").references(() => users.id), // Hotel Manager
  hotelRespondedAt: timestamp("hotel_responded_at"),
  confirmationCode: varchar("confirmation_code", { length: 50 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertCitySchema = createInsertSchema(cities);
export const insertTournamentSchema = createInsertSchema(tournaments);
export const insertTeamSchema = createInsertSchema(teams);
export const insertEventSchema = createInsertSchema(events);
export const insertMatchSchema = createInsertSchema(matches);
export const insertHotelClusterSchema = createInsertSchema(hotelClusters);
export const insertHotelSchema = createInsertSchema(hotels);
export const insertRoomCategorySchema = createInsertSchema(roomCategories);
export const insertBookingRequestSchema = createInsertSchema(bookingRequests);
export const insertPlayerBookingSchema = createInsertSchema(playerBookings);
export const insertTeamRequestSchema = createInsertSchema(teamRequests);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertAccountCreationRequestSchema = createInsertSchema(accountCreationRequests);
export const insertPlayerAccommodationRequestSchema = createInsertSchema(playerAccommodationRequests);

// Types
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type HotelCluster = typeof hotelClusters.$inferSelect;
export type InsertHotelCluster = z.infer<typeof insertHotelClusterSchema>;
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type RoomCategory = typeof roomCategories.$inferSelect;
export type InsertRoomCategory = z.infer<typeof insertRoomCategorySchema>;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type PlayerBooking = typeof playerBookings.$inferSelect;
export type InsertPlayerBooking = z.infer<typeof insertPlayerBookingSchema>;
export type TeamRequest = typeof teamRequests.$inferSelect;
export type InsertTeamRequest = z.infer<typeof insertTeamRequestSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type AccountCreationRequest = typeof accountCreationRequests.$inferSelect;
export type InsertAccountCreationRequest = z.infer<typeof insertAccountCreationRequestSchema>;
export type PlayerAccommodationRequest = typeof playerAccommodationRequests.$inferSelect;
export type InsertPlayerAccommodationRequest = z.infer<typeof insertPlayerAccommodationRequestSchema>;
