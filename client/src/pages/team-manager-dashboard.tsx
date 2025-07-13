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
import { Plus, Users, Calendar, Trophy, LogOut, Trash2, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { countryCodes } from '@shared/schema';

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

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const sportsOptions = [
  'Football', 'Basketball', 'Cricket', 'Tennis', 'Volleyball', 'Badminton', 
  'Table Tennis', 'Swimming', 'Athletics', 'Hockey', 'Chess', 'Kabaddi'
];

export default function TeamManagerDashboard() {
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    sport: '',
    tournamentId: '',
    requestAccommodation: false,
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
    sport: ''
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
      requestAccommodation: false,
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
      sport: ''
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
      sport: ''
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="accommodation"
                      checked={teamForm.requestAccommodation}
                      onChange={(e) => setTeamForm({...teamForm, requestAccommodation: e.target.checked})}
                    />
                    <Label htmlFor="accommodation">Request Accommodation</Label>
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
                          sport: ''
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