import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Play, Square, AlertTriangle, Users, Route as RouteIcon, Gauge } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ['/api/routes'],
    enabled: !!user,
  });

  const { data: trips = [] } = useQuery<any[]>({
    queryKey: ['/api/trips'],
    enabled: !!user,
  });

  const activeTrips = trips.filter((trip) => trip.status === 'active');
  const driverRoutes = routes.filter((route) => route.driverId === user?.id);

  const startTripMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const response = await apiRequest('POST', '/api/trips', {
        routeId,
        status: 'active',
        startTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trip started",
        description: "Your trip has been started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start trip",
        variant: "destructive",
      });
    },
  });

  const endTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await apiRequest('PUT', `/api/trips/${tripId}`, {
        status: 'completed',
        endTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trip completed",
        description: "Your trip has been completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to end trip",
        variant: "destructive",
      });
    },
  });

  const reportDelayMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/alerts', {
        type: 'delay',
        message: 'Bus is running behind schedule due to traffic conditions',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Delay reported",
        description: "Parents have been notified about the delay",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report delay",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-ios-green';
      case 'completed':
        return 'bg-ios-blue';
      case 'delayed':
        return 'bg-ios-orange';
      default:
        return 'bg-gray-200 text-ios-text';
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg pb-20" data-testid="driver-dashboard">
      {/* Header */}
      <div className="bg-ios-blue text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-dashboard-title">Driver Dashboard</h1>
            <p className="text-sm opacity-90" data-testid="text-current-route">
              {driverRoutes[0]?.name || 'No route assigned'} • {driverRoutes[0]?.busNumber || 'No bus'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {activeTrips.length > 0 && (
              <Badge className="bg-ios-green px-2 py-1 text-xs">Active Trip</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full text-white hover:bg-white hover:bg-opacity-30"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Trip Controls */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-trip-controls">
          <h3 className="font-semibold mb-3">Trip Controls</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button
              onClick={() => driverRoutes[0] && startTripMutation.mutate(driverRoutes[0].id)}
              disabled={activeTrips.length > 0 || !driverRoutes[0] || startTripMutation.isPending}
              className="bg-ios-green hover:bg-ios-green/90 text-white py-3 rounded-xl font-semibold card-hover"
              data-testid="button-start-trip"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Trip
            </Button>
            
            <Button
              onClick={() => activeTrips[0] && endTripMutation.mutate(activeTrips[0].id)}
              disabled={activeTrips.length === 0 || endTripMutation.isPending}
              className="bg-ios-red hover:bg-ios-red/90 text-white py-3 rounded-xl font-semibold card-hover"
              data-testid="button-end-trip"
            >
              <Square className="w-4 h-4 mr-2" />
              End Trip
            </Button>
          </div>

          <Button
            onClick={() => reportDelayMutation.mutate()}
            disabled={reportDelayMutation.isPending}
            className="w-full bg-ios-orange hover:bg-ios-orange/90 text-white py-3 rounded-xl font-semibold card-hover"
            data-testid="button-report-delay"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Delay
          </Button>
        </div>

        {/* Student Attendance */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-student-attendance">
          <h3 className="font-semibold mb-3">Student Attendance</h3>
          
          <div className="text-center py-8 text-ios-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No students assigned to current trip</p>
            <p className="text-sm mt-1">Students will appear here when you start a trip</p>
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-route-info">
          <h3 className="font-semibold mb-3">Today's Route</h3>
          
          {driverRoutes.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <RouteIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No route assigned</p>
              <p className="text-sm mt-1">Contact your administrator for route assignment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {driverRoutes.map((route: any) => (
                <div key={route.id} className="border border-gray-200 rounded-xl p-3" data-testid={`route-${route.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{route.name}</h4>
                    <Badge className="bg-ios-blue text-white text-xs">
                      Bus #{route.busNumber}
                    </Badge>
                  </div>
                  <p className="text-sm text-ios-text-secondary mb-3">{route.description}</p>
                  
                  {route.stops && route.stops.length > 0 ? (
                    <div className="space-y-2">
                      {route.stops.slice(0, 3).map((stop: any) => (
                        <div key={stop.id} className="flex items-center space-x-3" data-testid={`stop-${stop.id}`}>
                          <div className="w-6 h-6 bg-ios-blue rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">{stop.order}</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-sm">{stop.name}</span>
                            <p className="text-xs text-ios-text-secondary">{stop.time}</p>
                          </div>
                        </div>
                      ))}
                      {route.stops.length > 3 && (
                        <p className="text-xs text-ios-text-secondary text-center">
                          +{route.stops.length - 3} more stops
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-ios-text-secondary">No stops configured</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
