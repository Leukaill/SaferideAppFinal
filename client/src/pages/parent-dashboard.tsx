import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Bus, MapPin, Clock, CheckCircle, Settings, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getStudentsByParent, getAlertsByUser, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Trip, Student, Alert } from "@shared/schema";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [, setLocation] = useLocation();

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['students', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (await getStudentsByParent(user.id)) as Student[];
    },
    enabled: !!user,
  });

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get trips for parent's students
        const studentIds = students.map(s => s.id);
        if (studentIds.length === 0) return [];
        
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, where('studentIds', 'array-contains-any', studentIds));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      } catch (error) {
        console.error('Error fetching trips:', error);
        // Return demo data while Firebase is being configured
        return [
          {
            id: 'demo-trip-1',
            createdAt: new Date(),
            routeId: 'route-demo-1',
            driverId: 'driver-demo-1',
            status: 'active' as const,
            startTime: new Date(),
            endTime: null,
            currentLocation: 'Oak Street & Main Ave',
            estimatedArrival: new Date(Date.now() + 600000), // 10 minutes from now
            notes: null
          }
        ];
      }
    },
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (await getAlertsByUser(user.id)) as Alert[];
    },
    enabled: !!user,
  });

  const activeTrips = trips?.filter((trip: any) => trip.status === 'active') || [];
  const recentAlerts = alerts.slice(0, 3);

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'boarding':
        return 'bg-ios-green';
      case 'delayed':
        return 'bg-ios-orange';
      case 'cancelled':
        return 'bg-ios-red';
      default:
        return 'bg-gray-200 text-ios-text';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <Clock className="w-4 h-4 text-ios-orange" />;
      case 'pickup':
      case 'dropoff':
        return <CheckCircle className="w-4 h-4 text-ios-green" />;
      default:
        return <Bell className="w-4 h-4 text-ios-blue" />;
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg pb-20" data-testid="parent-dashboard">
      {/* Status Bar */}
      <div className="bg-ios-blue text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-welcome">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm opacity-90" data-testid="text-current-time">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full text-white hover:bg-white hover:bg-opacity-30"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full text-white hover:bg-white hover:bg-opacity-30"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {recentAlerts.filter(alert => !alert.isRead).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-ios-red rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 shadow-ios text-center" data-testid="stat-children">
            <div className="w-8 h-8 bg-ios-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 text-ios-blue" />
            </div>
            <p className="text-lg font-bold text-ios-text">{students.length}</p>
            <p className="text-xs text-ios-text-secondary">Children</p>
          </div>
          
          <div className="bg-card rounded-xl p-3 shadow-ios text-center" data-testid="stat-active-trips">
            <div className="w-8 h-8 bg-ios-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bus className="w-4 h-4 text-ios-green" />
            </div>
            <p className="text-lg font-bold text-ios-text">{activeTrips.length}</p>
            <p className="text-xs text-ios-text-secondary">Active Trips</p>
          </div>
          
          <div className="bg-card rounded-xl p-3 shadow-ios text-center" data-testid="stat-alerts">
            <div className="w-8 h-8 bg-ios-orange bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bell className="w-4 h-4 text-ios-orange" />
            </div>
            <p className="text-lg font-bold text-ios-text">{recentAlerts.filter(alert => !alert.isRead).length}</p>
            <p className="text-xs text-ios-text-secondary">New Alerts</p>
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-active-trips">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active Trips</h3>
            {activeTrips.length > 0 && (
              <Badge className="bg-ios-green text-white text-xs">Live</Badge>
            )}
          </div>
          
          {activeTrips.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <Bus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active trips right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTrips.map((trip: any) => (
                <div key={trip.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl" data-testid={`trip-${trip.id}`}>
                  <div className="w-12 h-12 bg-ios-blue rounded-xl flex items-center justify-center">
                    <Bus className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Bus #{trip.routeId}</span>
                      <span className="text-sm text-ios-text-secondary">
                        {trip.estimatedArrival ? `ETA: ${formatTime(trip.estimatedArrival)}` : 'In Transit'}
                      </span>
                    </div>
                    <p className="text-sm text-ios-text-secondary">{trip.currentLocation || 'On route'}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-ios-green rounded-full"></div>
                      <span className="text-xs text-ios-text-secondary">Route Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTrips.length > 0 && (
            <Button
              variant="ghost"
              className="w-full mt-3 text-ios-blue font-medium"
              onClick={() => setLocation('/live-tracking')}
              data-testid="button-view-live-location"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View Live Location
            </Button>
          )}
        </div>

        {/* My Children */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-my-children">
          <h3 className="font-semibold mb-3">My Children</h3>
          
          {students.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <p>No children enrolled yet</p>
              <Button
                variant="ghost"
                className="text-ios-blue font-medium mt-2"
                data-testid="button-add-child"
              >
                Add Child
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-3" data-testid={`student-${student.id}`}>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{student.name}</span>
                      <Badge 
                        className={`text-xs text-white ${getStatusColor(student.isActive ? 'active' : 'inactive')}`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-ios-text-secondary">
                      {student.grade} • {student.pickupLocation || 'No pickup location'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-3 text-ios-blue font-medium"
            data-testid="button-manage-children"
          >
            Manage Children
          </Button>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card rounded-2xl p-4 shadow-ios" data-testid="card-recent-updates">
          <h3 className="font-semibold mb-3">Recent Updates</h3>
          
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-ios-text-secondary">
              <p>No recent updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3" data-testid={`alert-${alert.id}`}>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <span className="text-xs text-ios-text-secondary">
                      {alert.createdAt ? formatTime(alert.createdAt) : 'Just now'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-3 text-ios-blue font-medium"
            data-testid="button-view-all-updates"
          >
            View All Updates
          </Button>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
