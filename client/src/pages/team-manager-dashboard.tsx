import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Trophy, LogOut, Trash2, Edit, X, Hotel, CheckCircle, Clock, AlertCircle, UserCheck, UserX, Download, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { countryCodes } from '@shared/schema';
import QRCode from 'qrcode';

interface TeamMember {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  alternateContact?: string;
  dateOfBirth?: string;
  gender: string;
  city?: string;
  address?: string;
  position?: string;
  sport: string;
  requiresAccommodation?: boolean;
  accommodationPreferences?: string;
  userId?: number;
  accountCreated?: boolean;
}

interface TeamRequest {
  id: number;
  teamName: string;
  sport: string;
  tournamentId: number;
  requestAccommodation: boolean;
  specialRequests?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Tournament {
  id: number;
  name: string;
  locations: string;
  startDate: string;
  endDate: string;
  approved: string;
}

interface AccommodationRequest {
  id: number;
  teamMemberId: number;
  teamRequestId: number;
  hotelId?: number;
  roomCategoryId?: number;
  status: string;
  assignedDate?: string;
  checkinDate?: string;
  checkoutDate?: string;
  actualCheckinDate?: string;
  actualCheckoutDate?: string;
  checkinStatus?: string;
  checkoutStatus?: string;
  accommodationPreferences?: string;
  confirmationCode?: string;
  qrCode?: string;
  teamMember?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  hotel?: {
    name: string;
    address: string;
  };
  roomCategory?: {
    name: string;
    pricePerNight: number;
  };
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const sportsOptions = [
  'Football', 'Basketball', 'Cricket', 'Tennis', 'Volleyball', 'Badminton', 
  'Table Tennis', 'Swimming', 'Athletics', 'Hockey', 'Chess', 'Kabaddi'
];

// Accommodation Card Component
function AccommodationCard({ teamRequest }: { teamRequest: TeamRequest }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accommodationRequests, isLoading: accommodationLoading } = useQuery({
    queryKey: [`/api/team-manager/team-requests/${teamRequest.id}/accommodation-requests`],
    enabled: !!teamRequest.id,
  });

  // QR Code generation and download function
  const generateQRCode = async (qrData: string) => {
    try {
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrImageUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const downloadQRCode = async (qrData: string, memberName: string, confirmationCode: string) => {
    try {
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const a = document.createElement('a');
      a.href = qrImageUrl;
      a.download = `${memberName.replace(/\s+/g, '-')}-checkin-qr-${confirmationCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "QR Code Downloaded",
        description: `Check-in QR code for ${memberName} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Download Error",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const QRCodeDisplay = ({ qrData, isLoading }: { qrData: string; isLoading: boolean }) => {
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

    useEffect(() => {
      if (qrData && !isLoading) {
        generateQRCode(qrData).then(setQrImageUrl);
      }
    }, [qrData, isLoading]);

    if (isLoading) {
      return <div className="text-xs text-gray-500">Generating QR...</div>;
    }

    if (!qrImageUrl) {
      return <div className="text-xs text-gray-500">No QR code available</div>;
    }

    return (
      <div className="flex items-center justify-center">
        <div className="w-24 h-24 border border-gray-300 rounded bg-white p-1">
          <img 
            src={qrImageUrl} 
            alt="Check-in QR Code" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  };

  const bulkCheckinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/team-manager/team-requests/${teamRequest.id}/bulk-checkin`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/team-manager/team-requests/${teamRequest.id}/accommodation-requests`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check in players',
        variant: 'destructive',
      });
    },
  });

  const bulkCheckoutMutation = useMutation({
    mutationFn: async (isEarlyCheckout: boolean) => {
      return await apiRequest(`/api/team-manager/team-requests/${teamRequest.id}/bulk-checkout`, {
        method: 'POST',
        body: { isEarlyCheckout },
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/team-manager/team-requests/${teamRequest.id}/accommodation-requests`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check out players',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'hotel_assigned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Hotel className="h-3 w-3 mr-1" />Assigned</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'hotel_rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCheckinStatusBadge = (checkinStatus: string) => {
    switch (checkinStatus) {
      case 'checked_in':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Checked In</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700"><Clock className="h-3 w-3 mr-1" />Pending Check-in</Badge>;
      default:
        return <Badge variant="outline">{checkinStatus}</Badge>;
    }
  };

  const getCheckoutStatusBadge = (checkoutStatus: string) => {
    switch (checkoutStatus) {
      case 'checked_out':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><UserX className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700"><Clock className="h-3 w-3 mr-1" />Pending Check-out</Badge>;
      default:
        return <Badge variant="outline">{checkoutStatus}</Badge>;
    }
  };

  const confirmedRequests = accommodationRequests?.filter((req: AccommodationRequest) => req.status === 'confirmed') || [];
  const checkedInCount = confirmedRequests.filter((req: AccommodationRequest) => req.checkinStatus === 'checked_in').length;
  const canCheckIn = confirmedRequests.some((req: AccommodationRequest) => req.checkinStatus === 'pending');
  const canCheckOut = confirmedRequests.some((req: AccommodationRequest) => req.checkinStatus === 'checked_in' && req.checkoutStatus === 'pending');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Hotel className="h-5 w-5" />
              <span>{teamRequest.teamName}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Sport: {teamRequest.sport} • Tournament ID: {teamRequest.tournamentId}
            </CardDescription>
          </div>
          <Badge className="bg-green-500">
            {teamRequest.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {accommodationLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Accommodation Requests: {accommodationRequests?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                Checked In: {checkedInCount} / {confirmedRequests.length}
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkCheckinMutation.mutate()}
                disabled={!canCheckIn || bulkCheckinMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {bulkCheckinMutation.isPending ? 'Checking In...' : 'Bulk Check In'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkCheckoutMutation.mutate(false)}
                disabled={!canCheckOut || bulkCheckoutMutation.isPending}
              >
                <UserX className="h-4 w-4 mr-2" />
                {bulkCheckoutMutation.isPending ? 'Checking Out...' : 'Bulk Check Out'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkCheckoutMutation.mutate(true)}
                disabled={!canCheckOut || bulkCheckoutMutation.isPending}
              >
                <UserX className="h-4 w-4 mr-2" />
                Early Check Out
              </Button>
            </div>

            {/* Accommodation Requests List */}
            <div className="space-y-3">
              {accommodationRequests?.map((request: AccommodationRequest) => (
                <div key={request.id} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-lg">
                        {request.teamMember?.firstName} {request.teamMember?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.teamMember?.email} • {request.teamMember?.phoneNumber}
                      </div>
                      {request.hotel && (
                        <div className="text-sm text-gray-600">
                          Hotel: {request.hotel.name}
                        </div>
                      )}
                      {request.roomCategory && (
                        <div className="text-sm text-gray-600">
                          Room: {request.roomCategory.name} (₹{request.roomCategory.pricePerNight}/night)
                        </div>
                      )}
                      
                      {/* Reference Code */}
                      {(request.confirmationCode || request.id) && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border">
                          <div className="text-sm font-medium text-blue-800">
                            Reference Code: {request.confirmationCode || `REQ-${request.id}`}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Badges and QR Code */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(request.status)}
                        {request.checkinStatus && getCheckinStatusBadge(request.checkinStatus)}
                        {request.checkoutStatus && getCheckoutStatusBadge(request.checkoutStatus)}
                      </div>
                      
                      {/* QR Code Display */}
                      {(request.confirmationCode || request.id) && (
                        <div className="flex flex-col items-center space-y-1">
                          <QRCodeDisplay 
                            qrData={`Hotel Check-in - ${request.confirmationCode || `REQ-${request.id}`} - ${request.qrCode || `ACCOMMODATION_${request.id}`}`} 
                            isLoading={accommodationLoading}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadQRCode(
                              `Hotel Check-in - ${request.confirmationCode || `REQ-${request.id}`} - ${request.qrCode || `ACCOMMODATION_${request.id}`}`,
                              `${request.teamMember?.firstName} ${request.teamMember?.lastName}`,
                              request.confirmationCode || `REQ-${request.id}`
                            )}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download QR
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Check-in/Check-out dates */}
                  <div className="mt-3 text-xs text-gray-500 grid grid-cols-2 gap-2">
                    {request.checkinDate && (
                      <div>Check-in: {new Date(request.checkinDate).toLocaleDateString()}</div>
                    )}
                    {request.checkoutDate && (
                      <div>Check-out: {new Date(request.checkoutDate).toLocaleDateString()}</div>
                    )}
                    {request.actualCheckinDate && (
                      <div>Actual Check-in: {new Date(request.actualCheckinDate).toLocaleDateString()}</div>
                    )}
                    {request.actualCheckoutDate && (
                      <div>Actual Check-out: {new Date(request.actualCheckoutDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamManagerDashboard() {
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    sport: '',
    tournamentId: '',
    specialRequests: ''
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TeamMember>({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    alternateContact: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    address: '',
    position: '',
    sport: '',
    requiresAccommodation: false,
    accommodationPreferences: ''
  });
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [selectedTeamRequest, setSelectedTeamRequest] = useState<TeamRequest | null>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team requests
  const { data: teamRequests, isLoading: teamRequestsLoading } = useQuery({
    queryKey: ['/api/team-manager/team-requests'],
    queryFn: () => apiRequest('/api/team-manager/team-requests'),
  });

  // Fetch approved tournaments
  const { data: tournaments } = useQuery({
    queryKey: ['/api/tournaments/approved'],
    queryFn: () => apiRequest('/api/tournaments/approved'),
  });

  // Create team request mutation
  const createTeamRequestMutation = useMutation({
    mutationFn: (teamData: any) => apiRequest('/api/team-manager/team-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-manager/team-requests'] });
      toast({ title: 'Team request created successfully' });
      setShowAddTeamDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating team request', description: error.message, variant: 'destructive' });
    },
  });

  // Fetch team members
  const { data: selectedTeamMembers } = useQuery({
    queryKey: ['/api/team-manager/team-requests', selectedTeamRequest?.id, 'members'],
    queryFn: () => apiRequest(`/api/team-manager/team-requests/${selectedTeamRequest?.id}/members`),
    enabled: !!selectedTeamRequest,
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTeamForm({
      teamName: '',
      sport: '',
      tournamentId: '',
      specialRequests: ''
    });
    setTeamMembers([]);
    setCurrentMember({
      firstName: '',
      lastName: '',
      email: '',
      phoneCountryCode: '+91',
      phoneNumber: '',
      alternateContact: '',
      dateOfBirth: '',
      gender: '',
      city: '',
      address: '',
      position: '',
      sport: '',
      requiresAccommodation: false,
      accommodationPreferences: ''
    });
    setEditingMemberIndex(null);
  };

  const addMemberToTeam = () => {
    if (!currentMember.firstName || !currentMember.lastName || !currentMember.email || 
        !currentMember.phoneNumber || !currentMember.gender) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const memberWithSport = { ...currentMember, sport: teamForm.sport };

    if (editingMemberIndex !== null) {
      const updatedMembers = [...teamMembers];
      updatedMembers[editingMemberIndex] = memberWithSport;
      setTeamMembers(updatedMembers);
      setEditingMemberIndex(null);
    } else {
      setTeamMembers([...teamMembers, memberWithSport]);
    }

    setCurrentMember({
      firstName: '',
      lastName: '',
      email: '',
      phoneCountryCode: '+91',
      phoneNumber: '',
      alternateContact: '',
      dateOfBirth: '',
      gender: '',
      city: '',
      address: '',
      position: '',
      sport: '',
      requiresAccommodation: false,
      accommodationPreferences: ''
    });
    
    toast({ title: 'Member added successfully' });
  };

  const editMember = (index: number) => {
    setCurrentMember(teamMembers[index]);
    setEditingMemberIndex(index);
  };

  const removeMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmitTeamRequest = () => {
    if (!teamForm.teamName || !teamForm.sport || !teamForm.tournamentId) {
      toast({ title: 'Please fill in all required team details', variant: 'destructive' });
      return;
    }

    if (teamMembers.length === 0) {
      toast({ title: 'Please add at least one team member', variant: 'destructive' });
      return;
    }

    const requestData = {
      ...teamForm,
      tournamentId: parseInt(teamForm.tournamentId),
      members: teamMembers
    };

    createTeamRequestMutation.mutate(requestData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center">
                <Users className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Manager Dashboard</h1>
                <p className="text-gray-600">Manage your teams and player registrations</p>
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
      <div className="container mx-auto p-6">
        <Tabs defaultValue="team-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
            <TabsTrigger value="add-team">Add New Team</TabsTrigger>
          </TabsList>

          <TabsContent value="team-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Requests</h2>
            </div>

            {teamRequestsLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {teamRequests?.map((request: TeamRequest) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Trophy className="h-5 w-5" />
                            <span>{request.teamName}</span>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Sport: {request.sport} • Tournament ID: {request.tournamentId}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Created: {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Accommodation: {request.requestAccommodation ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {request.specialRequests && (
                          <div className="text-sm text-gray-600">
                            <strong>Special Requests:</strong> {request.specialRequests}
                          </div>
                        )}
                        {request.rejectionReason && (
                          <div className="text-sm text-red-600">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTeamRequest(request);
                            setShowMembersDialog(true);
                          }}
                        >
                          View Members
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accommodation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Accommodation Management</h2>
            </div>

            {teamRequestsLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {teamRequests?.filter((request: TeamRequest) => request.status === 'approved').map((request: TeamRequest) => (
                  <AccommodationCard key={request.id} teamRequest={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Team</CardTitle>
                <CardDescription>Create a new team request with multiple players</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      value={teamForm.teamName}
                      onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sport">Sport *</Label>
                    <Select value={teamForm.sport} onValueChange={(value) => setTeamForm({...teamForm, sport: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sportsOptions.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tournament">Tournament *</Label>
                    <Select value={teamForm.tournamentId} onValueChange={(value) => setTeamForm({...teamForm, tournamentId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tournament" />
                      </SelectTrigger>
                      <SelectContent>
                        {tournaments?.map((tournament: Tournament) => (
                          <SelectItem key={tournament.id} value={tournament.id.toString()}>
                            {tournament.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={teamForm.specialRequests}
                    onChange={(e) => setTeamForm({...teamForm, specialRequests: e.target.value})}
                    placeholder="Any special requirements or requests"
                  />
                </div>

                {/* Add Player Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingMemberIndex !== null ? 'Edit Team Member' : 'Add Team Member'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={currentMember.firstName}
                        onChange={(e) => setCurrentMember({...currentMember, firstName: e.target.value})}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={currentMember.lastName}
                        onChange={(e) => setCurrentMember({...currentMember, lastName: e.target.value})}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentMember.email}
                        onChange={(e) => setCurrentMember({...currentMember, email: e.target.value})}
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneCountryCode">Country Code *</Label>
                      <Select value={currentMember.phoneCountryCode} onValueChange={(value) => setCurrentMember({...currentMember, phoneCountryCode: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map(code => (
                            <SelectItem key={code.code} value={code.code}>
                              {code.code} {code.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={currentMember.phoneNumber}
                        onChange={(e) => setCurrentMember({...currentMember, phoneNumber: e.target.value})}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternateContact">Alternate Contact</Label>
                      <Input
                        id="alternateContact"
                        value={currentMember.alternateContact}
                        onChange={(e) => setCurrentMember({...currentMember, alternateContact: e.target.value})}
                        placeholder="Alternate contact"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={currentMember.dateOfBirth}
                        onChange={(e) => setCurrentMember({...currentMember, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={currentMember.gender} onValueChange={(value) => setCurrentMember({...currentMember, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={currentMember.city}
                        onChange={(e) => setCurrentMember({...currentMember, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={currentMember.address}
                        onChange={(e) => setCurrentMember({...currentMember, address: e.target.value})}
                        placeholder="Full address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={currentMember.position}
                        onChange={(e) => setCurrentMember({...currentMember, position: e.target.value})}
                        placeholder="Player position"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresAccommodation"
                        checked={currentMember.requiresAccommodation}
                        onChange={(e) => setCurrentMember({...currentMember, requiresAccommodation: e.target.checked})}
                      />
                      <Label htmlFor="requiresAccommodation">Requires Accommodation</Label>
                    </div>
                    {currentMember.requiresAccommodation && (
                      <div className="md:col-span-2">
                        <Label htmlFor="accommodationPreferences">Accommodation Preferences</Label>
                        <Textarea
                          id="accommodationPreferences"
                          value={currentMember.accommodationPreferences}
                          onChange={(e) => setCurrentMember({...currentMember, accommodationPreferences: e.target.value})}
                          placeholder="Special accommodation requirements or preferences"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button onClick={addMemberToTeam}>
                      {editingMemberIndex !== null ? 'Update Member' : 'Add Member'}
                    </Button>
                    {editingMemberIndex !== null && (
                      <Button variant="outline" onClick={() => {
                        setEditingMemberIndex(null);
                        setCurrentMember({
                          firstName: '',
                          lastName: '',
                          email: '',
                          phoneCountryCode: '+91',
                          phoneNumber: '',
                          alternateContact: '',
                          dateOfBirth: '',
                          gender: '',
                          city: '',
                          address: '',
                          position: '',
                          sport: '',
                          requiresAccommodation: false,
                          accommodationPreferences: ''
                        });
                      }}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Team Members List */}
                {teamMembers.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Team Members ({teamMembers.length})</h3>
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{member.firstName} {member.lastName}</div>
                            <div className="text-sm text-gray-600">{member.email} • {member.phoneCountryCode} {member.phoneNumber}</div>
                            <div className="text-sm text-gray-600">{member.gender} • {member.position || 'No position'}</div>
                            {member.requiresAccommodation && (
                              <div className="text-sm text-blue-600">
                                Requires Accommodation
                                {member.accommodationPreferences && (
                                  <span className="text-gray-500"> - {member.accommodationPreferences}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editMember(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removeMember(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <Button 
                    onClick={handleSubmitTeamRequest}
                    disabled={createTeamRequestMutation.isPending}
                    className="w-full"
                  >
                    {createTeamRequestMutation.isPending ? 'Creating Team Request...' : 'Submit Team Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Team Members - {selectedTeamRequest?.teamName}</DialogTitle>
            <DialogDescription>
              List of all team members for this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTeamMembers?.map((member: any) => (
              <div key={member.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">{member.firstName} {member.lastName}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                    <div className="text-sm text-gray-600">{member.phoneCountryCode} {member.phoneNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm"><strong>Gender:</strong> {member.gender}</div>
                    <div className="text-sm"><strong>Position:</strong> {member.position || 'Not specified'}</div>
                    <div className="text-sm"><strong>City:</strong> {member.city || 'Not specified'}</div>
                    {member.requiresAccommodation && (
                      <div className="text-sm text-blue-600">
                        <strong>Accommodation:</strong> Required
                        {member.accommodationPreferences && (
                          <div className="text-gray-600 mt-1">{member.accommodationPreferences}</div>
                        )}
                      </div>
                    )}
                    {member.accountCreated && (
                      <Badge variant="secondary">Account Exists</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}