import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Trophy, Building, Plus, Edit, Trash2, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Tournament {
  id: number;
  name: string;
  locations: string;
  startDate: string;
  endDate: string;
  approved: string;
  createdAt: string;
  updatedAt: string;
}

interface Match {
  id: number;
  tournamentId: number;
  eventId?: number;
  matchName: string;
  sport: string;
  team1: string;
  team2: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  venueAddress?: string;
  clusterId?: number;
  status: string;
  result?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface HotelCluster {
  id: number;
  name: string;
  city: string;
  stadiumName?: string;
  stadiumAddress?: string;
  description?: string;
  maxRadius: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

interface Hotel {
  id: number;
  name: string;
  managerId: number;
  clusterId?: number;
  proximityToVenue?: string;
  notableFeatures?: string;
  totalRooms: number;
  availableRooms: number;
  address?: string;
  contactInfo?: string;
  approved: string;
  autoApproveBookings: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EventManagerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<HotelCluster | null>(null);
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showClusterDialog, setShowClusterDialog] = useState(false);
  const [showHotelAssignDialog, setShowHotelAssignDialog] = useState(false);
  
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    locations: '',
    startDate: '',
    endDate: '',
    approved: 'false'
  });
  
  const [matchForm, setMatchForm] = useState({
    tournamentId: '',
    matchName: '',
    sport: '',
    team1: '',
    team2: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    venueAddress: '',
    clusterId: '',
    status: 'scheduled',
    result: '',
    notes: ''
  });
  
  const [clusterForm, setClusterForm] = useState({
    name: '',
    city: '',
    stadiumName: '',
    stadiumAddress: '',
    description: '',
    maxRadius: 10
  });
  
  const [hotelAssignForm, setHotelAssignForm] = useState({
    hotelId: '',
    clusterId: ''
  });

  // Fetch tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/event-manager/tournaments'],
    retry: false,
  });

  // Fetch matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/event-manager/matches'],
    retry: false,
  });

  // Fetch hotel clusters
  const { data: clusters, isLoading: clustersLoading } = useQuery({
    queryKey: ['/api/event-manager/clusters'],
    retry: false,
  });

  // Fetch all clusters for selection
  const { data: allClusters } = useQuery({
    queryKey: ['/api/event-manager/all-clusters'],
    retry: false,
  });

  // Fetch all hotels
  const { data: hotels } = useQuery({
    queryKey: ['/api/hotels'],
    retry: false,
  });

  // Tournament mutations
  const createTournamentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/event-manager/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/tournaments'] });
      toast({ title: 'Tournament created successfully' });
      setShowTournamentDialog(false);
      resetTournamentForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating tournament', description: error.message, variant: 'destructive' });
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/event-manager/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/tournaments'] });
      toast({ title: 'Tournament updated successfully' });
      setShowTournamentDialog(false);
      resetTournamentForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating tournament', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/event-manager/tournaments/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/tournaments'] });
      toast({ title: 'Tournament deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting tournament', description: error.message, variant: 'destructive' });
    },
  });

  // Match mutations
  const createMatchMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/event-manager/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/matches'] });
      toast({ title: 'Match created successfully' });
      setShowMatchDialog(false);
      resetMatchForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating match', description: error.message, variant: 'destructive' });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/event-manager/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/matches'] });
      toast({ title: 'Match updated successfully' });
      setShowMatchDialog(false);
      resetMatchForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating match', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/event-manager/matches/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/matches'] });
      toast({ title: 'Match deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting match', description: error.message, variant: 'destructive' });
    },
  });

  // Cluster mutations
  const createClusterMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/event-manager/clusters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/clusters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/all-clusters'] });
      toast({ title: 'Hotel cluster created successfully' });
      setShowClusterDialog(false);
      resetClusterForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating cluster', description: error.message, variant: 'destructive' });
    },
  });

  const updateClusterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/event-manager/clusters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/clusters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/all-clusters'] });
      toast({ title: 'Hotel cluster updated successfully' });
      setShowClusterDialog(false);
      resetClusterForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating cluster', description: error.message, variant: 'destructive' });
    },
  });

  const deleteClusterMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/event-manager/clusters/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/clusters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/all-clusters'] });
      toast({ title: 'Hotel cluster deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting cluster', description: error.message, variant: 'destructive' });
    },
  });

  // Hotel assignment mutation
  const assignHotelMutation = useMutation({
    mutationFn: ({ hotelId, clusterId }: { hotelId: number; clusterId: number }) => 
      apiRequest(`/api/event-manager/hotels/${hotelId}/assign-cluster`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/event-manager/all-clusters'] });
      toast({ title: 'Hotel assigned to cluster successfully' });
      setShowHotelAssignDialog(false);
      resetHotelAssignForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error assigning hotel', description: error.message, variant: 'destructive' });
    },
  });

  const resetTournamentForm = () => {
    setTournamentForm({
      name: '',
      locations: '',
      startDate: '',
      endDate: '',
      approved: 'false'
    });
    setSelectedTournament(null);
  };

  const resetMatchForm = () => {
    setMatchForm({
      tournamentId: '',
      matchName: '',
      sport: '',
      team1: '',
      team2: '',
      matchDate: '',
      matchTime: '',
      venue: '',
      venueAddress: '',
      clusterId: '',
      status: 'scheduled',
      result: '',
      notes: ''
    });
    setSelectedMatch(null);
  };

  const resetClusterForm = () => {
    setClusterForm({
      name: '',
      city: '',
      stadiumName: '',
      stadiumAddress: '',
      description: '',
      maxRadius: 10
    });
    setSelectedCluster(null);
  };

  const resetHotelAssignForm = () => {
    setHotelAssignForm({
      hotelId: '',
      clusterId: ''
    });
  };

  const handleEditTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setTournamentForm({
      name: tournament.name,
      locations: tournament.locations,
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0],
      approved: tournament.approved
    });
    setShowTournamentDialog(true);
  };

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setMatchForm({
      tournamentId: match.tournamentId.toString(),
      matchName: match.matchName,
      sport: match.sport,
      team1: match.team1,
      team2: match.team2,
      matchDate: match.matchDate.split('T')[0],
      matchTime: match.matchTime,
      venue: match.venue,
      venueAddress: match.venueAddress || '',
      clusterId: match.clusterId?.toString() || '',
      status: match.status,
      result: match.result || '',
      notes: match.notes || ''
    });
    setShowMatchDialog(true);
  };

  const handleEditCluster = (cluster: HotelCluster) => {
    setSelectedCluster(cluster);
    setClusterForm({
      name: cluster.name,
      city: cluster.city,
      stadiumName: cluster.stadiumName || '',
      stadiumAddress: cluster.stadiumAddress || '',
      description: cluster.description || '',
      maxRadius: cluster.maxRadius
    });
    setShowClusterDialog(true);
  };

  const handleTournamentSubmit = () => {
    if (selectedTournament) {
      updateTournamentMutation.mutate({ id: selectedTournament.id, data: tournamentForm });
    } else {
      createTournamentMutation.mutate(tournamentForm);
    }
  };

  const handleMatchSubmit = () => {
    const matchData = {
      ...matchForm,
      tournamentId: parseInt(matchForm.tournamentId),
      clusterId: matchForm.clusterId ? parseInt(matchForm.clusterId) : null,
    };
    
    if (selectedMatch) {
      updateMatchMutation.mutate({ id: selectedMatch.id, data: matchData });
    } else {
      createMatchMutation.mutate(matchData);
    }
  };

  const handleClusterSubmit = () => {
    if (selectedCluster) {
      updateClusterMutation.mutate({ id: selectedCluster.id, data: clusterForm });
    } else {
      createClusterMutation.mutate(clusterForm);
    }
  };

  const handleHotelAssignSubmit = () => {
    if (hotelAssignForm.hotelId && hotelAssignForm.clusterId) {
      assignHotelMutation.mutate({ 
        hotelId: parseInt(hotelAssignForm.hotelId), 
        clusterId: parseInt(hotelAssignForm.clusterId) 
      });
    }
  };

  if (tournamentsLoading || matchesLoading || clustersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Event Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Event Manager Dashboard</h1>
      
      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="clusters">Hotel Clusters</TabsTrigger>
          <TabsTrigger value="hotels">Assign Hotels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tournaments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Tournament Management</h2>
            <Button onClick={() => setShowTournamentDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tournament
            </Button>
          </div>
          
          <div className="grid gap-4">
            {tournaments?.map((tournament: Tournament) => (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tournament.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {tournament.locations}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tournament.approved === 'true' ? 'default' : 'secondary'}>
                        {tournament.approved === 'true' ? 'Approved' : 'Pending'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditTournament(tournament)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTournamentMutation.mutate(tournament.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Match Management</h2>
            <Button onClick={() => setShowMatchDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Match
            </Button>
          </div>
          
          <div className="grid gap-4">
            {matches?.map((match: Match) => (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{match.matchName}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {match.team1} vs {match.team2}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.matchDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {match.matchTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.venue}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={match.status === 'completed' ? 'default' : match.status === 'ongoing' ? 'secondary' : 'outline'}>
                        {match.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditMatch(match)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMatchMutation.mutate(match.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="clusters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Hotel Clusters</h2>
            <Button onClick={() => setShowClusterDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cluster
            </Button>
          </div>
          
          <div className="grid gap-4">
            {clusters?.map((cluster: HotelCluster) => (
              <Card key={cluster.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{cluster.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {cluster.city}
                          </span>
                          {cluster.stadiumName && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {cluster.stadiumName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {cluster.maxRadius}km radius
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCluster(cluster)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteClusterMutation.mutate(cluster.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="hotels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Assign Hotels to Clusters</h2>
            <Button onClick={() => setShowHotelAssignDialog(true)}>
              <Link className="w-4 h-4 mr-2" />
              Assign Hotel
            </Button>
          </div>
          
          <div className="grid gap-4">
            {hotels?.map((hotel: Hotel) => (
              <Card key={hotel.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{hotel.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {hotel.address || 'No address'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {hotel.totalRooms} rooms
                          </span>
                          {hotel.clusterId && (
                            <span className="flex items-center gap-1">
                              <Link className="w-4 h-4" />
                              Cluster: {allClusters?.find(c => c.id === hotel.clusterId)?.name || 'Unknown'}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hotel.approved === 'true' ? 'default' : 'secondary'}>
                        {hotel.approved === 'true' ? 'Approved' : 'Pending'}
                      </Badge>
                      <Badge variant={hotel.clusterId ? 'default' : 'outline'}>
                        {hotel.clusterId ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tournament Dialog */}
      <Dialog open={showTournamentDialog} onOpenChange={setShowTournamentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTournament ? 'Edit Tournament' : 'Add Tournament'}</DialogTitle>
            <DialogDescription>
              {selectedTournament ? 'Update tournament information' : 'Create a new tournament'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tournament-name">Tournament Name</Label>
              <Input
                id="tournament-name"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                placeholder="Enter tournament name"
              />
            </div>
            <div>
              <Label htmlFor="tournament-locations">Locations</Label>
              <Input
                id="tournament-locations"
                value={tournamentForm.locations}
                onChange={(e) => setTournamentForm({...tournamentForm, locations: e.target.value})}
                placeholder="Enter locations (comma-separated)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tournament-start">Start Date</Label>
                <Input
                  id="tournament-start"
                  type="date"
                  value={tournamentForm.startDate}
                  onChange={(e) => setTournamentForm({...tournamentForm, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tournament-end">End Date</Label>
                <Input
                  id="tournament-end"
                  type="date"
                  value={tournamentForm.endDate}
                  onChange={(e) => setTournamentForm({...tournamentForm, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTournamentSubmit}>
                {selectedTournament ? 'Update' : 'Create'} Tournament
              </Button>
              <Button variant="outline" onClick={() => setShowTournamentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMatch ? 'Edit Match' : 'Add Match'}</DialogTitle>
            <DialogDescription>
              {selectedMatch ? 'Update match information' : 'Create a new match'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match-tournament">Tournament</Label>
                <Select value={matchForm.tournamentId} onValueChange={(value) => setMatchForm({...matchForm, tournamentId: value})}>
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
              <div>
                <Label htmlFor="match-name">Match Name</Label>
                <Input
                  id="match-name"
                  value={matchForm.matchName}
                  onChange={(e) => setMatchForm({...matchForm, matchName: e.target.value})}
                  placeholder="Enter match name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="match-sport">Sport</Label>
                <Input
                  id="match-sport"
                  value={matchForm.sport}
                  onChange={(e) => setMatchForm({...matchForm, sport: e.target.value})}
                  placeholder="Enter sport"
                />
              </div>
              <div>
                <Label htmlFor="match-team1">Team 1</Label>
                <Input
                  id="match-team1"
                  value={matchForm.team1}
                  onChange={(e) => setMatchForm({...matchForm, team1: e.target.value})}
                  placeholder="Enter team 1"
                />
              </div>
              <div>
                <Label htmlFor="match-team2">Team 2</Label>
                <Input
                  id="match-team2"
                  value={matchForm.team2}
                  onChange={(e) => setMatchForm({...matchForm, team2: e.target.value})}
                  placeholder="Enter team 2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match-date">Match Date</Label>
                <Input
                  id="match-date"
                  type="date"
                  value={matchForm.matchDate}
                  onChange={(e) => setMatchForm({...matchForm, matchDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="match-time">Match Time</Label>
                <Input
                  id="match-time"
                  type="time"
                  value={matchForm.matchTime}
                  onChange={(e) => setMatchForm({...matchForm, matchTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="match-venue">Venue</Label>
              <Input
                id="match-venue"
                value={matchForm.venue}
                onChange={(e) => setMatchForm({...matchForm, venue: e.target.value})}
                placeholder="Enter venue"
              />
            </div>
            <div>
              <Label htmlFor="match-venue-address">Venue Address</Label>
              <Textarea
                id="match-venue-address"
                value={matchForm.venueAddress}
                onChange={(e) => setMatchForm({...matchForm, venueAddress: e.target.value})}
                placeholder="Enter venue address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match-cluster">Hotel Cluster</Label>
                <Select value={matchForm.clusterId} onValueChange={(value) => setMatchForm({...matchForm, clusterId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClusters?.map((cluster: HotelCluster) => (
                      <SelectItem key={cluster.id} value={cluster.id.toString()}>
                        {cluster.name} - {cluster.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="match-status">Status</Label>
                <Select value={matchForm.status} onValueChange={(value) => setMatchForm({...matchForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="match-notes">Notes</Label>
              <Textarea
                id="match-notes"
                value={matchForm.notes}
                onChange={(e) => setMatchForm({...matchForm, notes: e.target.value})}
                placeholder="Enter match notes"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleMatchSubmit}>
                {selectedMatch ? 'Update' : 'Create'} Match
              </Button>
              <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cluster Dialog */}
      <Dialog open={showClusterDialog} onOpenChange={setShowClusterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCluster ? 'Edit Hotel Cluster' : 'Add Hotel Cluster'}</DialogTitle>
            <DialogDescription>
              {selectedCluster ? 'Update cluster information' : 'Create a new hotel cluster near a stadium'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cluster-name">Cluster Name</Label>
              <Input
                id="cluster-name"
                value={clusterForm.name}
                onChange={(e) => setClusterForm({...clusterForm, name: e.target.value})}
                placeholder="Enter cluster name"
              />
            </div>
            <div>
              <Label htmlFor="cluster-city">City</Label>
              <Input
                id="cluster-city"
                value={clusterForm.city}
                onChange={(e) => setClusterForm({...clusterForm, city: e.target.value})}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="cluster-stadium">Stadium Name</Label>
              <Input
                id="cluster-stadium"
                value={clusterForm.stadiumName}
                onChange={(e) => setClusterForm({...clusterForm, stadiumName: e.target.value})}
                placeholder="Enter stadium name"
              />
            </div>
            <div>
              <Label htmlFor="cluster-stadium-address">Stadium Address</Label>
              <Textarea
                id="cluster-stadium-address"
                value={clusterForm.stadiumAddress}
                onChange={(e) => setClusterForm({...clusterForm, stadiumAddress: e.target.value})}
                placeholder="Enter stadium address"
              />
            </div>
            <div>
              <Label htmlFor="cluster-description">Description</Label>
              <Textarea
                id="cluster-description"
                value={clusterForm.description}
                onChange={(e) => setClusterForm({...clusterForm, description: e.target.value})}
                placeholder="Enter cluster description"
              />
            </div>
            <div>
              <Label htmlFor="cluster-radius">Maximum Radius (km)</Label>
              <Input
                id="cluster-radius"
                type="number"
                value={clusterForm.maxRadius}
                onChange={(e) => setClusterForm({...clusterForm, maxRadius: parseInt(e.target.value) || 10})}
                placeholder="Enter maximum radius"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClusterSubmit}>
                {selectedCluster ? 'Update' : 'Create'} Cluster
              </Button>
              <Button variant="outline" onClick={() => setShowClusterDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hotel Assignment Dialog */}
      <Dialog open={showHotelAssignDialog} onOpenChange={setShowHotelAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Hotel to Cluster</DialogTitle>
            <DialogDescription>
              Select a hotel and assign it to a cluster near a stadium
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assign-hotel">Select Hotel</Label>
              <Select value={hotelAssignForm.hotelId} onValueChange={(value) => setHotelAssignForm({...hotelAssignForm, hotelId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels?.map((hotel: Hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name} - {hotel.address || 'No address'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assign-cluster">Select Cluster</Label>
              <Select value={hotelAssignForm.clusterId} onValueChange={(value) => setHotelAssignForm({...hotelAssignForm, clusterId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  {allClusters?.map((cluster: HotelCluster) => (
                    <SelectItem key={cluster.id} value={cluster.id.toString()}>
                      {cluster.name} - {cluster.city} ({cluster.stadiumName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleHotelAssignSubmit} disabled={!hotelAssignForm.hotelId || !hotelAssignForm.clusterId}>
                Assign Hotel
              </Button>
              <Button variant="outline" onClick={() => setShowHotelAssignDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}