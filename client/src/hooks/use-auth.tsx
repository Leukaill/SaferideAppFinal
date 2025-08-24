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
    // Set up Firebase auth state listener
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await getUserDocument(firebaseUser.uid);
        if (userData) {
          const userWithId = { id: firebaseUser.uid, ...userData } as User;
          setUser(userWithId);
          setToken(await firebaseUser.getIdToken());
          localStorage.setItem('saferide-user', JSON.stringify(userWithId));
        }
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        localStorage.removeItem('saferide-user');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('saferide-token', authToken);
    localStorage.setItem('saferide-user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await logOut();
      // Firebase auth state listener will handle the cleanup
    } catch (error) {
      console.error('Logout error:', error);
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
