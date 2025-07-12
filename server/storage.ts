import {
  users,
  otpVerifications,
  tournaments,
  teams,
  events,
  hotelClusters,
  hotels,
  playerBookings,
  type User,
  type InsertUser,
  type OtpVerification,
  type InsertOtp,
  type Tournament,
  type InsertTournament,
  type Team,
  type InsertTeam,
  type Event,
  type InsertEvent,
  type HotelCluster,
  type InsertHotelCluster,
  type Hotel,
  type InsertHotel,
  type PlayerBooking,
  type InsertPlayerBooking,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobileCountryCode: string, mobileNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: number, isVerified: boolean): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  getValidOtp(userId: number, otp: string): Promise<OtpVerification | undefined>;
  getValidOtpForUser(userId: number): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: number): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;

  // Player dashboard operations
  getPlayerBookings(playerId: number): Promise<PlayerBooking[]>;
  getPlayerCurrentBookings(playerId: number): Promise<PlayerBooking[]>;
  getPlayerPastBookings(playerId: number): Promise<PlayerBooking[]>;
  getTournaments(): Promise<Tournament[]>;
  getEvents(): Promise<Event[]>;
  getHotels(): Promise<Hotel[]>;
  getHotelClusters(): Promise<HotelCluster[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByMobile(mobileCountryCode: string, mobileNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.mobileCountryCode, mobileCountryCode),
        eq(users.mobileNumber, mobileNumber)
      )
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        isVerified: isVerified.toString(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async createOtp(insertOtp: InsertOtp): Promise<OtpVerification> {
    const [otp] = await db
      .insert(otpVerifications)
      .values(insertOtp)
      .returning();
    return otp;
  }

  async getValidOtp(userId: number, otp: string): Promise<OtpVerification | undefined> {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.userId, userId),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.isUsed, "false")
        )
      );
    
    if (!otpRecord) return undefined;
    
    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return undefined;
    }
    
    return otpRecord;
  }

  async getValidOtpForUser(userId: number): Promise<OtpVerification | undefined> {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.userId, userId),
          eq(otpVerifications.isUsed, "false")
        )
      )
      .orderBy(otpVerifications.createdAt);
    
    if (!otpRecord) return undefined;
    
    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return undefined;
    }
    
    return otpRecord;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ isUsed: "true" })
      .where(eq(otpVerifications.id, id));
  }

  async cleanupExpiredOtps(): Promise<void> {
    await db
      .delete(otpVerifications)
      .where(eq(otpVerifications.isUsed, "true"));
  }

  // Player dashboard operations
  async getPlayerBookings(playerId: number): Promise<PlayerBooking[]> {
    return await db.select().from(playerBookings).where(eq(playerBookings.playerId, playerId));
  }

  async getPlayerCurrentBookings(playerId: number): Promise<PlayerBooking[]> {
    const now = new Date();
    return await db.select().from(playerBookings).where(
      and(
        eq(playerBookings.playerId, playerId),
        eq(playerBookings.status, "confirmed")
      )
    );
  }

  async getPlayerPastBookings(playerId: number): Promise<PlayerBooking[]> {
    return await db.select().from(playerBookings).where(
      and(
        eq(playerBookings.playerId, playerId),
        eq(playerBookings.status, "checked_out")
      )
    );
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getHotels(): Promise<Hotel[]> {
    return await db.select().from(hotels);
  }

  async getHotelClusters(): Promise<HotelCluster[]> {
    return await db.select().from(hotelClusters);
  }
}

export const storage = new DatabaseStorage();
