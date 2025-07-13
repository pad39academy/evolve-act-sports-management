import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
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
  Clock3,
  Download,
  LogIn,
  LogOut as CheckoutIcon,
  History
} from 'lucide-react';

export default function PlayerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
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

  // QR Code download function
  const downloadQRCode = (qrCode: string, confirmationCode: string) => {
    const qrData = `
Hotel Booking Confirmation
Confirmation Code: ${confirmationCode}
QR Code: ${qrCode}
Generated: ${new Date().toLocaleString()}
    `.trim();
    
    const blob = new Blob([qrData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-booking-${confirmationCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "QR Code Downloaded",
      description: "Your booking QR code has been downloaded successfully.",
    });
  };

  // Player checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (accommodationId: number) => {
      return await apiRequest(`/api/player/accommodation-requests/${accommodationId}/checkout`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Checkout Successful",
        description: "You have been checked out successfully. New QR code generated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/player/accommodation-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // Filter bookings by current and past
  const currentBookings = accommodationRequests?.filter((request: any) => 
    request.status === 'confirmed' && request.checkOutStatus === 'pending'
  ) || [];

  const pastBookings = accommodationRequests?.filter((request: any) => 
    request.status === 'confirmed' && request.checkOutStatus === 'checked_out'
  ) || [];

  const pendingBookings = accommodationRequests?.filter((request: any) => 
    request.status !== 'confirmed'
  ) || [];

  // Check if player can checkout
  const canCheckout = (request: any) => {
    return request.status === 'confirmed' && 
           request.checkInStatus === 'checked_in' && 
           request.checkOutStatus === 'pending';
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
              {accommodationRequests?.length || 0} Total Requests
            </Badge>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Current Bookings ({currentBookings.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Past Bookings ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            {/* Current Bookings Tab */}
            <TabsContent value="current" className="mt-6">
              {currentBookings.length > 0 ? (
                <div className="grid gap-6">
                  {currentBookings.map((request: any) => (
                    <Card key={request.id} className="overflow-hidden border-green-200 bg-green-50">
                      <CardHeader className="bg-green-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Hotel className="h-5 w-5 text-green-600" />
                              Current Booking #{request.id}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Team: {request.teamName || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Active Booking
                            </Badge>
                            {request.checkInStatus === 'checked_in' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <LogIn className="h-4 w-4 mr-1" />
                                Checked In
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Booking Details */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Booking Details</h4>
                            
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

                            {request.actualCheckInTime && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span className="font-medium">Actual Check-in:</span>
                                <span>{formatDateTime(request.actualCheckInTime)}</span>
                              </div>
                            )}

                            {request.accommodationPreferences && (
                              <div className="text-sm">
                                <span className="font-medium">Preferences:</span>
                                <p className="text-gray-600 mt-1">{request.accommodationPreferences}</p>
                              </div>
                            )}
                          </div>

                          {/* Hotel Information */}
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
                                <div className="mt-2 p-3 bg-white rounded-lg border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <QrCode className="h-4 w-4 text-gray-500" />
                                      <code className="text-xs font-mono break-all">{request.qrCode}</code>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadQRCode(request.qrCode, request.confirmationCode)}
                                      className="ml-2"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center gap-4">
                          {canCheckout(request) && (
                            <Button
                              onClick={() => checkoutMutation.mutate(request.id)}
                              disabled={checkoutMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <CheckoutIcon className="h-4 w-4 mr-2" />
                              {checkoutMutation.isPending ? 'Checking Out...' : 'Checkout'}
                            </Button>
                          )}
                          
                          {request.hotelResponseReason && (
                            <div className="flex-1 p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-900 mb-1">Hotel Response</h5>
                              <p className="text-sm text-blue-700">{request.hotelResponseReason}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Bookings</h3>
                    <p className="text-gray-600">
                      You don't have any active hotel bookings at this time.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pending Bookings Tab */}
            <TabsContent value="pending" className="mt-6">
              {pendingBookings.length > 0 ? (
                <div className="grid gap-6">
                  {pendingBookings.map((request: any) => (
                    <Card key={request.id} className="overflow-hidden border-yellow-200 bg-yellow-50">
                      <CardHeader className="bg-yellow-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Hotel className="h-5 w-5 text-yellow-600" />
                              Pending Request #{request.id}
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
                            <h4 className="font-medium text-gray-900">Request Details</h4>
                            
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

                            {request.accommodationPreferences && (
                              <div className="text-sm">
                                <span className="font-medium">Preferences:</span>
                                <p className="text-gray-600 mt-1">{request.accommodationPreferences}</p>
                              </div>
                            )}
                          </div>

                          {/* Hotel Information */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Assignment Status</h4>
                            
                            {request.hotelName ? (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Hotel:</span>
                                <span>{request.hotelName}</span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Hotel:</span>
                                <span className="ml-2">Not assigned yet</span>
                              </div>
                            )}

                            {request.roomCategoryName && (
                              <div className="text-sm">
                                <span className="font-medium">Room Category:</span>
                                <span className="ml-2">{request.roomCategoryName}</span>
                              </div>
                            )}

                            <div className="text-sm">
                              <span className="font-medium">Status:</span>
                              <span className="ml-2 capitalize">{request.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Information */}
                        {request.hotelResponseReason && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Response</h5>
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
                    <Clock3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">
                      You don't have any pending accommodation requests.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Past Bookings Tab */}
            <TabsContent value="history" className="mt-6">
              {pastBookings.length > 0 ? (
                <div className="grid gap-6">
                  {pastBookings.map((request: any) => (
                    <Card key={request.id} className="overflow-hidden border-gray-200 bg-gray-50">
                      <CardHeader className="bg-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <History className="h-5 w-5 text-gray-600" />
                              Past Booking #{request.id}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Team: {request.teamName || 'N/A'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Booking Details */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Booking History</h4>
                            
                            {request.checkInDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Check-in Date:</span>
                                <span>{new Date(request.checkInDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {request.checkOutDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Check-out Date:</span>
                                <span>{new Date(request.checkOutDate).toLocaleDateString()}</span>
                              </div>
                            )}

                            {request.actualCheckInTime && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span className="font-medium">Actual Check-in:</span>
                                <span>{formatDateTime(request.actualCheckInTime)}</span>
                              </div>
                            )}

                            {request.actualCheckOutTime && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-red-500" />
                                <span className="font-medium">Actual Check-out:</span>
                                <span>{formatDateTime(request.actualCheckOutTime)}</span>
                                {request.isEarlyCheckout && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Early Checkout
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Hotel Information */}
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

                            {request.accommodationPreferences && (
                              <div className="text-sm">
                                <span className="font-medium">Preferences:</span>
                                <p className="text-gray-600 mt-1">{request.accommodationPreferences}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Final QR Code for completed bookings */}
                        {request.qrCode && (
                          <div className="mt-6 p-4 bg-white rounded-lg border">
                            <h5 className="font-medium text-gray-900 mb-2">Final QR Code</h5>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4 text-gray-500" />
                                <code className="text-xs font-mono break-all">{request.qrCode}</code>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(request.qrCode, request.confirmationCode)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Bookings</h3>
                    <p className="text-gray-600">
                      You don't have any completed bookings in your history.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}