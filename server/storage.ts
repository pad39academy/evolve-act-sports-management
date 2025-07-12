import {
  users,
  otpVerifications,
  tournaments,
  teams,
  events,
  hotelClusters,
  hotels,
  roomCategories,
  bookingRequests,
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
  type RoomCategory,
  type InsertRoomCategory,
  type BookingRequest,
  type InsertBookingRequest,
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

  // Hotel management operations
  getHotelsByManager(managerId: number): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel>;
  deleteHotel(id: number): Promise<void>;
  
  // Admin hotel approval operations
  getPendingHotels(): Promise<Hotel[]>;
  approveHotel(hotelId: number, approvedBy: number): Promise<Hotel>;
  rejectHotel(hotelId: number, rejectionReason: string): Promise<void>;
  
  // Room category operations
  getRoomCategoriesByHotel(hotelId: number): Promise<RoomCategory[]>;
  createRoomCategory(roomCategory: InsertRoomCategory): Promise<RoomCategory>;
  updateRoomCategory(id: number, roomCategory: Partial<InsertRoomCategory>): Promise<RoomCategory>;
  deleteRoomCategory(id: number): Promise<void>;
  
  // Booking request operations
  getBookingRequestsByHotel(hotelId: number): Promise<BookingRequest[]>;
  getPendingBookingRequests(hotelId: number): Promise<BookingRequest[]>;
  updateBookingRequestStatus(id: number, status: string, approvedBy?: number, rejectionReason?: string): Promise<BookingRequest>;
  getBookingRequestWithDetails(id: number): Promise<BookingRequest | undefined>;
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

  // Hotel management operations
  async getHotelsByManager(managerId: number): Promise<Hotel[]> {
    return await db.select().from(hotels).where(eq(hotels.managerId, managerId));
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel> {
    const [updatedHotel] = await db
      .update(hotels)
      .set({ ...hotel, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return updatedHotel;
  }

  async deleteHotel(id: number): Promise<void> {
    await db.delete(hotels).where(eq(hotels.id, id));
  }

  // Room category operations
  async getRoomCategoriesByHotel(hotelId: number): Promise<RoomCategory[]> {
    return await db.select().from(roomCategories).where(eq(roomCategories.hotelId, hotelId));
  }

  async createRoomCategory(roomCategory: InsertRoomCategory): Promise<RoomCategory> {
    const [newRoomCategory] = await db.insert(roomCategories).values(roomCategory).returning();
    return newRoomCategory;
  }

  async updateRoomCategory(id: number, roomCategory: Partial<InsertRoomCategory>): Promise<RoomCategory> {
    const [updatedRoomCategory] = await db
      .update(roomCategories)
      .set({ ...roomCategory, updatedAt: new Date() })
      .where(eq(roomCategories.id, id))
      .returning();
    return updatedRoomCategory;
  }

  async deleteRoomCategory(id: number): Promise<void> {
    await db.delete(roomCategories).where(eq(roomCategories.id, id));
  }

  // Booking request operations
  async getBookingRequestsByHotel(hotelId: number): Promise<BookingRequest[]> {
    return await db.select().from(bookingRequests).where(eq(bookingRequests.hotelId, hotelId));
  }

  async getPendingBookingRequests(hotelId: number): Promise<BookingRequest[]> {
    return await db.select().from(bookingRequests).where(
      and(
        eq(bookingRequests.hotelId, hotelId),
        eq(bookingRequests.status, "pending")
      )
    );
  }

  async updateBookingRequestStatus(id: number, status: string, approvedBy?: number, rejectionReason?: string): Promise<BookingRequest> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === "approved") {
      updateData.approvedAt = new Date();
      updateData.approvedBy = approvedBy;
    } else if (status === "rejected") {
      updateData.rejectionReason = rejectionReason;
    }

    const [updatedRequest] = await db
      .update(bookingRequests)
      .set(updateData)
      .where(eq(bookingRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getBookingRequestWithDetails(id: number): Promise<BookingRequest | undefined> {
    const [request] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id));
    return request;
  }

  // Admin hotel approval operations
  async getPendingHotels(): Promise<Hotel[]> {
    return await db.select().from(hotels).where(eq(hotels.approved, "pending"));
  }

  async approveHotel(hotelId: number, approvedBy: number): Promise<Hotel> {
    const [approvedHotel] = await db
      .update(hotels)
      .set({ 
        approved: "approved",
        updatedAt: new Date()
      })
      .where(eq(hotels.id, hotelId))
      .returning();
    return approvedHotel;
  }

  async rejectHotel(hotelId: number, rejectionReason: string): Promise<void> {
    await db
      .update(hotels)
      .set({ 
        approved: "rejected",
        updatedAt: new Date()
      })
      .where(eq(hotels.id, hotelId));
  }
}

export const storage = new DatabaseStorage();
