import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, RefreshCw, AlertTriangle, Bus, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LiveTracking() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: trips = [] } = useQuery({
    queryKey: ['/api/trips'],
    enabled: !!user,
  });

  const activeTrips = trips.filter((trip: any) => trip.status === 'active');
  const currentTrip = activeTrips[0]; // For demo, show first active trip

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleBack = () => {
    switch (user?.role) {
      case 'parent':
        setLocation('/parent-dashboard');
        break;
      case 'driver':
        setLocation('/driver-dashboard');
        break;
      case 'admin':
        setLocation('/admin-dashboard');
        break;
      case 'manager':
        setLocation('/manager-dashboard');
        break;
      default:
        setLocation('/');
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-white" data-testid="live-tracking-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-ios-blue text-lg p-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold">Live Tracking</h1>
        <Button
          variant="ghost"
          onClick={handleRefresh}
          className="text-ios-blue p-0"
          disabled={isRefreshing}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center" data-testid="map-container">
        {/* Map Placeholder */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-ios-text-secondary font-medium">Live Map Integration</p>
          <p className="text-sm text-ios-text-secondary mt-1">Real-time location tracking will appear here</p>
        </div>
        
        {/* Bus Location Indicator (Demo) */}
        <div className="absolute top-20 left-20 w-8 h-8 bg-ios-blue rounded-full flex items-center justify-center animate-pulse shadow-lg">
          <Bus className="text-white text-sm" />
        </div>

        {/* Home Location Indicator (Demo) */}
        <div className="absolute bottom-20 right-20 w-8 h-8 bg-ios-green rounded-full flex items-center justify-center shadow-lg">
          <Home className="text-white text-sm" />
        </div>

        {/* Live Indicator */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-ios-green text-white text-xs animate-pulse">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Trip Info Card */}
      <div className="p-4 bg-white" data-testid="trip-info-card">
        {!currentTrip ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-600 mb-2">No Active Trips</h3>
            <p className="text-sm text-ios-text-secondary">
              There are currently no active trips to track
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-ios-blue rounded-xl flex items-center justify-center">
                <Bus className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-route-name">
                  Route {currentTrip.routeId}
                </h3>
                <p className="text-sm text-ios-text-secondary" data-testid="text-driver-name">
                  Driver ID: {currentTrip.driverId}
                </p>
              </div>
            </div>

            {/* Trip Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Location</span>
                <span className="text-sm font-medium" data-testid="text-current-location">
                  {currentTrip.currentLocation || 'Updating...'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Trip Status</span>
                <Badge className="bg-ios-green text-white text-xs" data-testid="text-trip-status">
                  {currentTrip.status?.charAt(0).toUpperCase() + currentTrip.status?.slice(1)}
                </Badge>
              </div>

              {currentTrip.estimatedArrival && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">ETA</span>
                  <span className="text-sm font-medium text-ios-green" data-testid="text-eta">
                    {formatTime(currentTrip.estimatedArrival)}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-ios-blue h-2 rounded-full transition-all duration-1000" 
                  style={{ width: '65%' }}
                  data-testid="progress-bar"
                ></div>
              </div>
              <p className="text-xs text-center text-ios-text-secondary">65% to destination</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            onClick={() => {
              if (currentTrip) {
                // In real app, this would call emergency services or school
                alert('Emergency alert sent to school administration and driver.');
              }
            }}
            className="bg-ios-red hover:bg-ios-red/90 text-white py-3 rounded-xl font-semibold card-hover"
            data-testid="button-emergency"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency
          </Button>
          
          <Button
            onClick={() => {
              if (currentTrip) {
                alert('Issue reported to school administration.');
              }
            }}
            variant="outline"
            className="border-ios-blue text-ios-blue py-3 rounded-xl font-semibold card-hover"
            data-testid="button-report-issue"
          >
            <Bus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
