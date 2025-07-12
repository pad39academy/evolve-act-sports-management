import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LogOut, User, Settings, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, logoutUser } from "@/lib/auth";

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
