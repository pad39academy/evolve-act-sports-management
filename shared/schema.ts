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
  mobileNumber: varchar("mobile_number", { length: 20 }),
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
  mobileNumber: z.string().optional(),
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
