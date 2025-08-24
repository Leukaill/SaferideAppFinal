import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Users, Bus, Car, ClipboardList } from "lucide-react";
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
import { insertUserSchema } from "@shared/schema";

const signUpSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const roles = [
  { id: 'parent', icon: Users, label: 'Parent' },
  { id: 'admin', icon: Bus, label: 'Admin' },
  { id: 'driver', icon: Car, label: 'Driver' },
  { id: 'manager', icon: ClipboardList, label: 'Manager' },
];

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'parent',
      agreeToTerms: false,
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const { confirmPassword, agreeToTerms, ...userData } = data;
      
      const response = await apiRequest('POST', '/api/auth/signup', {
        ...userData,
        role: selectedRole,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Login with backend token
      login(data.user, data.token);
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to SafeRide",
      });
      
      // Redirect based on role
      switch (data.user.role) {
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
        description: error.code === 'auth/email-already-in-use' ? "Email already registered" : error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    if (!selectedRole) {
      toast({
        title: "Please select your role",
        variant: "destructive",
      });
      return;
    }
    
    signUpMutation.mutate({ ...data, role: selectedRole as any });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="signup-screen">
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
        <h1 className="text-lg font-semibold">Create Account</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-6 space-y-6">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Logo size="md" showText={false} />
          <h2 className="text-2xl font-bold mb-2 mt-4">Join SafeRide</h2>
          <p className="text-ios-text-secondary">Keep your students safe during transport</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
                      data-testid="input-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
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

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
                      data-testid="input-phone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        form.setValue('role', role.id as any);
                      }}
                      className={`border-2 rounded-xl p-4 text-center cursor-pointer card-hover ${
                        isSelected 
                          ? 'border-ios-blue bg-ios-blue bg-opacity-10' 
                          : 'border-gray-200'
                      }`}
                      data-testid={`role-${role.id}`}
                    >
                      <Icon className="text-ios-blue text-xl mb-2 mx-auto" />
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Fields */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
                      data-testid="input-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      className="p-4 border border-gray-200 rounded-xl focus:border-ios-blue"
                      data-testid="input-confirm-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms */}
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-terms"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-ios-text-secondary">
                      I agree to the{" "}
                      <a href="#" className="text-ios-blue">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-ios-blue">Privacy Policy</a>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={signUpMutation.isPending}
              className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white py-4 rounded-xl text-lg font-semibold shadow-ios card-hover"
              data-testid="button-create-account"
            >
              {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
