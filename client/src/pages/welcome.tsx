import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Shield, MapPin, Users, Clock, Bell, MessageSquare, Bus, Star } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to appropriate dashboard if user is already logged in
    if (user) {
      switch (user.role) {
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
          break;
      }
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-green-50" data-testid="welcome-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto">
            Keeping students safe with real-time tracking, instant alerts, and seamless communication
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <Button 
            onClick={() => setLocation('/signup')}
            className="w-full bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-14 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            data-testid="button-get-started"
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Get Started Free
            </div>
          </Button>
          
          <Button 
            onClick={() => setLocation('/signin')}
            variant="outline"
            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-14 rounded-xl text-lg font-semibold transition-colors"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mb-12 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-ios-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 whitespace-nowrap">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your child's bus in real-time with GPS precision and live updates
              </p>
            </Card>

            <Card className="p-6 text-center border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 whitespace-nowrap">Instant Alerts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get notified about pickups, drop-offs, delays, and any safety concerns
              </p>
            </Card>

            <Card className="p-6 text-center border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 whitespace-nowrap">Direct Communication</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Message directly with drivers and school administrators
              </p>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-2xl mb-12">
          <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-ios-blue/10 to-green-100/50">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-ios-blue mb-1">99.9%</div>
                <div className="text-sm text-gray-600">On-Time Arrival</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Live Monitoring</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">Parent Satisfaction</div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Types */}
        <div className="w-full max-w-4xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Perfect for Everyone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center border-0 bg-white/60 hover:bg-white/80 transition-colors">
              <Users className="w-8 h-8 text-ios-blue mx-auto mb-2" />
              <div className="font-semibold text-sm text-gray-700">Parents</div>
              <div className="text-xs text-gray-500 mt-1">Track & Communicate</div>
            </Card>
            <Card className="p-4 text-center border-0 bg-white/60 hover:bg-white/80 transition-colors">
              <Bus className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-gray-700">Drivers</div>
              <div className="text-xs text-gray-500 mt-1">Manage Routes</div>
            </Card>
            <Card className="p-4 text-center border-0 bg-white/60 hover:bg-white/80 transition-colors">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-gray-700">Admins</div>
              <div className="text-xs text-gray-500 mt-1">System Control</div>
            </Card>
            <Card className="p-4 text-center border-0 bg-white/60 hover:bg-white/80 transition-colors">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-sm text-gray-700">Managers</div>
              <div className="text-xs text-gray-500 mt-1">Analytics & Reports</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
