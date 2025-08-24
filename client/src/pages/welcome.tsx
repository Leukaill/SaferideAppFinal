import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-ios-bg" data-testid="welcome-screen">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      
      <div className="w-full space-y-4">
        <Button 
          onClick={() => setLocation('/signup')}
          className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-xl text-lg font-semibold shadow-ios card-hover"
          data-testid="button-get-started"
        >
          Get Started
        </Button>
        
        <Button 
          onClick={() => setLocation('/signin')}
          variant="outline"
          className="w-full border-2 border-ios-blue text-ios-blue hover:bg-ios-blue/10 py-4 rounded-xl text-lg font-semibold card-hover"
          data-testid="button-sign-in"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
