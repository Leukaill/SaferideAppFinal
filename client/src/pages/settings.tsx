import { useState } from "react";
import { ChevronLeft, User, Bell, Shield, Palette, Trash2, LogOut, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });

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

  const handleThemeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
    toast({
      title: "Theme updated",
      description: `Switched to ${enabled ? 'dark' : 'light'} mode`,
    });
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications', enabled.toString());
    toast({
      title: "Notification settings updated",
      description: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation('/');
  };

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call to delete the account
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted",
      variant: "destructive",
    });
    logout();
    setLocation('/');
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile Information",
          subtitle: "Update your personal details",
          action: () => toast({ title: "Feature coming soon", description: "Profile editing will be available soon" }),
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          subtitle: "Manage your privacy settings",
          action: () => toast({ title: "Feature coming soon", description: "Privacy settings will be available soon" }),
        },
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          subtitle: "Switch between light and dark themes",
          toggle: {
            checked: darkMode,
            onChange: handleThemeToggle,
          },
        },
        {
          icon: Bell,
          label: "Notifications",
          subtitle: "Control app notifications",
          toggle: {
            checked: notifications,
            onChange: handleNotificationToggle,
          },
        },
        {
          icon: Palette,
          label: "Appearance",
          subtitle: "Customize app appearance",
          action: () => toast({ title: "Feature coming soon", description: "Appearance customization will be available soon" }),
        },
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: User,
          label: "Help Center",
          subtitle: "Get help and support",
          action: () => toast({ title: "Feature coming soon", description: "Help center will be available soon" }),
        },
        {
          icon: User,
          label: "Contact Us",
          subtitle: "Reach out to our team",
          action: () => toast({ title: "Feature coming soon", description: "Contact form will be available soon" }),
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-ios-bg dark:bg-gray-900" data-testid="settings-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-ios-blue dark:text-blue-400 text-lg p-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
        <div className="w-6"></div>
      </div>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-ios-blue rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-user-name">
              {user?.name}
            </h2>
            <p className="text-ios-text-secondary dark:text-gray-400" data-testid="text-user-email">
              {user?.email}
            </p>
            <p className="text-sm text-ios-blue dark:text-blue-400 capitalize" data-testid="text-user-role">
              {user?.role} Account
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-gray-800 rounded-2xl shadow-ios">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
            </div>
            <div className="p-4 space-y-4">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                    data-testid={`setting-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-ios-blue bg-opacity-20 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-ios-blue dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                        <p className="text-sm text-ios-text-secondary dark:text-gray-400">{item.subtitle}</p>
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <Switch
                        checked={item.toggle.checked}
                        onCheckedChange={item.toggle.onChange}
                        data-testid={`toggle-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="text-ios-blue dark:text-blue-400"
                        data-testid={`button-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        →
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-ios">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Log Out</span>
                  <p className="text-sm text-ios-text-secondary dark:text-gray-400">Sign out of your account</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Delete Account</span>
                  <p className="text-sm text-ios-text-secondary dark:text-gray-400">Permanently delete your account</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 dark:text-red-400"
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-gray-900 dark:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      data-testid="button-confirm-delete"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}