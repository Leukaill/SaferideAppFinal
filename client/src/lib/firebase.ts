import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { getDatabase, ref, set, onValue, push, serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;
let db: any = null;
let realtimeDb: any = null;

try {
  // Only initialize if we have a valid API key
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    realtimeDb = getDatabase(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // App will continue to work with backend authentication
}

export { auth, db, realtimeDb };

// Auth functions
export const signIn = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase authentication not available');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase authentication not available');
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  if (!auth) throw new Error('Firebase authentication not available');
  return await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {}; // Return empty cleanup function
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const createUserDocument = async (uid: string, userData: any) => {
  if (!db) throw new Error('Firebase database not available');
  const userRef = doc(db, 'users', uid);
  return await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const getUserDocument = async (uid: string) => {
  if (!db) return null;
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Realtime Database functions for live tracking
export const updateDriverLocation = async (driverId: string, location: { lat: number, lng: number }) => {
  if (!realtimeDb) throw new Error('Firebase database not available');
  const locationRef = ref(realtimeDb, `locations/${driverId}`);
  return await set(locationRef, {
    ...location,
    timestamp: serverTimestamp()
  });
};

export const subscribeToDriverLocation = (driverId: string, callback: (location: any) => void) => {
  if (!realtimeDb) return () => {}; // Return empty cleanup function
  const locationRef = ref(realtimeDb, `locations/${driverId}`);
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Students and Routes in Firestore
export const getStudentsByParent = async (parentId: string) => {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('parentId', '==', parentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching students:', error);
    // Return demo data for now while Firebase is being configured
    return [
      {
        id: 'demo-student-1',
        name: 'Emma Johnson',
        grade: '5th Grade',
        parentId: parentId,
        isActive: true,
        routeId: 'route-demo-1',
        pickupLocation: '123 Oak Street',
        dropoffLocation: 'Riverside Elementary School'
      }
    ];
  }
};

export const getRoutesByDriver = async (driverId: string) => {
  if (!db) {
    // Return demo data when Firebase is not available
    return [];
  }
  const routesRef = collection(db, 'routes');
  const q = query(routesRef, where('driverId', '==', driverId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Trips and Alerts
export const createTrip = async (tripData: any) => {
  if (!db) throw new Error('Firebase database not available');
  const tripsRef = collection(db, 'trips');
  return await addDoc(tripsRef, {
    ...tripData,
    createdAt: new Date()
  });
};

export const createAlert = async (alertData: any) => {
  if (!db) throw new Error('Firebase database not available');
  const alertsRef = collection(db, 'alerts');
  return await addDoc(alertsRef, {
    ...alertData,
    createdAt: new Date(),
    isRead: false
  });
};

export const getAlertsByUser = async (userId: string) => {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef, 
      where('recipientId', '==', userId), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    // Return demo data for now
    return [
      {
        id: 'demo-alert-1',
        type: 'pickup',
        message: 'Bus arriving at your stop in 5 minutes',
        createdAt: new Date(),
        isRead: false,
        recipientId: userId
      },
      {
        id: 'demo-alert-2',
        type: 'delay',
        message: 'Bus running 10 minutes late due to traffic',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        isRead: false,
        recipientId: userId
      }
    ];
  }
};

// Messages
export const sendMessage = async (from: string, to: string, message: string) => {
  if (!db) throw new Error('Firebase database not available');
  const messagesRef = collection(db, 'messages');
  return await addDoc(messagesRef, {
    from,
    to,
    message,
    timestamp: new Date(),
    isRead: false
  });
};

export const getConversation = async (userId1: string, userId2: string) => {
  if (!db) return [];
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('participants', 'array-contains-any', [userId1, userId2]),
    orderBy('timestamp', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export default app;