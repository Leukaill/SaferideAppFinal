import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

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
      const response = await apiRequest('POST', '/api/auth/signin', {
        email: data.email,
        password: data.password
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Login with backend token
      login(data.user, data.token);
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      });
      
      // Redirect based on role
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
    <div className="min-h-screen bg-background" data-testid="signin-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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

      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <Logo size="md" showText={false} />
          <h2 className="text-2xl font-bold mb-2 mt-4">Welcome Back</h2>
          <p className="text-ios-text-secondary">Sign in to continue keeping students safe</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
                      data-testid="input-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
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
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-ios-text-secondary">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              <a href="#" className="text-sm text-ios-blue" data-testid="link-forgot-password">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={signInMutation.isPending}
              className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-xl text-lg font-semibold shadow-ios card-hover"
              data-testid="button-sign-in"
            >
              {signInMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <span className="text-ios-text-secondary">Don't have an account? </span>
          <Button
            variant="ghost"
            onClick={() => setLocation('/signup')}
            className="text-ios-blue font-medium p-0 h-auto"
            data-testid="button-sign-up"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
