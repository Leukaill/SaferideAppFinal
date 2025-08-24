import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, Bus, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ['/api/routes'],
    enabled: !!user,
  });

  const { data: trips = [] } = useQuery<any[]>({
    queryKey: ['/api/trips'],
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
    enabled: !!user,
  });

  const activeTrips = trips.filter((trip) => trip.status === 'active');
  const completedTrips = trips.filter((trip) => trip.status === 'completed');
  const delayedTrips = trips.filter((trip) => trip.status === 'delayed');
  const unreadAlerts = alerts.filter((alert) => !alert.isRead);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-ios-green';
      case 'delayed':
        return 'bg-ios-orange';
      case 'completed':
        return 'bg-ios-blue';
      default:
        return 'bg-gray-200 text-ios-text';
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg pb-20" data-testid="manager-dashboard">
      {/* Header */}
      <div className="bg-ios-blue text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-manager-title">Transport Manager</h1>
            <p className="text-sm opacity-90" data-testid="text-overview">Fleet Operations Overview</p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadAlerts.length > 0 && (
              <Badge className="bg-ios-orange text-white text-xs">
                {unreadAlerts.length} Alerts
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="metric-active-trips">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ios-green bg-opacity-20 rounded-full flex items-center justify-center">
                <Bus className="w-5 h-5 text-ios-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTrips.length}</p>
                <p className="text-sm text-ios-text-secondary">Active Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="metric-fleet-efficiency">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ios-blue bg-opacity-20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-ios-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {trips.length > 0 ? Math.round((completedTrips.length / trips.length) * 100) : 0}%
                </p>
                <p className="text-sm text-ios-text-secondary">Efficiency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="card-fleet-status">
          <h3 className="font-semibold mb-3">Fleet Status</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-ios-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-ios-green font-bold">{activeTrips.length}</span>
              </div>
              <p className="text-xs text-ios-text-secondary">On Route</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-ios-orange bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-ios-orange font-bold">{delayedTrips.length}</span>
              </div>
              <p className="text-xs text-ios-text-secondary">Delayed</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-ios-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-ios-blue font-bold">{routes.length}</span>
              </div>
              <p className="text-xs text-ios-text-secondary">Total Routes</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full text-ios-blue font-medium"
            data-testid="button-view-fleet-details"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Fleet Analytics
          </Button>
        </div>

        {/* Schedule Overview */}
        <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="card-schedule-overview">
          <h3 className="font-semibold mb-3">Today's Schedule</h3>
          
          {trips.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No trips scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" data-testid={`trip-${trip.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-ios-blue rounded-xl flex items-center justify-center">
                      <Bus className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-medium">Route {trip.routeId}</span>
                      <p className="text-sm text-ios-text-secondary">
                        {trip.startTime ? new Date(trip.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }) : 'Not started'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-white text-xs ${getStatusColor(trip.status)}`}>
                    {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-3 text-ios-blue font-medium"
            data-testid="button-manage-schedule"
          >
            Manage Full Schedule
          </Button>
        </div>

        {/* Alerts & Issues */}
        <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="card-alerts-issues">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Alerts & Issues</h3>
            {unreadAlerts.length > 0 && (
              <Badge className="bg-ios-orange text-white text-xs">
                {unreadAlerts.length} New
              </Badge>
            )}
          </div>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl" data-testid={`alert-${alert.id}`}>
                  <div className="w-8 h-8 bg-ios-orange bg-opacity-20 rounded-full flex items-center justify-center mt-1">
                    <AlertTriangle className="w-4 h-4 text-ios-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className="text-xs text-ios-text-secondary">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-3 text-ios-blue font-medium"
            data-testid="button-view-all-alerts"
          >
            View All Alerts
          </Button>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
