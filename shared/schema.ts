import { pgTable, text, serial, varchar, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
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
  type: varchar("type", { length: 20 }).notNull(), // 'email' or 'sms'
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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type OtpData = z.infer<typeof otpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
