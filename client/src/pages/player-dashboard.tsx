import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, MapPin, Clock, Users, QrCode, Hotel as HotelIcon, CheckCircle, XCircle, Download, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { PlayerBooking, Tournament, Event, Hotel } from "@shared/schema";

interface PlayerBookingsResponse {
  all: PlayerBooking[];
  current: PlayerBooking[];
  past: PlayerBooking[];
}

interface BookingWithDetails extends PlayerBooking {
  tournament?: Tournament;
  event?: Event;
  hotel?: Hotel;
}

// QR Code Component with expansion and download
const QRCodeDisplay = ({ qrCode, bookingId }: { qrCode: string; bookingId: number }) => {
  const downloadQR = () => {
    // Create a simple QR code as SVG
    const qrSize = 200;
    const cellSize = qrSize / 25; // 25x25 grid for simplicity
    
    // Generate a simple pattern based on QR code text
    const pattern = qrCode.split('').map((char, i) => char.charCodeAt(0) % 2 === 0);
    
    let svg = `<svg width="${qrSize}" height="${qrSize}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${qrSize}" height="${qrSize}" fill="white"/>`;
    
    // Create a simple grid pattern
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        const index = (row * 25 + col) % pattern.length;
        if (pattern[index]) {
          svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    
    // Create download link
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-booking-${bookingId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded cursor-pointer hover:bg-blue-100 transition-colors">
          <QrCode className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-mono text-blue-800">{qrCode}</span>
          <Maximize2 className="w-3 h-3 text-blue-600 ml-1" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - Booking #{bookingId}</DialogTitle>
          <DialogDescription>
            Scan this QR code for quick check-in at your hotel
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                <div className="text-xs text-gray-500 font-mono break-all px-2">
                  {qrCode}
                </div>
              </div>
            </div>
          </div>
          
          {/* Download Button */}
          <Button onClick={downloadQR} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function PlayerDashboard() {
  const [selectedTab, setSelectedTab] = useState("current");

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/player/bookings'],
    queryFn: () => apiRequest('/api/player/bookings', { method: 'GET' }),
  });

  const { data: tournaments } = useQuery({
    queryKey: ['/api/tournaments'],
    queryFn: () => apiRequest('/api/tournaments', { method: 'GET' }),
  });

  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events', { method: 'GET' }),
  });

  const { data: hotels } = useQuery({
    queryKey: ['/api/hotels'],
    queryFn: () => apiRequest('/api/hotels', { method: 'GET' }),
  });

  const enrichBookings = (bookings: PlayerBooking[]): BookingWithDetails[] => {
    if (!bookings || !tournaments || !events || !hotels) return [];

    return bookings.map(booking => ({
      ...booking,
      tournament: tournaments.find((t: Tournament) => t.id === booking.tournamentId),
      event: events.find((e: Event) => e.id === booking.eventId),
      hotel: hotels.find((h: Hotel) => h.id === booking.hotelId),
    }));
  };

  const currentBookings = enrichBookings(bookingsData?.current || []);
  const pastBookings = enrichBookings(bookingsData?.past || []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'checked_in': return <HotelIcon className="w-4 h-4" />;
      case 'checked_out': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {booking.event?.name || 'Event Details'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {booking.tournament?.name || 'Tournament'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tournament & Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Team: {booking.teamName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <span>
                {booking.event?.date ? format(new Date(booking.event.date), 'PPP') : 'Date TBD'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{booking.event?.time || 'Time TBD'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{booking.event?.location || 'Location TBD'}</span>
            </div>
          </div>

          {/* Hotel Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <HotelIcon className="w-4 h-4" />
              <span>{booking.hotel?.name || 'Hotel Details'}</span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>{booking.hotel?.proximityToVenue}</p>
              <p className="text-xs">{booking.hotel?.notableFeatures}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Check-in:</span>
                <br />
                {booking.checkInDate ? format(new Date(booking.checkInDate), 'MMM dd') : 'TBD'}
              </div>
              <div>
                <span className="font-medium">Check-out:</span>
                <br />
                {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'MMM dd') : 'TBD'}
              </div>
            </div>

            {/* Past booking timestamps */}
            {booking.status === 'checked_out' && booking.checkInTime && booking.checkOutTime && (
              <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">Checked in:</span>
                  <br />
                  {format(new Date(booking.checkInTime), 'MMM dd, h:mm a')}
                </div>
                <div>
                  <span className="font-medium">Checked out:</span>
                  <br />
                  {format(new Date(booking.checkOutTime), 'MMM dd, h:mm a')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code & Special Requests */}
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {booking.qrCode && (
              <QRCodeDisplay qrCode={booking.qrCode} bookingId={booking.id} />
            )}
            
            {booking.confirmationCode && (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded">
                <span className="text-sm font-medium text-green-800">
                  Code: {booking.confirmationCode}
                </span>
              </div>
            )}
          </div>
          
          {booking.specialRequests && (
            <div className="text-sm text-gray-600 italic">
              Note: {booking.specialRequests}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Dashboard</h1>
          <p className="text-gray-600">
            View your tournament bookings, hotel details, and event schedules
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="current">
              Current & Future Bookings ({currentBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Bookings ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <HotelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Current Bookings
                  </h3>
                  <p className="text-gray-600">
                    You don't have any current or upcoming tournament bookings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-gray-600">
                    Your completed tournament bookings will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}