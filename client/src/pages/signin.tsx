import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Shield, Users, Bus, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { signIn, getUserDocument } from "@/lib/firebase";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      const userCredential = await signIn(data.email, data.password);
      const userData = await getUserDocument(userCredential.user.uid);
      return { user: { id: userCredential.user.uid, ...userData } as any, firebaseUser: userCredential.user };
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      });
      
      // Redirect based on role - Firebase auth listener will handle the login state
      const userRole = data.user?.role;
      switch (userRole) {
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
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.code === 'auth/invalid-credential' ? "Invalid email or password" : error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignInFormData) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-blue/10" data-testid="signin-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="text-ios-blue text-lg p-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold">Sign In</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative">
            <Logo size="lg" showText={true} />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3 mt-6 bg-gradient-to-r from-ios-blue to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-ios-text-secondary text-lg leading-relaxed">
            Sign in to continue keeping students safe on their journey
          </p>
        </div>

        {/* Demo Accounts Card */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="font-semibold text-ios-blue mb-2 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Demo Accounts
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-600">Parent:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">jennifer.smith@email.com</code>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-600">Driver:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">mike.driver@saferide.school</code>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-gray-600">Admin:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">admin@saferide.school</code>
              </div>
              <p className="text-xs text-gray-500 mt-2">All demo passwords: <code className="bg-white px-1 rounded">demo123</code></p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-ios-blue transition-colors bg-white/50"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-ios-blue transition-colors bg-white/50"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-2">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-remember"
                          className="border-2"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-600 font-medium">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-ios-blue font-medium hover:text-blue-700 transition-colors" data-testid="link-forgot-password">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={signInMutation.isPending}
                className="w-full bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
                data-testid="button-sign-in"
              >
                {signInMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sign In Securely
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mt-8 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm">
            <Bus className="w-6 h-6 text-ios-blue mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Real-time Tracking</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Safety Alerts</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Family Connect</p>
          </div>
        </div>

        <div className="text-center">
          <span className="text-ios-text-secondary">Don't have an account? </span>
          <Button
            variant="ghost"
            onClick={() => setLocation('/signup')}
            className="text-ios-blue font-semibold p-0 h-auto hover:text-blue-700"
            data-testid="button-sign-up"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
