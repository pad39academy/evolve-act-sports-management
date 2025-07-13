import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, MapPin, Settings, CheckCircle, XCircle, Clock, Hotel, BedDouble, Users, Calendar, DollarSign, Star, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";
import { useLocation } from "wouter";

interface Hotel {
  id: number;
  name: string;
  managerId: number;
  clusterId: number;
  proximityToVenue: string;
  notableFeatures: string;
  totalRooms: number;
  availableRooms: number;
  address: string;
  contactInfo: string;
  approved: string;
  autoApproveBookings: boolean;
  bookingType: string; // 'on_availability' or 'pay_per_use'
  createdAt: string;
  updatedAt: string;
}

interface RoomCategory {
  id: number;
  hotelId: number;
  categoryName: string;
  totalRooms: number;
  availableRooms: number;
  pricePerNight: string;
  amenities: string;
  description: string;
  singleSharingRooms: number;
  twinSharingRooms: number;
  tripleSharingRooms: number;
  createdAt: string;
  updatedAt: string;
}

interface BookingRequest {
  id: number;
  requesterId: number;
  hotelId: number;
  roomCategoryId: number;
  tournamentId: number;
  eventId: number;
  teamName: string;
  numberOfRooms: number;
  checkInDate: string;
  checkOutDate: string;
  specialRequests: string;
  status: string;
  rejectionReason: string;
  approvedAt: string;
  approvedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface AccommodationRequest {
  id: number;
  teamMemberId: number;
  teamRequestId: number;
  clusterId: number;
  hotelId: number;
  roomCategoryId: number;
  checkInDate: string;
  checkOutDate: string;
  accommodationPreferences: string;
  status: string;
  assignedBy: number;
  assignedAt: string;
  hotelResponseReason: string;
  hotelRespondedBy: number;
  hotelRespondedAt: string;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
  // Related data from joins
  teamMemberName?: string;
  teamName?: string;
  hotelName?: string;
  roomCategoryName?: string;
}

export default function HotelManagerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomCategory | null>(null);

  // Hotel form state
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: '',
    proximityToVenue: '',
    notableFeatures: '',
    totalRooms: 0,
    availableRooms: 0,
    contactPhone: '',
    contactEmail: '',
    alternatePhone: '',
    alternateEmail: '',
    autoApproveBookings: false,
    bookingType: 'on_availability', // 'on_availability' or 'pay_per_use'
  });

  // Room form state
  const [roomForm, setRoomForm] = useState({
    categoryName: '',
    totalRooms: 0,
    availableRooms: 0,
    pricePerNight: '',
    amenities: '',
    description: '',
    singleSharingRooms: 0,
    twinSharingRooms: 0,
    tripleSharingRooms: 0,
  });

  // Fetch hotels
  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['/api/hotel-manager/hotels'],
  });

  // Fetch room categories for selected hotel
  const { data: roomCategories, isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'rooms'],
    enabled: !!selectedHotel?.id,
  });

  // Fetch booking requests for selected hotel
  const { data: bookingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'booking-requests'],
    enabled: !!selectedHotel?.id,
  });

  // Fetch pending requests for selected hotel
  const { data: pendingRequests, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'pending-requests'],
    enabled: !!selectedHotel?.id,
  });

  // Fetch accommodation requests for all hotels
  const { data: accommodationRequests = [] } = useQuery({
    queryKey: ['/api/hotel-manager/accommodation-requests'],
  });

  // Hotel mutations
  const createHotelMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/hotel-manager/hotels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel Created",
        description: "Hotel has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels'] });
      setIsHotelDialogOpen(false);
      resetHotelForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hotel",
        variant: "destructive",
      });
    },
  });

  const updateHotelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/hotel-manager/hotels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel Updated",
        description: "Hotel has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels'] });
      setIsHotelDialogOpen(false);
      resetHotelForm();
      setEditingHotel(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hotel",
        variant: "destructive",
      });
    },
  });

  const deleteHotelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hotel-manager/hotels/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel Deleted",
        description: "Hotel has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels'] });
      if (selectedHotel?.id === selectedHotel?.id) {
        setSelectedHotel(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete hotel",
        variant: "destructive",
      });
    },
  });

  // Room mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/hotel-manager/hotels/${selectedHotel?.id}/rooms`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Room Category Created",
        description: "Room category has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'rooms'] });
      setIsRoomDialogOpen(false);
      resetRoomForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room category",
        variant: "destructive",
      });
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/hotel-manager/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Room Category Updated",
        description: "Room category has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'rooms'] });
      setIsRoomDialogOpen(false);
      resetRoomForm();
      setEditingRoom(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update room category",
        variant: "destructive",
      });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hotel-manager/rooms/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Room Category Deleted",
        description: "Room category has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'rooms'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete room category",
        variant: "destructive",
      });
    },
  });

  // Booking request mutations
  const approveRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hotel-manager/booking-requests/${id}/approve`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Approved",
        description: "Booking request has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'booking-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'pending-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return await apiRequest(`/api/hotel-manager/booking-requests/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "Booking request has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'booking-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/hotels', selectedHotel?.id, 'pending-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  // Accommodation response mutations
  const approveAccommodationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/hotel-manager/accommodation-requests/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Accommodation Approved",
        description: "Player accommodation request has been approved",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/accommodation-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve accommodation request",
        variant: "destructive",
      });
    },
  });

  const rejectAccommodationMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return await apiRequest(`/api/hotel-manager/accommodation-requests/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Accommodation Rejected",
        description: "Player accommodation request has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-manager/accommodation-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject accommodation request",
        variant: "destructive",
      });
    },
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Form helpers
  const resetHotelForm = () => {
    setHotelForm({
      name: '',
      address: '',
      proximityToVenue: '',
      notableFeatures: '',
      totalRooms: 0,
      availableRooms: 0,
      contactPhone: '',
      contactEmail: '',
      alternatePhone: '',
      alternateEmail: '',
      autoApproveBookings: false,
      bookingType: 'on_availability',
    });
  };

  const resetRoomForm = () => {
    setRoomForm({
      categoryName: '',
      totalRooms: 0,
      availableRooms: 0,
      pricePerNight: '',
      amenities: '',
      description: '',
      singleSharingRooms: 0,
      twinSharingRooms: 0,
      tripleSharingRooms: 0,
    });
  };

  const handleHotelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine contact fields into a single JSON object
    const contactInfo = JSON.stringify({
      phone: hotelForm.contactPhone,
      email: hotelForm.contactEmail,
      alternatePhone: hotelForm.alternatePhone,
      alternateEmail: hotelForm.alternateEmail,
    });
    
    const submitData = {
      ...hotelForm,
      contactInfo,
    };
    
    if (editingHotel) {
      updateHotelMutation.mutate({ id: editingHotel.id, data: submitData });
    } else {
      createHotelMutation.mutate(submitData);
    }
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoomMutation.mutate({ id: editingRoom.id, data: roomForm });
    } else {
      createRoomMutation.mutate(roomForm);
    }
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    
    // Parse contact info if it exists
    let contactData = { phone: '', email: '', alternatePhone: '', alternateEmail: '' };
    if (hotel.contactInfo) {
      try {
        contactData = JSON.parse(hotel.contactInfo);
      } catch (e) {
        // If parsing fails, treat as old format (plain text)
        contactData = { phone: hotel.contactInfo, email: '', alternatePhone: '', alternateEmail: '' };
      }
    }
    
    setHotelForm({
      name: hotel.name,
      address: hotel.address,
      proximityToVenue: hotel.proximityToVenue,
      notableFeatures: hotel.notableFeatures,
      totalRooms: hotel.totalRooms,
      availableRooms: hotel.availableRooms,
      contactPhone: contactData.phone || '',
      contactEmail: contactData.email || '',
      alternatePhone: contactData.alternatePhone || '',
      alternateEmail: contactData.alternateEmail || '',
      autoApproveBookings: hotel.autoApproveBookings,
      bookingType: hotel.bookingType || 'on_availability',
    });
    setIsHotelDialogOpen(true);
  };

  const handleEditRoom = (room: RoomCategory) => {
    setEditingRoom(room);
    setRoomForm({
      categoryName: room.categoryName,
      totalRooms: room.totalRooms,
      availableRooms: room.availableRooms,
      pricePerNight: room.pricePerNight,
      amenities: room.amenities,
      description: room.description,
      singleSharingRooms: room.singleSharingRooms || 0,
      twinSharingRooms: room.twinSharingRooms || 0,
      tripleSharingRooms: room.tripleSharingRooms || 0,
    });
    setIsRoomDialogOpen(true);
  };

  const handleRejectRequest = (requestId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectRequestMutation.mutate({ id: requestId, reason });
    }
  };

  const handleRejectAccommodation = (requestId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectAccommodationMutation.mutate({ id: requestId, reason });
    }
  };

  if (hotelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center">
                <Hotel className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hotel Manager Dashboard</h1>
                <p className="text-gray-600">Manage your hotels and bookings</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotels Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Hotels</h2>
            <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingHotel(null);
                    resetHotelForm();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Hotel</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                  </DialogTitle>
                  {!editingHotel && (
                    <p className="text-sm text-gray-600 mt-2">
                      New hotels require approval from admin or event manager before they can accept bookings.
                    </p>
                  )}
                </DialogHeader>
                <form onSubmit={handleHotelSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Hotel Name</Label>
                      <Input
                        id="name"
                        value={hotelForm.name}
                        onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="proximityToVenue">Proximity to Venue</Label>
                      <Input
                        id="proximityToVenue"
                        value={hotelForm.proximityToVenue}
                        onChange={(e) => setHotelForm({ ...hotelForm, proximityToVenue: e.target.value })}
                        placeholder="e.g., 5 minutes walk"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={hotelForm.address}
                      onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium mb-3 block">Contact Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={hotelForm.contactPhone}
                          onChange={(e) => setHotelForm({ ...hotelForm, contactPhone: e.target.value })}
                          placeholder="+91-123-456-7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email Address</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={hotelForm.contactEmail}
                          onChange={(e) => setHotelForm({ ...hotelForm, contactEmail: e.target.value })}
                          placeholder="contact@hotel.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alternatePhone">Alternate Phone</Label>
                        <Input
                          id="alternatePhone"
                          type="tel"
                          value={hotelForm.alternatePhone}
                          onChange={(e) => setHotelForm({ ...hotelForm, alternatePhone: e.target.value })}
                          placeholder="+91-123-456-7891"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alternateEmail">Alternate Email</Label>
                        <Input
                          id="alternateEmail"
                          type="email"
                          value={hotelForm.alternateEmail}
                          onChange={(e) => setHotelForm({ ...hotelForm, alternateEmail: e.target.value })}
                          placeholder="alternate@hotel.com"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalRooms">Total Rooms</Label>
                      <Input
                        id="totalRooms"
                        type="number"
                        value={hotelForm.totalRooms}
                        onChange={(e) => setHotelForm({ ...hotelForm, totalRooms: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="availableRooms">Available Rooms</Label>
                      <Input
                        id="availableRooms"
                        type="number"
                        value={hotelForm.availableRooms}
                        onChange={(e) => setHotelForm({ ...hotelForm, availableRooms: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notableFeatures">Notable Features</Label>
                    <Textarea
                      id="notableFeatures"
                      value={hotelForm.notableFeatures}
                      onChange={(e) => setHotelForm({ ...hotelForm, notableFeatures: e.target.value })}
                      placeholder="WiFi, pool, gym, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookingType">Booking Type</Label>
                    <Select value={hotelForm.bookingType} onValueChange={(value) => setHotelForm({ ...hotelForm, bookingType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_availability">On Availability</SelectItem>
                        <SelectItem value="pay_per_use">Pay Per Use</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">
                      {hotelForm.bookingType === 'pay_per_use' 
                        ? 'Fixed rooms allocated to sports with sharing options. Auto-approved bookings.' 
                        : 'Hotel manager controls availability and approves bookings manually.'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoApprove"
                      checked={hotelForm.autoApproveBookings}
                      onCheckedChange={(checked) => setHotelForm({ ...hotelForm, autoApproveBookings: checked })}
                      disabled={hotelForm.bookingType === 'pay_per_use'}
                    />
                    <Label htmlFor="autoApprove">Auto-approve booking requests</Label>
                    {hotelForm.bookingType === 'pay_per_use' && (
                      <span className="text-sm text-gray-500">(Always enabled for pay per use)</span>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsHotelDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createHotelMutation.isPending || updateHotelMutation.isPending}
                    >
                      {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel: Hotel) => (
              <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{hotel.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{hotel.proximityToVenue}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditHotel(hotel)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHotelMutation.mutate(hotel.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Rooms</span>
                      <Badge variant="secondary">{hotel.totalRooms}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available</span>
                      <Badge variant="outline">{hotel.availableRooms}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={
                        hotel.approved === 'approved' ? 'default' : 
                        hotel.approved === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {hotel.approved === 'approved' ? 'Approved' : 
                         hotel.approved === 'pending' ? 'Pending' : 
                         'Rejected'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booking Type</span>
                      <Badge variant={hotel.bookingType === 'pay_per_use' ? "default" : "secondary"}>
                        {hotel.bookingType === 'pay_per_use' ? 'Pay Per Use' : 'On Availability'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto-approve</span>
                      <Badge variant={hotel.autoApproveBookings ? "default" : "secondary"}>
                        {hotel.autoApproveBookings ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedHotel(hotel)}
                      >
                        Manage Hotel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hotel Details */}
        {selectedHotel && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Managing: {selectedHotel.name}
              </h2>
              <Button
                variant="outline"
                onClick={() => setSelectedHotel(null)}
              >
                Back to Hotels
              </Button>
            </div>

            <Tabs defaultValue="rooms" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="rooms">Room Categories</TabsTrigger>
                <TabsTrigger value="requests">Booking Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="accommodation">Accommodation Requests</TabsTrigger>
              </TabsList>

              {/* Room Categories Tab */}
              <TabsContent value="rooms" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Room Categories</h3>
                  <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingRoom(null);
                          resetRoomForm();
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Room Category</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingRoom ? 'Edit Room Category' : 'Add New Room Category'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleRoomSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="categoryName">Category Name</Label>
                            <Input
                              id="categoryName"
                              value={roomForm.categoryName}
                              onChange={(e) => setRoomForm({ ...roomForm, categoryName: e.target.value })}
                              placeholder="e.g., Deluxe, Standard, Suite"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pricePerNight">Price per Night</Label>
                            <Input
                              id="pricePerNight"
                              type="number"
                              step="0.01"
                              value={roomForm.pricePerNight}
                              onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        {selectedHotel?.bookingType === 'pay_per_use' ? (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Room Sharing Configuration</Label>
                              <p className="text-sm text-gray-600">Configure fixed room allocation for sports events</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="singleSharingRooms">Single Sharing Rooms</Label>
                                <Input
                                  id="singleSharingRooms"
                                  type="number"
                                  value={roomForm.singleSharingRooms}
                                  onChange={(e) => setRoomForm({ ...roomForm, singleSharingRooms: parseInt(e.target.value) || 0 })}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="twinSharingRooms">Twin Sharing Rooms</Label>
                                <Input
                                  id="twinSharingRooms"
                                  type="number"
                                  value={roomForm.twinSharingRooms}
                                  onChange={(e) => setRoomForm({ ...roomForm, twinSharingRooms: parseInt(e.target.value) || 0 })}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="tripleSharingRooms">Triple Sharing Rooms</Label>
                                <Input
                                  id="tripleSharingRooms"
                                  type="number"
                                  value={roomForm.tripleSharingRooms}
                                  onChange={(e) => setRoomForm({ ...roomForm, tripleSharingRooms: parseInt(e.target.value) || 0 })}
                                  min="0"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="totalRooms">Total Rooms</Label>
                              <Input
                                id="totalRooms"
                                type="number"
                                value={roomForm.totalRooms}
                                onChange={(e) => setRoomForm({ ...roomForm, totalRooms: parseInt(e.target.value) || 0 })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="availableRooms">Available Rooms</Label>
                              <Input
                                id="availableRooms"
                                type="number"
                                value={roomForm.availableRooms}
                                onChange={(e) => setRoomForm({ ...roomForm, availableRooms: parseInt(e.target.value) || 0 })}
                                required
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <Label htmlFor="amenities">Amenities</Label>
                          <Textarea
                            id="amenities"
                            value={roomForm.amenities}
                            onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                            placeholder="WiFi, TV, AC, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={roomForm.description}
                            onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                            placeholder="Room description..."
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsRoomDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                          >
                            {editingRoom ? 'Update Category' : 'Create Category'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomCategories?.map((room: RoomCategory) => (
                    <Card key={room.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{room.categoryName}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">${room.pricePerNight}/night</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRoomMutation.mutate(room.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedHotel?.bookingType === 'pay_per_use' ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Single Sharing</span>
                                <Badge variant="secondary">{room.singleSharingRooms || 0}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Twin Sharing</span>
                                <Badge variant="secondary">{room.twinSharingRooms || 0}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Triple Sharing</span>
                                <Badge variant="secondary">{room.tripleSharingRooms || 0}</Badge>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Rooms</span>
                                <Badge variant="secondary">{room.totalRooms}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Available</span>
                                <Badge variant="outline">{room.availableRooms}</Badge>
                              </div>
                            </>
                          )}
                          {room.description && (
                            <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                          )}
                          {room.amenities && (
                            <p className="text-xs text-gray-500 mt-1">
                              Amenities: {room.amenities}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Booking Requests Tab */}
              <TabsContent value="requests" className="mt-6">
                <h3 className="text-lg font-medium mb-4">All Booking Requests</h3>
                <div className="space-y-4">
                  {bookingRequests?.map((request: BookingRequest) => (
                    <Card key={request.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{request.teamName}</h4>
                              <Badge 
                                variant={
                                  request.status === 'approved' ? 'default' : 
                                  request.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p>Rooms: {request.numberOfRooms}</p>
                                <p>Check-in: {new Date(request.checkInDate).toLocaleDateString()}</p>
                                <p>Check-out: {new Date(request.checkOutDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                                {request.specialRequests && (
                                  <p className="mt-2">
                                    <span className="font-medium">Special Requests:</span> {request.specialRequests}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => approveRequestMutation.mutate(request.id)}
                                disabled={approveRequestMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={rejectRequestMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Pending Approval Tab */}
              <TabsContent value="pending" className="mt-6">
                <h3 className="text-lg font-medium mb-4">Pending Approval</h3>
                <div className="space-y-4">
                  {pendingRequests?.map((request: BookingRequest) => (
                    <Card key={request.id} className="border-orange-200 bg-orange-50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                              <h4 className="font-medium">{request.teamName}</h4>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p>Rooms: {request.numberOfRooms}</p>
                                <p>Check-in: {new Date(request.checkInDate).toLocaleDateString()}</p>
                                <p>Check-out: {new Date(request.checkOutDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                {request.specialRequests && (
                                  <p className="mt-2">
                                    <span className="font-medium">Special Requests:</span> {request.specialRequests}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveRequestMutation.mutate(request.id)}
                              disabled={approveRequestMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={rejectRequestMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Accommodation Requests Tab */}
              <TabsContent value="accommodation" className="mt-6">
                <h3 className="text-lg font-medium mb-4">Player Accommodation Requests</h3>
                <div className="space-y-4">
                  {accommodationRequests?.filter((request: AccommodationRequest) => request.status === 'hotel_assigned').map((request: AccommodationRequest) => (
                    <Card key={request.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-5 w-5 text-blue-600" />
                              <h4 className="font-medium">{request.teamMemberName || 'Team Member'}</h4>
                              <Badge variant="outline">Team: {request.teamName || 'N/A'}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p>Hotel: {request.hotelName || 'N/A'}</p>
                                <p>Room Category: {request.roomCategoryName || 'N/A'}</p>
                                <p>Status: {request.status}</p>
                              </div>
                              <div>
                                <p>Assigned: {request.assignedAt ? new Date(request.assignedAt).toLocaleDateString() : 'N/A'}</p>
                                {request.accommodationPreferences && (
                                  <p className="mt-2">
                                    <span className="font-medium">Preferences:</span> {request.accommodationPreferences}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveAccommodationMutation.mutate(request.id)}
                              disabled={approveAccommodationMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectAccommodation(request.id)}
                              disabled={rejectAccommodationMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {accommodationRequests?.filter((request: AccommodationRequest) => request.status === 'hotel_assigned').length === 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No accommodation requests pending your approval</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}