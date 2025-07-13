import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  LogOut, 
  Hotel, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';

export default function PlayerDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    onSuccess: (data) => setUser(data),
    retry: false
  });

  // Fetch accommodation requests
  const { data: accommodationRequests, isLoading: accommodationLoading } = useQuery({
    queryKey: ['/api/player/accommodation-requests'],
    enabled: !!userData && userData.role === 'player'
  });

  const handleLogout = async () => {
    try {
      window.location.href = '/api/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'hotel_approved':
        return 'bg-blue-100 text-blue-800';
      case 'hotel_assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'hotel_rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'hotel_approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'hotel_assigned':
        return <Clock3 className="h-4 w-4" />;
      case 'hotel_rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock3 className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (userLoading || accommodationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Player Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userData?.firstName} {userData?.lastName}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Player Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{userData?.firstName} {userData?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{userData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline">{userData?.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Organization:</span>
                <span className="text-sm">{userData?.organization}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Verification:</span>
                <Badge variant={userData?.isVerified === 'true' ? 'default' : 'secondary'}>
                  {userData?.isVerified === 'true' ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Accommodations:</span>
                <span className="text-sm">{accommodationRequests?.length || 0} requests</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accommodation Requests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Hotel Accommodation Details</h2>
            <Badge variant="outline" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              {accommodationRequests?.length || 0} Requests
            </Badge>
          </div>

          {accommodationRequests && accommodationRequests.length > 0 ? (
            <div className="grid gap-6">
              {accommodationRequests.map((request: any) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Hotel className="h-5 w-5 text-blue-600" />
                          Accommodation Request #{request.id}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Team: {request.teamName || 'N/A'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Accommodation Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Accommodation Details</h4>
                        
                        {request.checkInDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Check-in:</span>
                            <span>{new Date(request.checkInDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {request.checkOutDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Check-out:</span>
                            <span>{new Date(request.checkOutDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {request.checkInTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Check-in Time:</span>
                            <span>{formatDateTime(request.checkInTime)}</span>
                          </div>
                        )}

                        {request.checkOutTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Check-out Time:</span>
                            <span>{formatDateTime(request.checkOutTime)}</span>
                          </div>
                        )}

                        {request.accommodationPreferences && (
                          <div className="text-sm">
                            <span className="font-medium">Preferences:</span>
                            <p className="text-gray-600 mt-1">{request.accommodationPreferences}</p>
                          </div>
                        )}
                      </div>

                      {/* Hotel & Confirmation Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Hotel Information</h4>
                        
                        {request.hotelName && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Hotel:</span>
                            <span>{request.hotelName}</span>
                          </div>
                        )}

                        {request.roomCategoryName && (
                          <div className="text-sm">
                            <span className="font-medium">Room Category:</span>
                            <span className="ml-2">{request.roomCategoryName}</span>
                          </div>
                        )}

                        {request.confirmationCode && (
                          <div className="text-sm">
                            <span className="font-medium">Confirmation Code:</span>
                            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                              {request.confirmationCode}
                            </code>
                          </div>
                        )}

                        {request.qrCode && (
                          <div className="text-sm">
                            <span className="font-medium">QR Code:</span>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4 text-gray-500" />
                                <code className="text-xs font-mono break-all">{request.qrCode}</code>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Information */}
                    {request.hotelResponseReason && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Hotel Response</h5>
                        <p className="text-sm text-gray-600">{request.hotelResponseReason}</p>
                        {request.hotelRespondedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Responded: {formatDateTime(request.hotelRespondedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accommodation Requests</h3>
                <p className="text-gray-600">
                  You don't have any accommodation requests at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}