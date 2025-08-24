import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { getDatabase, ref, set, onValue, push, serverTimestamp } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCic2FiNwDuSdnYgEpV32YQ3iM52bZd9-U",
  authDomain: "memechat2-52017.firebaseapp.com",
  databaseURL: "https://memechat2-52017-default-rtdb.firebaseio.com",
  projectId: "memechat2-52017",
  storageBucket: "memechat2-52017.firebasestorage.app",
  messagingSenderId: "808297715882",
  appId: "1:808297715882:web:b2436bedb05601909f98d3"
};

// Initialize Firebase app only if it doesn't already exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

// Auth functions
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const createUserDocument = async (uid: string, userData: any) => {
  const userRef = doc(db, 'users', uid);
  return await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const getUserDocument = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Realtime Database functions for live tracking
export const updateDriverLocation = async (driverId: string, location: { lat: number, lng: number }) => {
  const locationRef = ref(realtimeDb, `locations/${driverId}`);
  return await set(locationRef, {
    ...location,
    timestamp: serverTimestamp()
  });
};

export const subscribeToDriverLocation = (driverId: string, callback: (location: any) => void) => {
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
  const routesRef = collection(db, 'routes');
  const q = query(routesRef, where('driverId', '==', driverId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Trips and Alerts
export const createTrip = async (tripData: any) => {
  const tripsRef = collection(db, 'trips');
  return await addDoc(tripsRef, {
    ...tripData,
    createdAt: new Date()
  });
};

export const createAlert = async (alertData: any) => {
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