import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentsByParent,
  getRoutesByDriver,
  getAlertsByUser,
  createAlert,
  createTrip,
  sendMessage,
  getConversation,
  db,
  auth
} from './firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Student, Trip, Alert, Route, Message } from '@shared/schema';

// Students
export const useStudents = () => {
  const { user } = useAuth();
  
  return useQuery<Student[]>({
    queryKey: ['students', user?.id],
    queryFn: async (): Promise<Student[]> => {
      if (!user) return [];
      
      if (user.role === 'parent') {
        return (await getStudentsByParent(user.id)) as Student[];
      } else {
        // For admin/manager - get all students
        const studentsRef = collection(db, 'students');
        const querySnapshot = await getDocs(studentsRef);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      }
    },
    enabled: !!user,
  });
};

// Trips
export const useTrips = () => {
  const { user } = useAuth();
  
  return useQuery<Trip[]>({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let tripsQuery;
      const tripsRef = collection(db, 'trips');
      
      if (user.role === 'driver') {
        tripsQuery = query(tripsRef, where('driverId', '==', user.id));
      } else if (user.role === 'parent') {
        // Get trips for parent's students
        const students = await getStudentsByParent(user.id);
        const studentIds = students.map(s => s.id);
        if (studentIds.length === 0) return [];
        tripsQuery = query(tripsRef, where('studentIds', 'array-contains-any', studentIds));
      } else {
        // Admin/Manager - get all trips
        tripsQuery = tripsRef;
      }
      
      const querySnapshot = await getDocs(tripsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
    },
    enabled: !!user,
  });
};

// Routes
export const useRoutes = () => {
  const { user } = useAuth();
  
  return useQuery<Route[]>({
    queryKey: ['routes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let routesQuery;
      const routesRef = collection(db, 'routes');
      
      if (user.role === 'driver') {
        return await getRoutesByDriver(user.id);
      } else {
        // Admin/Manager - get all routes
        const querySnapshot = await getDocs(routesRef);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Route[];
      }
    },
    enabled: !!user,
  });
};

// Alerts
export const useAlerts = () => {
  const { user } = useAuth();
  
  return useQuery<Alert[]>({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      return await getAlertsByUser(user.id);
    },
    enabled: !!user,
  });
};

// Messages
export const useMessages = () => {
  const { user } = useAuth();
  
  return useQuery<Message[]>({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.id),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
    },
    enabled: !!user,
  });
};

// Get conversation between two users
export const useConversation = (otherUserId: string) => {
  const { user } = useAuth();
  
  return useQuery<Message[]>({
    queryKey: ['conversation', user?.id, otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return [];
      
      return await getConversation(user.id, otherUserId);
    },
    enabled: !!user && !!otherUserId,
  });
};

// Get admins (for messaging)
export const useAdmins = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      if (!user) return [];
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['admin', 'manager']));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!user,
  });
};

// Mutations
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const tripWithDefaults = {
        ...tripData,
        driverId: user.id,
        status: 'active',
        startTime: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'trips'), tripWithDefaults);
      return { id: docRef.id, ...tripWithDefaults };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tripId, updates }: { tripId: string; updates: Partial<Trip> }) => {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, { ...updates, updatedAt: new Date() });
      return { id: tripId, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (alertData: Omit<Alert, 'id' | 'createdAt' | 'userId'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const alertWithDefaults = {
        ...alertData,
        userId: user.id,
      };
      
      const docRef = await addDoc(collection(db, 'alerts'), alertWithDefaults);
      return { id: docRef.id, ...alertWithDefaults };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ to, message }: { to: string; message: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const messageData = {
        from: user.id,
        to,
        message,
        participants: [user.id, to],
        timestamp: new Date(),
        isRead: false,
      };
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      return { id: docRef.id, ...messageData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
};