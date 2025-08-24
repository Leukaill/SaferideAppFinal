import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Route as RouteIcon, UserCheck, Settings, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
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

  const activeRoutes = routes.filter((route) => route.isActive);
  const activeTrips = trips.filter((trip) => trip.status === 'active');

  return (
    <div className="min-h-screen bg-ios-bg pb-20" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-ios-blue text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-sm opacity-90" data-testid="text-school-info">School Transport Management</p>
          </div>
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

      <div className="p-4 space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="stat-active-routes">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ios-blue bg-opacity-20 rounded-full flex items-center justify-center">
                <RouteIcon className="w-5 h-5 text-ios-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRoutes.length}</p>
                <p className="text-sm text-ios-text-secondary">Active Routes</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="stat-active-trips">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ios-green bg-opacity-20 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-ios-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTrips.length}</p>
                <p className="text-sm text-ios-text-secondary">Live Trips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Route Management */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-route-management">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Route Management</h3>
            <Button
              size="sm"
              className="bg-ios-blue hover:bg-ios-blue/90 text-white"
              data-testid="button-add-route"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Route
            </Button>
          </div>
          
          {routes.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <RouteIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No routes configured</p>
              <p className="text-sm mt-1">Create your first route to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.slice(0, 3).map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" data-testid={`route-${route.id}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-ios-blue rounded-xl flex items-center justify-center">
                      <RouteIcon className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-medium">{route.name}</span>
                      <p className="text-sm text-ios-text-secondary">
                        Bus #{route.busNumber} • {route.stops?.length || 0} stops
                      </p>
                    </div>
                  </div>
                  <Badge className={route.isActive ? 'bg-ios-green text-white' : 'bg-gray-200 text-ios-text'}>
                    {route.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-3 text-ios-blue font-medium"
            data-testid="button-manage-routes"
          >
            Manage All Routes
          </Button>
        </div>

        {/* Driver Management */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-driver-management">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Driver Management</h3>
            <Button
              size="sm"
              className="bg-ios-blue hover:bg-ios-blue/90 text-white"
              data-testid="button-add-driver"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Driver
            </Button>
          </div>
          
          <div className="text-center py-8 text-ios-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No drivers assigned</p>
            <p className="text-sm mt-1">Add drivers to manage your fleet</p>
          </div>
        </div>

        {/* Communication */}
        <div className="bg-white rounded-2xl p-4 shadow-ios" data-testid="card-communication">
          <h3 className="font-semibold mb-3">Communication</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-ios-blue text-ios-blue hover:bg-ios-blue/10"
              data-testid="button-send-announcement"
            >
              Send Announcement to Parents
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-ios-blue text-ios-blue hover:bg-ios-blue/10"
              data-testid="button-emergency-alert"
            >
              Send Emergency Alert
            </Button>
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
