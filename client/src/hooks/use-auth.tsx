import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { onAuthChange, logOut, getUserDocument } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Check for stored JWT token and user data from backend authentication
    const storedToken = localStorage.getItem('saferide-token');
    const storedUser = localStorage.getItem('saferide-user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('saferide-token');
        localStorage.removeItem('saferide-user');
      }
    }
    
    // Try to set up Firebase auth state listener if available
    try {
      const unsubscribe = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          // Get user data from Firestore
          const userData = await getUserDocument(firebaseUser.uid);
          if (userData) {
            const userWithId = { id: firebaseUser.uid, ...userData } as User;
            setUser(userWithId);
            setToken(await firebaseUser.getIdToken());
            localStorage.setItem('saferide-user', JSON.stringify(userWithId));
          }
        } else if (!storedToken) {
          // Only clear if we don't have backend auth
          setUser(null);
          setToken(null);
          localStorage.removeItem('saferide-user');
        }
      });
      
      setIsLoading(false);
      return () => unsubscribe();
    } catch (error) {
      // Firebase not available, rely on backend authentication
      console.warn('Firebase auth not available, using backend authentication');
      setIsLoading(false);
      return () => {};
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('saferide-token', authToken);
    localStorage.setItem('saferide-user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Try Firebase logout if available
      await logOut();
      // Firebase auth state listener will handle the cleanup
    } catch (error) {
      // Firebase not available, handle logout manually
      console.warn('Firebase logout not available, using manual logout');
      setUser(null);
      setToken(null);
      localStorage.removeItem('saferide-token');
      localStorage.removeItem('saferide-user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
