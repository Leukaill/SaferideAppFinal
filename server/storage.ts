import { 
  User, InsertUser, 
  Student, InsertStudent,
  Route, InsertRoute,
  Trip, InsertTrip,
  Attendance, InsertAttendance,
  Alert, InsertAlert,
  Message, InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined>;

  // Route operations
  getRoute(id: string): Promise<Route | undefined>;
  getAllRoutes(): Promise<Route[]>;
  getRoutesByDriver(driverId: string): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined>;

  // Trip operations
  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByRoute(routeId: string): Promise<Trip[]>;
  getActiveTripsByDriver(driverId: string): Promise<Trip[]>;
  getActiveTripsByParent(parentId: string): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined>;

  // Attendance operations
  getAttendanceByTrip(tripId: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined>;

  // Alert operations
  getAlert(id: string): Promise<Alert | undefined>;
  getAlertsByUser(userId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<Alert | undefined>;

  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  getConversationBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
  getAllAdmins(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private students: Map<string, Student>;
  private routes: Map<string, Route>;
  private trips: Map<string, Trip>;
  private attendance: Map<string, Attendance>;
  private alerts: Map<string, Alert>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.routes = new Map();
    this.trips = new Map();
    this.attendance = new Map();
    this.alerts = new Map();
    this.messages = new Map();
    
    // Initialize with demo data
    this.initializeDemoData();
    this.createDemoAdmin();
  }

  private initializeDemoData() {
    // Create a demo route
    const demoRoute: Route = {
      id: 'route-demo-1',
      name: 'Central School Route A',
      description: 'Main route covering downtown area',
      driverId: null,
      busNumber: 'BUS-001',
      stops: [
        { id: 'stop-1', name: 'Main Street', location: 'Main St & 1st Ave', time: '7:30 AM', order: 1 },
        { id: 'stop-2', name: 'Park Avenue', location: 'Park Ave & Oak St', time: '7:45 AM', order: 2 },
        { id: 'stop-3', name: 'School Entrance', location: 'Central School Main Gate', time: '8:00 AM', order: 3 }
      ],
      isActive: true
    };
    this.routes.set(demoRoute.id, demoRoute);

    // Create demo trip
    const demoTrip: Trip = {
      id: 'trip-demo-1',
      routeId: 'route-demo-1',
      driverId: 'driver-demo-1',
      status: 'active',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
      endTime: null,
      currentLocation: 'Main St & 2nd Ave - Approaching Park Avenue',
      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000), // ETA in 15 minutes
      notes: null,
      createdAt: new Date()
    };
    this.trips.set(demoTrip.id, demoTrip);
  }

  private createDemoAdmin() {
    // Create a demo admin for messaging
    const demoAdmin: User = {
      id: 'admin-demo-1',
      email: 'admin@saferide.school',
      password: 'hashedpassword', // In real app, this would be properly hashed
      name: 'Sarah Johnson',
      phone: '+1-555-0123',
      role: 'admin',
      createdAt: new Date()
    };
    this.users.set(demoAdmin.id, demoAdmin);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    
    // Add demo children if this is a parent
    if (user.role === 'parent') {
      this.addDemoChildrenForParent(user.id);
    }
    
    return user;
  }

  private addDemoChildrenForParent(parentId: string) {
    const demoChildren: Student[] = [
      {
        id: randomUUID(),
        name: 'Emma Johnson',
        grade: '3rd Grade',
        parentId,
        routeId: 'route-demo-1',
        pickupLocation: 'Main Street Stop',
        dropoffLocation: 'Central School',
        isActive: true
      },
      {
        id: randomUUID(),
        name: 'Liam Johnson',
        grade: '1st Grade',
        parentId,
        routeId: 'route-demo-1',
        pickupLocation: 'Main Street Stop',
        dropoffLocation: 'Central School',
        isActive: true
      }
    ];
    
    demoChildren.forEach(child => {
      this.students.set(child.id, child);
      
      // Create demo attendance for active trip
      const demoAttendance: Attendance = {
        id: randomUUID(),
        tripId: 'trip-demo-1',
        studentId: child.id,
        status: 'boarding',
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // Boarded 25 minutes ago
        location: 'Main Street Stop'
      };
      this.attendance.set(demoAttendance.id, demoAttendance);
    });
    
    // Create demo alerts for parent
    const demoAlerts: Alert[] = [
      {
        id: randomUUID(),
        type: 'pickup',
        message: 'Emma and Liam have been picked up at Main Street Stop',
        isRead: false,
        recipientId: parentId,
        tripId: 'trip-demo-1',
        createdAt: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        id: randomUUID(),
        type: 'general',
        message: 'Bus is running on schedule. ETA: 8:00 AM',
        isRead: false,
        recipientId: parentId,
        tripId: 'trip-demo-1',
        createdAt: new Date(Date.now() - 10 * 60 * 1000)
      }
    ];
    
    demoAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(student => student.parentId === parentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      isActive: insertStudent.isActive ?? true,
      routeId: insertStudent.routeId ?? null,
      pickupLocation: insertStudent.pickupLocation ?? null,
      dropoffLocation: insertStudent.dropoffLocation ?? null
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  // Route operations
  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoutesByDriver(driverId: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => route.driverId === driverId);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = { 
      ...insertRoute, 
      id,
      description: insertRoute.description ?? null,
      driverId: insertRoute.driverId ?? null,
      busNumber: insertRoute.busNumber ?? null,
      stops: insertRoute.stops ?? null,
      isActive: insertRoute.isActive ?? true
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    const updatedRoute = { ...route, ...updates };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  // Trip operations
  async getTrip(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByRoute(routeId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.routeId === routeId);
  }

  async getActiveTripsByDriver(driverId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      trip => trip.driverId === driverId && trip.status === 'active'
    );
  }

  async getActiveTripsByParent(parentId: string): Promise<Trip[]> {
    const studentIds = Array.from(this.students.values())
      .filter(student => student.parentId === parentId)
      .map(student => student.id);
    
    return Array.from(this.trips.values()).filter(trip => {
      const tripAttendance = Array.from(this.attendance.values())
        .filter(att => att.tripId === trip.id);
      return tripAttendance.some(att => studentIds.includes(att.studentId)) && trip.status === 'active';
    });
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = { 
      ...insertTrip, 
      id, 
      createdAt: new Date(),
      startTime: insertTrip.startTime ?? null,
      endTime: insertTrip.endTime ?? null,
      currentLocation: insertTrip.currentLocation ?? null,
      estimatedArrival: insertTrip.estimatedArrival ?? null,
      notes: insertTrip.notes ?? null
    };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  // Attendance operations
  async getAttendanceByTrip(tripId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.tripId === tripId);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { 
      ...insertAttendance, 
      id, 
      timestamp: new Date(),
      location: insertAttendance.location ?? null
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    const updatedAttendance = { ...attendance, ...updates };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  // Alert operations
  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByUser(userId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.recipientId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      createdAt: new Date(),
      tripId: insertAlert.tripId ?? null,
      isRead: insertAlert.isRead ?? false,
      recipientId: insertAlert.recipientId ?? null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    const updatedAlert = { ...alert, isRead: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.recipientId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getConversationBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.recipientId === user2Id) ||
        (message.senderId === user2Id && message.recipientId === user1Id)
      )
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      isRead: insertMessage.isRead ?? false,
      parentMessageId: insertMessage.parentMessageId ?? null
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getAllAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === 'admin');
  }
}

export const storage = new MemStorage();
