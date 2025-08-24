import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { useMobileOptimized } from "@/hooks/use-mobile";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import SignUp from "@/pages/signup";
import SignIn from "@/pages/signin";
import ParentDashboard from "@/pages/parent-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import LiveTracking from "@/pages/live-tracking";
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route path="/parent-dashboard" component={ParentDashboard} />
      <Route path="/driver-dashboard" component={DriverDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/manager-dashboard" component={ManagerDashboard} />
      <Route path="/live-tracking" component={LiveTracking} />
      <Route path="/settings" component={Settings} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize mobile optimizations
  useMobileOptimized();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Clear any old Firebase tokens to prevent conflicts
    const shouldClearOldAuth = localStorage.getItem('saferide-auth-migrated');
    if (!shouldClearOldAuth) {
      localStorage.removeItem('firebase-user');
      localStorage.removeItem('firebase-token');
      localStorage.setItem('saferide-auth-migrated', 'true');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="max-w-md mx-auto bg-background min-h-screen">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
