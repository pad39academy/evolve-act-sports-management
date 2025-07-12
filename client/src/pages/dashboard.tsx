import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LogOut, User, Settings, Calendar, Users, Hotel, Check, X, Trophy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: string;
  isVerified: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Query for pending hotels (only for admins and event managers)
  const { data: pendingHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['/api/admin/hotels/pending'],
    enabled: !!(user && ['admin', 'lead_admin', 'state_admin_manager', 'event_manager'].includes(user.role)),
    retry: false,
  });

  // Query for pending tournaments (only for admins)
  const { data: pendingTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/admin/tournaments/pending'],
    enabled: !!(user && ['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)),
    retry: false,
  });

  // Query for pending cities (only for admins)
  const { data: pendingCities, isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/admin/cities/pending'],
    enabled: !!(user && ['admin', 'lead_admin', 'state_admin_manager'].includes(user.role)),
    retry: false,
  });

  // Hotel approval mutation
  const approveHotelMutation = useMutation({
    mutationFn: async (hotelId: number) => {
      return await apiRequest(`/api/admin/hotels/${hotelId}/approve`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel Approved",
        description: "The hotel has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve hotel",
        variant: "destructive",
      });
    },
  });

  // Hotel rejection mutation  
  const rejectHotelMutation = useMutation({
    mutationFn: async ({ hotelId, reason }: { hotelId: number; reason: string }) => {
      return await apiRequest(`/api/admin/hotels/${hotelId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel Rejected",
        description: "The hotel has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject hotel",
        variant: "destructive",
      });
    },
  });

  // Tournament approval mutation
  const approveTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      return await apiRequest(`/api/admin/tournaments/${tournamentId}/approve`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "Tournament Approved",
        description: "The tournament has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tournaments/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve tournament",
        variant: "destructive",
      });
    },
  });

  // Tournament rejection mutation
  const rejectTournamentMutation = useMutation({
    mutationFn: async ({ tournamentId, reason }: { tournamentId: number; reason: string }) => {
      return await apiRequest(`/api/admin/tournaments/${tournamentId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Tournament Rejected",
        description: "The tournament has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tournaments/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject tournament",
        variant: "destructive",
      });
    },
  });

  // City approval mutation
  const approveCityMutation = useMutation({
    mutationFn: async (cityId: number) => {
      return await apiRequest(`/api/admin/cities/${cityId}/approve`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      toast({
        title: "City Approved",
        description: "The city has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve city",
        variant: "destructive",
      });
    },
  });

  // City rejection mutation
  const rejectCityMutation = useMutation({
    mutationFn: async ({ cityId, reason }: { cityId: number; reason: string }) => {
      return await apiRequest(`/api/admin/cities/${cityId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "City Rejected",
        description: "The city has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject city",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect users to their specific dashboard
      if (userData.role === 'player') {
        setLocation('/player-dashboard');
        return;
      }
      
      if (userData.role === 'hotel_manager') {
        setLocation('/hotel-manager-dashboard');
        return;
      }
      
      if (userData.role === 'event_manager') {
        setLocation('/event-manager-dashboard');
        return;
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      });
      setLocation("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      state_admin_manager: "bg-purple-100 text-purple-800",
      lead_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      event_manager: "bg-green-100 text-green-800",
      team_manager: "bg-yellow-100 text-yellow-800",
      player: "bg-gray-100 text-gray-800",
      hotel_manager: "bg-indigo-100 text-indigo-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getRoleDisplayName = (role: string) => {
    const names = {
      state_admin_manager: "State Admin Manager",
      lead_admin: "Lead Admin",
      admin: "Admin",
      event_manager: "Event Manager",
      team_manager: "Team Manager",
      player: "Player",
      hotel_manager: "Hotel Manager",
    };
    return names[role as keyof typeof names] || role;
  };

  const handleRejectHotel = (hotelId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectHotelMutation.mutate({ hotelId, reason });
    }
  };

  const handleRejectTournament = (tournamentId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectTournamentMutation.mutate({ tournamentId, reason });
    }
  };

  const handleApproveCity = (cityId: number) => {
    approveCityMutation.mutate(cityId);
  };

  const handleRejectCity = (cityId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectCityMutation.mutate({ cityId, reason });
    }
  };

  const canApproveHotels = user && ['admin', 'lead_admin', 'state_admin_manager', 'event_manager'].includes(user.role);
  const canApproveTournaments = user && ['admin', 'lead_admin', 'state_admin_manager'].includes(user.role);
  const canApproveCities = user && ['admin', 'lead_admin', 'state_admin_manager'].includes(user.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Evolve Act</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to your sports event management dashboard</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || "")}`}>
                  {getRoleDisplayName(user?.role || "")}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium">{user?.organization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isVerified === "true" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {user?.isVerified === "true" ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Calendar className="h-8 w-8" />
                  <span>Create Event</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Users className="h-8 w-8" />
                  <span>Manage Teams</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <User className="h-8 w-8" />
                  <span>View Players</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Settings className="h-8 w-8" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotel Approval Section (for admins and event managers) */}
        {canApproveHotels && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hotel className="h-5 w-5" />
                <span>Hotel Approvals</span>
                {pendingHotels && pendingHotels.length > 0 && (
                  <Badge variant="secondary">{pendingHotels.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hotelsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading pending hotels...</p>
                </div>
              ) : pendingHotels && pendingHotels.length > 0 ? (
                <div className="space-y-4">
                  {pendingHotels.map((hotel: any) => (
                    <div key={hotel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{hotel.name}</h4>
                        <p className="text-sm text-gray-600">{hotel.address}</p>
                        <p className="text-sm text-gray-500">
                          {hotel.totalRooms} rooms • {hotel.proximityToVenue}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveHotelMutation.mutate(hotel.id)}
                          disabled={approveHotelMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectHotel(hotel.id)}
                          disabled={rejectHotelMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending hotel approvals</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All hotels are currently approved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tournament Approval Section (for admins only) */}
        {canApproveTournaments && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Tournament Approvals</span>
                {pendingTournaments && pendingTournaments.length > 0 && (
                  <Badge variant="secondary">{pendingTournaments.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading pending tournaments...</p>
                </div>
              ) : pendingTournaments && pendingTournaments.length > 0 ? (
                <div className="space-y-4">
                  {pendingTournaments.map((tournament: any) => (
                    <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{tournament.name}</h4>
                        <p className="text-sm text-gray-600">Locations: {tournament.locations}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Event Manager: {tournament.eventManagerName}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveTournamentMutation.mutate(tournament.id)}
                          disabled={approveTournamentMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectTournament(tournament.id)}
                          disabled={rejectTournamentMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending tournament approvals</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All tournaments are currently approved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* City Approval Section (for admins only) */}
        {canApproveCities && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>City Approvals</span>
                {pendingCities && pendingCities.length > 0 && (
                  <Badge variant="secondary">{pendingCities.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citiesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading pending cities...</p>
                </div>
              ) : pendingCities && pendingCities.length > 0 ? (
                <div className="space-y-4">
                  {pendingCities.map((city: any) => (
                    <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{city.name}</h4>
                        <p className="text-sm text-gray-600">{city.state}, {city.country}</p>
                        <p className="text-sm text-gray-500">
                          Requested on: {new Date(city.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveCity(city.id)}
                          disabled={approveCityMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectCity(city.id)}
                          disabled={rejectCityMutation.isPending}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending city approvals</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All cities are currently approved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">
                Your recent events and actions will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
