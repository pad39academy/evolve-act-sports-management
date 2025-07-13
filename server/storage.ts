import {
  users,
  otpVerifications,
  cities,
  tournaments,
  teams,
  events,
  matches,
  hotelClusters,
  hotels,
  roomCategories,
  bookingRequests,
  playerBookings,
  teamRequests,
  teamMembers,
  accountCreationRequests,
  playerAccommodationRequests,
  type User,
  type InsertUser,
  type OtpVerification,
  type InsertOtp,
  type City,
  type InsertCity,
  type Tournament,
  type InsertTournament,
  type Team,
  type InsertTeam,
  type Event,
  type InsertEvent,
  type Match,
  type InsertMatch,
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
  type TeamRequest,
  type InsertTeamRequest,
  type TeamMember,
  type InsertTeamMember,
  type AccountCreationRequest,
  type InsertAccountCreationRequest,
  type PlayerAccommodationRequest,
  type InsertPlayerAccommodationRequest,
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
  
  // Admin tournament approval operations
  getPendingTournaments(): Promise<Tournament[]>;
  approveTournament(tournamentId: number, approvedBy: number): Promise<Tournament>;
  rejectTournament(tournamentId: number, rejectionReason: string): Promise<void>;
  
  // City management operations
  getApprovedCities(): Promise<City[]>;
  getAllCities(): Promise<City[]>;
  getPendingCities(): Promise<City[]>;
  createCityRequest(city: InsertCity): Promise<City>;
  approveCity(cityId: number, approvedBy: number): Promise<City>;
  rejectCity(cityId: number, rejectionReason: string): Promise<void>;
  
  // Event Manager operations
  // Tournament and match management
  getTournamentsByManager(managerId: number): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, tournament: Partial<InsertTournament>): Promise<Tournament>;
  deleteTournament(id: number): Promise<void>;
  
  // Match management
  getMatchesByTournament(tournamentId: number): Promise<Match[]>;
  getMatchesByManager(managerId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match>;
  deleteMatch(id: number): Promise<void>;
  
  // Hotel clustering operations
  getHotelClusters(): Promise<HotelCluster[]>;
  getHotelClustersByManager(managerId: number): Promise<HotelCluster[]>;
  createHotelCluster(cluster: InsertHotelCluster): Promise<HotelCluster>;
  updateHotelCluster(id: number, cluster: Partial<InsertHotelCluster>): Promise<HotelCluster>;
  deleteHotelCluster(id: number): Promise<void>;
  assignHotelToCluster(hotelId: number, clusterId: number): Promise<Hotel>;
  
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
  
  // Team Manager operations
  getTeamRequestsByManager(managerId: number): Promise<TeamRequest[]>;
  createTeamRequest(teamRequest: InsertTeamRequest): Promise<TeamRequest>;
  updateTeamRequest(id: number, teamRequest: Partial<InsertTeamRequest>): Promise<TeamRequest>;
  deleteTeamRequest(id: number): Promise<void>;
  
  // Team member operations
  getTeamMembersByRequest(teamRequestId: number): Promise<TeamMember[]>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: number): Promise<void>;
  updateUserProfile(userId: number, memberData: Partial<InsertUser>): Promise<User>;
  
  // Team approval operations (Event Manager and Admin)
  getPendingTeamRequests(): Promise<TeamRequest[]>;
  approveTeamRequest(teamRequestId: number, approvedBy: number): Promise<TeamRequest>;
  rejectTeamRequest(teamRequestId: number, rejectionReason: string): Promise<void>;
  
  // Account creation operations
  createAccountCreationRequest(request: InsertAccountCreationRequest): Promise<AccountCreationRequest>;
  updateAccountCreationRequest(id: number, request: Partial<InsertAccountCreationRequest>): Promise<AccountCreationRequest>;
  getAccountCreationRequestsByTeamMember(teamMemberId: number): Promise<AccountCreationRequest[]>;

  // Player accommodation operations
  createPlayerAccommodationRequest(request: InsertPlayerAccommodationRequest): Promise<PlayerAccommodationRequest>;
  getPlayerAccommodationRequestsByTeamRequest(teamRequestId: number): Promise<PlayerAccommodationRequest[]>;
  getPlayerAccommodationRequestsByHotel(hotelId: number): Promise<PlayerAccommodationRequest[]>;
  assignHotelToPlayerAccommodation(accommodationId: number, hotelId: number, roomCategoryId: number, assignedBy: number): Promise<PlayerAccommodationRequest>;
  respondToPlayerAccommodationRequest(accommodationId: number, status: string, reason?: string, respondedBy?: number): Promise<PlayerAccommodationRequest>;
  getPlayerAccommodationRequestsByPlayer(playerId: number): Promise<PlayerAccommodationRequest[]>;
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

  // Admin tournament approval operations
  async getPendingTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).where(eq(tournaments.approved, "false"));
  }

  async approveTournament(tournamentId: number, approvedBy: number): Promise<Tournament> {
    const [approvedTournament] = await db
      .update(tournaments)
      .set({ 
        approved: "true",
        updatedAt: new Date()
      })
      .where(eq(tournaments.id, tournamentId))
      .returning();
    return approvedTournament;
  }

  async rejectTournament(tournamentId: number, rejectionReason: string): Promise<void> {
    await db
      .update(tournaments)
      .set({ 
        approved: "rejected",
        updatedAt: new Date()
      })
      .where(eq(tournaments.id, tournamentId));
  }

  // City management operations
  async getApprovedCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.approved, "true"));
  }

  async getAllCities(): Promise<City[]> {
    return await db.select().from(cities);
  }

  async getPendingCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.approved, "false"));
  }

  async createCityRequest(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async approveCity(cityId: number, approvedBy: number): Promise<City> {
    const [approvedCity] = await db
      .update(cities)
      .set({ 
        approved: "true",
        approvedBy: approvedBy,
        updatedAt: new Date()
      })
      .where(eq(cities.id, cityId))
      .returning();
    return approvedCity;
  }

  async rejectCity(cityId: number, rejectionReason: string): Promise<void> {
    await db
      .update(cities)
      .set({ 
        approved: "rejected",
        rejectionReason: rejectionReason,
        updatedAt: new Date()
      })
      .where(eq(cities.id, cityId));
  }

  // Event Manager operations
  async getTournamentsByManager(managerId: number): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [createdTournament] = await db.insert(tournaments).values(tournament).returning();
    return createdTournament;
  }

  async updateTournament(id: number, tournament: Partial<InsertTournament>): Promise<Tournament> {
    const [updatedTournament] = await db
      .update(tournaments)
      .set({ ...tournament, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return updatedTournament;
  }

  async deleteTournament(id: number): Promise<void> {
    await db.delete(tournaments).where(eq(tournaments.id, id));
  }

  async getMatchesByTournament(tournamentId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
  }

  async getMatchesByManager(managerId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.createdBy, managerId));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [createdMatch] = await db.insert(matches).values(match).returning();
    return createdMatch;
  }

  async updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match> {
    const [updatedMatch] = await db
      .update(matches)
      .set({ ...match, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch;
  }

  async deleteMatch(id: number): Promise<void> {
    await db.delete(matches).where(eq(matches.id, id));
  }

  async getHotelClusters(): Promise<HotelCluster[]> {
    return await db.select().from(hotelClusters);
  }

  async getHotelClustersByManager(managerId: number): Promise<HotelCluster[]> {
    return await db.select().from(hotelClusters).where(eq(hotelClusters.createdBy, managerId));
  }

  async createHotelCluster(cluster: InsertHotelCluster): Promise<HotelCluster> {
    const [createdCluster] = await db.insert(hotelClusters).values(cluster).returning();
    return createdCluster;
  }

  async updateHotelCluster(id: number, cluster: Partial<InsertHotelCluster>): Promise<HotelCluster> {
    const [updatedCluster] = await db
      .update(hotelClusters)
      .set({ ...cluster, updatedAt: new Date() })
      .where(eq(hotelClusters.id, id))
      .returning();
    return updatedCluster;
  }

  async deleteHotelCluster(id: number): Promise<void> {
    await db.delete(hotelClusters).where(eq(hotelClusters.id, id));
  }

  async assignHotelToCluster(hotelId: number, clusterId: number): Promise<Hotel> {
    const [updatedHotel] = await db
      .update(hotels)
      .set({ clusterId, updatedAt: new Date() })
      .where(eq(hotels.id, hotelId))
      .returning();
    return updatedHotel;
  }

  // Team Manager operations
  async getTeamRequestsByManager(managerId: number): Promise<TeamRequest[]> {
    return await db.select().from(teamRequests).where(eq(teamRequests.teamManagerId, managerId));
  }

  async createTeamRequest(teamRequest: InsertTeamRequest): Promise<TeamRequest> {
    const [createdRequest] = await db.insert(teamRequests).values(teamRequest).returning();
    return createdRequest;
  }

  async updateTeamRequest(id: number, teamRequest: Partial<InsertTeamRequest>): Promise<TeamRequest> {
    const [updatedRequest] = await db
      .update(teamRequests)
      .set({ ...teamRequest, updatedAt: new Date() })
      .where(eq(teamRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteTeamRequest(id: number): Promise<void> {
    await db.delete(teamRequests).where(eq(teamRequests.id, id));
  }

  // Team member operations
  async getTeamMembersByRequest(teamRequestId: number): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamRequestId, teamRequestId));
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [createdMember] = await db.insert(teamMembers).values(teamMember).returning();
    return createdMember;
  }

  async updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({ ...teamMember, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  async updateUserProfile(userId: number, memberData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Team approval operations (Event Manager and Admin)
  async getPendingTeamRequests(): Promise<TeamRequest[]> {
    return await db.select().from(teamRequests).where(eq(teamRequests.status, 'pending'));
  }

  async approveTeamRequest(teamRequestId: number, approvedBy: number): Promise<TeamRequest> {
    const [approvedRequest] = await db
      .update(teamRequests)
      .set({ 
        status: 'approved', 
        approvedBy, 
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(teamRequests.id, teamRequestId))
      .returning();
    return approvedRequest;
  }

  async rejectTeamRequest(teamRequestId: number, rejectionReason: string): Promise<void> {
    await db
      .update(teamRequests)
      .set({ 
        status: 'rejected', 
        rejectionReason,
        updatedAt: new Date()
      })
      .where(eq(teamRequests.id, teamRequestId));
  }

  // Account creation operations
  async createAccountCreationRequest(request: InsertAccountCreationRequest): Promise<AccountCreationRequest> {
    const [createdRequest] = await db.insert(accountCreationRequests).values(request).returning();
    return createdRequest;
  }

  async updateAccountCreationRequest(id: number, request: Partial<InsertAccountCreationRequest>): Promise<AccountCreationRequest> {
    const [updatedRequest] = await db
      .update(accountCreationRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(accountCreationRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getAccountCreationRequestsByTeamMember(teamMemberId: number): Promise<AccountCreationRequest[]> {
    return await db.select().from(accountCreationRequests).where(eq(accountCreationRequests.teamMemberId, teamMemberId));
  }

  // Player accommodation operations
  async createPlayerAccommodationRequest(request: InsertPlayerAccommodationRequest): Promise<PlayerAccommodationRequest> {
    const [createdRequest] = await db.insert(playerAccommodationRequests).values(request).returning();
    return createdRequest;
  }

  async getPlayerAccommodationRequestsByTeamRequest(teamRequestId: number): Promise<PlayerAccommodationRequest[]> {
    return await db.select().from(playerAccommodationRequests).where(eq(playerAccommodationRequests.teamRequestId, teamRequestId));
  }

  async getPlayerAccommodationRequestsByHotel(hotelId: number): Promise<PlayerAccommodationRequest[]> {
    return await db.select().from(playerAccommodationRequests).where(eq(playerAccommodationRequests.hotelId, hotelId));
  }

  async assignHotelToPlayerAccommodation(accommodationId: number, hotelId: number, roomCategoryId: number, assignedBy: number): Promise<PlayerAccommodationRequest> {
    const [updatedRequest] = await db
      .update(playerAccommodationRequests)
      .set({
        hotelId,
        roomCategoryId,
        status: 'hotel_assigned',
        assignedBy,
        assignedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(playerAccommodationRequests.id, accommodationId))
      .returning();
    return updatedRequest;
  }

  async respondToPlayerAccommodationRequest(accommodationId: number, status: string, reason?: string, respondedBy?: number): Promise<PlayerAccommodationRequest> {
    const [updatedRequest] = await db
      .update(playerAccommodationRequests)
      .set({
        status,
        hotelResponseReason: reason,
        hotelRespondedBy: respondedBy,
        hotelRespondedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(playerAccommodationRequests.id, accommodationId))
      .returning();
    return updatedRequest;
  }

  async getPlayerAccommodationRequestsByPlayer(playerId: number): Promise<PlayerAccommodationRequest[]> {
    return await db
      .select()
      .from(playerAccommodationRequests)
      .innerJoin(teamMembers, eq(playerAccommodationRequests.teamMemberId, teamMembers.id))
      .where(eq(teamMembers.userId, playerId));
  }
}

export const storage = new DatabaseStorage();
