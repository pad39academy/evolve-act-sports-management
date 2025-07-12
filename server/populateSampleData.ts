import { db } from "./db";
import { 
  tournaments, 
  teams, 
  events, 
  hotelClusters, 
  hotels, 
  playerBookings,
  users 
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function populateSampleData() {
  try {
    console.log("Starting sample data population...");

    // 1. Create tournament
    const [tournament] = await db.insert(tournaments).values({
      name: "Tamilnadu State Level Sports Championship 2025",
      locations: JSON.stringify(["Trichy", "Madurai", "Coimbatore"]),
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-08-15"),
      approved: "true"
    }).returning();

    console.log("Tournament created:", tournament.id);

    // 2. Create teams
    const teamData = [
      // Hockey teams
      { name: "Chennai Chargers", sport: "Hockey", tournamentId: tournament.id },
      { name: "Coimbatore Blades", sport: "Hockey", tournamentId: tournament.id },
      { name: "Tamil Nadu Dragons", sport: "Hockey", tournamentId: tournament.id },
      
      // Football teams
      { name: "Madurai Strikers", sport: "Football", tournamentId: tournament.id },
      { name: "Tirunelveli Tigers", sport: "Football", tournamentId: tournament.id },
      { name: "Chennai City FC", sport: "Football", tournamentId: tournament.id },
      
      // Tennis teams
      { name: "Chennai Aces", sport: "Tennis", tournamentId: tournament.id },
      { name: "Coimbatore Racquets", sport: "Tennis", tournamentId: tournament.id },
      { name: "Chennai Warriors", sport: "Tennis", tournamentId: tournament.id },
      
      // Chess teams
      { name: "Madurai Kings", sport: "Chess", tournamentId: tournament.id },
      { name: "Chennai Knights", sport: "Chess", tournamentId: tournament.id },
      
      // Cricket teams
      { name: "Chennai Warriors", sport: "Cricket", tournamentId: tournament.id },
      { name: "Madurai Royals", sport: "Cricket", tournamentId: tournament.id },
      { name: "Chennai Super Kings", sport: "Cricket", tournamentId: tournament.id },
      
      // Athletics teams
      { name: "Tamil Nadu Sprinters", sport: "Athletics", tournamentId: tournament.id },
      { name: "Coimbatore Runners", sport: "Athletics", tournamentId: tournament.id },
    ];

    await db.insert(teams).values(teamData);
    console.log("Teams created");

    // 3. Create events
    const eventData = [
      // Hockey matches
      {
        name: "Hockey Match 1",
        sport: "Hockey",
        tournamentId: tournament.id,
        date: new Date("2025-08-09T12:00:00"),
        time: "12:00",
        teamsInvolved: JSON.stringify(["Chennai Chargers", "Coimbatore Blades", "Tamil Nadu Dragons"]),
        location: "Trichy"
      },
      {
        name: "Hockey Match 2",
        sport: "Hockey",
        tournamentId: tournament.id,
        date: new Date("2025-08-07T12:00:00"),
        time: "12:00",
        teamsInvolved: JSON.stringify(["Chennai Chargers", "Coimbatore Blades", "Tamil Nadu Dragons"]),
        location: "Trichy"
      },
      
      // Football matches
      {
        name: "Football Match 1",
        sport: "Football",
        tournamentId: tournament.id,
        date: new Date("2025-08-12T10:00:00"),
        time: "10:00",
        teamsInvolved: JSON.stringify(["Madurai Strikers", "Tirunelveli Tigers", "Chennai City FC"]),
        location: "Madurai"
      },
      {
        name: "Football Match 2",
        sport: "Football",
        tournamentId: tournament.id,
        date: new Date("2025-08-03T18:00:00"),
        time: "18:00",
        teamsInvolved: JSON.stringify(["Madurai Strikers", "Tirunelveli Tigers", "Chennai City FC"]),
        location: "Madurai"
      },
      
      // Tennis matches
      {
        name: "Tennis Match 1",
        sport: "Tennis",
        tournamentId: tournament.id,
        date: new Date("2025-08-07T16:00:00"),
        time: "16:00",
        teamsInvolved: JSON.stringify(["Chennai Aces", "Coimbatore Racquets", "Chennai Warriors"]),
        location: "Coimbatore"
      },
      {
        name: "Tennis Match 2",
        sport: "Tennis",
        tournamentId: tournament.id,
        date: new Date("2025-08-13T15:00:00"),
        time: "15:00",
        teamsInvolved: JSON.stringify(["Chennai Aces", "Coimbatore Racquets", "Chennai Warriors"]),
        location: "Coimbatore"
      },
      
      // Chess matches
      {
        name: "Chess Match 1",
        sport: "Chess",
        tournamentId: tournament.id,
        date: new Date("2025-08-13T14:00:00"),
        time: "14:00",
        teamsInvolved: JSON.stringify(["Madurai Kings", "Chennai Knights"]),
        location: "Madurai"
      },
      {
        name: "Chess Match 2",
        sport: "Chess",
        tournamentId: tournament.id,
        date: new Date("2025-08-14T09:00:00"),
        time: "09:00",
        teamsInvolved: JSON.stringify(["Madurai Kings", "Chennai Knights"]),
        location: "Madurai"
      },
      
      // Cricket matches
      {
        name: "Cricket Match 1",
        sport: "Cricket",
        tournamentId: tournament.id,
        date: new Date("2025-08-05T18:00:00"),
        time: "18:00",
        teamsInvolved: JSON.stringify(["Chennai Warriors", "Madurai Royals", "Chennai Super Kings"]),
        location: "Trichy"
      },
      {
        name: "Cricket Match 2",
        sport: "Cricket",
        tournamentId: tournament.id,
        date: new Date("2025-08-05T11:00:00"),
        time: "11:00",
        teamsInvolved: JSON.stringify(["Chennai Warriors", "Madurai Royals", "Chennai Super Kings"]),
        location: "Trichy"
      },
      
      // Athletics matches
      {
        name: "Athletics Match 1",
        sport: "Athletics",
        tournamentId: tournament.id,
        date: new Date("2025-08-04T09:00:00"),
        time: "09:00",
        teamsInvolved: JSON.stringify(["Tamil Nadu Sprinters", "Coimbatore Runners"]),
        location: "Coimbatore"
      },
      {
        name: "Athletics Match 2",
        sport: "Athletics",
        tournamentId: tournament.id,
        date: new Date("2025-08-02T14:00:00"),
        time: "14:00",
        teamsInvolved: JSON.stringify(["Tamil Nadu Sprinters", "Coimbatore Runners"]),
        location: "Coimbatore"
      },
    ];

    await db.insert(events).values(eventData);
    console.log("Events created");

    // 4. Create hotel clusters
    const clusterData = [
      {
        name: "Trichy Sports Cluster",
        city: "Trichy",
        description: "Hotels near major stadiums and sports grounds in Trichy"
      },
      {
        name: "Madurai Stadium Cluster",
        city: "Madurai",
        description: "Hotels close to stadiums and city center in Madurai"
      },
      {
        name: "Coimbatore Arena Cluster",
        city: "Coimbatore",
        description: "Hotels near sports venues and city hotspots in Coimbatore"
      }
    ];

    const clusters = await db.insert(hotelClusters).values(clusterData).returning();
    console.log("Hotel clusters created");

    // 5. Create hotels
    const hotelData = [
      // Trichy hotels
      {
        name: "Courtyard by Marriott Trichy",
        clusterId: clusters[0].id,
        proximityToVenue: "Central, near stadium",
        notableFeatures: "Fitness center, pool, event space",
        totalRooms: 150,
        availableRooms: 120,
        address: "Trichy City Center, Near Sports Complex",
        contactInfo: JSON.stringify({ phone: "+91-431-2345678", email: "trichy@marriott.com" }),
        approved: "true"
      },
      {
        name: "Hotel Deepam",
        clusterId: clusters[0].id,
        proximityToVenue: "Near Jai Sports and Games",
        notableFeatures: "Indoor games, comfortable rooms",
        totalRooms: 80,
        availableRooms: 60,
        address: "Jai Sports Complex Area, Trichy",
        contactInfo: JSON.stringify({ phone: "+91-431-2345679", email: "info@hoteldeepam.com" }),
        approved: "true"
      },
      {
        name: "SRM Hotel Trichy",
        clusterId: clusters[0].id,
        proximityToVenue: "Near Khaja Nagar sports ground",
        notableFeatures: "Family-friendly, close to grounds",
        totalRooms: 100,
        availableRooms: 85,
        address: "Khaja Nagar, Trichy",
        contactInfo: JSON.stringify({ phone: "+91-431-2345680", email: "info@srmhotel.com" }),
        approved: "true"
      },
      
      // Madurai hotels
      {
        name: "Courtyard by Marriott Madurai",
        clusterId: clusters[1].id,
        proximityToVenue: "Near Race Course Stadium, city center",
        notableFeatures: "5-star, event space, pool",
        totalRooms: 180,
        availableRooms: 140,
        address: "Race Course Stadium Area, Madurai",
        contactInfo: JSON.stringify({ phone: "+91-452-2345678", email: "madurai@marriott.com" }),
        approved: "true"
      },
      {
        name: "Sterling V Grand Madurai",
        clusterId: clusters[1].id,
        proximityToVenue: "Close to sports bar & stadium",
        notableFeatures: "Rooftop pool, sports bar",
        totalRooms: 120,
        availableRooms: 95,
        address: "Stadium Road, Madurai",
        contactInfo: JSON.stringify({ phone: "+91-452-2345679", email: "info@sterlingmadurai.com" }),
        approved: "true"
      },
      {
        name: "Regency Madurai by GRT Hotels",
        clusterId: clusters[1].id,
        proximityToVenue: "Near city center and sports complex",
        notableFeatures: "Business center, conference halls",
        totalRooms: 110,
        availableRooms: 90,
        address: "City Center, Madurai",
        contactInfo: JSON.stringify({ phone: "+91-452-2345680", email: "info@grtregency.com" }),
        approved: "true"
      },
      
      // Coimbatore hotels
      {
        name: "Vivanta Coimbatore",
        clusterId: clusters[2].id,
        proximityToVenue: "Near sports arena and city center",
        notableFeatures: "Luxury amenities, spa, pool",
        totalRooms: 160,
        availableRooms: 130,
        address: "Arena District, Coimbatore",
        contactInfo: JSON.stringify({ phone: "+91-422-2345678", email: "coimbatore@vivanta.com" }),
        approved: "true"
      },
      {
        name: "Le Meridien Coimbatore",
        clusterId: clusters[2].id,
        proximityToVenue: "Close to sports venues",
        notableFeatures: "Modern rooms, fitness center",
        totalRooms: 140,
        availableRooms: 115,
        address: "Sports City, Coimbatore",
        contactInfo: JSON.stringify({ phone: "+91-422-2345679", email: "info@lemeridien.com" }),
        approved: "true"
      }
    ];

    const hotelsCreated = await db.insert(hotels).values(hotelData).returning();
    console.log("Hotels created");

    // 6. Create sample player bookings
    // Get player users
    const playerUsers = await db.select().from(users).where(eq(users.role, "player"));
    const eventsList = await db.select().from(events);
    
    if (playerUsers.length > 0 && eventsList.length > 0) {
      const bookingData = [
        // Current/Future bookings
        {
          playerId: playerUsers[0].id,
          tournamentId: tournament.id,
          eventId: eventsList[0].id,
          hotelId: hotelsCreated[0].id,
          teamName: "Chennai Chargers",
          checkInDate: new Date("2025-08-08"),
          checkOutDate: new Date("2025-08-10"),
          qrCode: "QR_CC_001_2025",
          confirmationCode: "CC001",
          status: "confirmed",
          specialRequests: "Ground floor room preferred"
        },
        {
          playerId: playerUsers[1]?.id || playerUsers[0].id,
          tournamentId: tournament.id,
          eventId: eventsList[2].id,
          hotelId: hotelsCreated[3].id,
          teamName: "Madurai Strikers",
          checkInDate: new Date("2025-08-11"),
          checkOutDate: new Date("2025-08-13"),
          qrCode: "QR_MS_001_2025",
          confirmationCode: "MS001",
          status: "confirmed",
          specialRequests: "Vegetarian meals only"
        },
        
        // Past bookings
        {
          playerId: playerUsers[0].id,
          tournamentId: tournament.id,
          eventId: eventsList[11].id,
          hotelId: hotelsCreated[1].id,
          teamName: "Tamil Nadu Sprinters",
          checkInDate: new Date("2025-08-01"),
          checkOutDate: new Date("2025-08-03"),
          checkInTime: new Date("2025-08-01T14:30:00"),
          checkOutTime: new Date("2025-08-03T11:00:00"),
          qrCode: "QR_TS_001_2025",
          confirmationCode: "TS001",
          status: "checked_out",
          specialRequests: "Early check-in requested"
        }
      ];

      await db.insert(playerBookings).values(bookingData);
      console.log("Player bookings created");
    }

    console.log("Sample data population completed successfully!");
    
  } catch (error) {
    console.error("Error populating sample data:", error);
    throw error;
  }
}

// Run the population if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateSampleData()
    .then(() => {
      console.log("Sample data populated successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to populate sample data:", error);
      process.exit(1);
    });
}