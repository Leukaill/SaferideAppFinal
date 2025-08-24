import { Home, MapPin, MessageSquare, User } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'track', icon: MapPin, label: 'Track' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (tabId === 'track') {
      setLocation('/live-tracking');
    } else if (tabId === 'messages') {
      setLocation('/messages');
    } else if (tabId === 'profile') {
      setLocation('/settings');
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border" data-testid="bottom-nav">
      <div className="flex justify-around py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center space-y-1 ${
                isActive ? 'text-ios-blue' : 'text-ios-text-secondary'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
