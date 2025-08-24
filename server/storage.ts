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
    // Demo admin will be initialized separately
  }

  private initializeDemoData() {
    this.initializeUsers();
    this.initializeRoutes();
    this.initializeTrips();
    this.initializeStudents();
    this.initializeAttendance();
    this.initializeAlertsAndMessages();
  }

  private initializeUsers() {
    // Demo drivers
    const drivers = [
      { id: 'driver-demo-1', email: 'mike.driver@saferide.school', name: 'Mike Thompson', phone: '+1-555-0201' },
      { id: 'driver-demo-2', email: 'sarah.drive@saferide.school', name: 'Sarah Martinez', phone: '+1-555-0202' },
      { id: 'driver-demo-3', email: 'john.bus@saferide.school', name: 'John Williams', phone: '+1-555-0203' }
    ];

    // Demo managers
    const managers = [
      { id: 'manager-demo-1', email: 'lisa.manager@saferide.school', name: 'Lisa Chen', phone: '+1-555-0301' },
      { id: 'manager-demo-2', email: 'david.ops@saferide.school', name: 'David Rodriguez', phone: '+1-555-0302' }
    ];

    // Demo parents
    const parents = [
      { id: 'parent-demo-1', email: 'jennifer.smith@email.com', name: 'Jennifer Smith', phone: '+1-555-0401' },
      { id: 'parent-demo-2', email: 'michael.jones@email.com', name: 'Michael Jones', phone: '+1-555-0402' },
      { id: 'parent-demo-3', email: 'maria.garcia@email.com', name: 'Maria Garcia', phone: '+1-555-0403' },
      { id: 'parent-demo-4', email: 'robert.brown@email.com', name: 'Robert Brown', phone: '+1-555-0404' }
    ];

    // Add all users with hashed passwords
    [...drivers.map(d => ({...d, role: 'driver' as const})), 
     ...managers.map(m => ({...m, role: 'manager' as const})), 
     ...parents.map(p => ({...p, role: 'parent' as const}))].forEach(userData => {
      const user: User = {
        ...userData,
        password: '$2b$10$hash.demo.password.123', // demo hash
        createdAt: new Date()
      };
      this.users.set(user.id, user);
    });
  }

  private initializeRoutes() {
    const routes: Route[] = [
      {
        id: 'route-demo-1',
        name: 'Central School Route A',
        description: 'Main route covering downtown area',
        driverId: 'driver-demo-1',
        busNumber: 'BUS-001',
        stops: [
          { id: 'stop-1', name: 'Main Street', location: 'Main St & 1st Ave', time: '7:30 AM', order: 1 },
          { id: 'stop-2', name: 'Park Avenue', location: 'Park Ave & Oak St', time: '7:45 AM', order: 2 },
          { id: 'stop-3', name: 'Elm Street', location: 'Elm St & 3rd Ave', time: '7:50 AM', order: 3 },
          { id: 'stop-4', name: 'School Entrance', location: 'Central School Main Gate', time: '8:00 AM', order: 4 }
        ],
        isActive: true
      },
      {
        id: 'route-demo-2',
        name: 'Westside Express',
        description: 'Route serving west side neighborhoods',
        driverId: 'driver-demo-2',
        busNumber: 'BUS-002',
        stops: [
          { id: 'stop-w1', name: 'West Plaza', location: 'West Plaza Shopping Center', time: '7:25 AM', order: 1 },
          { id: 'stop-w2', name: 'Maple Grove', location: 'Maple St & Grove Ave', time: '7:35 AM', order: 2 },
          { id: 'stop-w3', name: 'Cedar Heights', location: 'Cedar Ave & Heights Blvd', time: '7:45 AM', order: 3 },
          { id: 'stop-w4', name: 'School West Gate', location: 'Central School West Entrance', time: '7:55 AM', order: 4 }
        ],
        isActive: true
      },
      {
        id: 'route-demo-3',
        name: 'North Valley Route',
        description: 'Covering northern suburbs',
        driverId: 'driver-demo-3',
        busNumber: 'BUS-003',
        stops: [
          { id: 'stop-n1', name: 'Valley View', location: 'Valley View Dr & North St', time: '7:20 AM', order: 1 },
          { id: 'stop-n2', name: 'Hillcrest', location: 'Hillcrest Ave & Pine St', time: '7:30 AM', order: 2 },
          { id: 'stop-n3', name: 'Mountain View', location: 'Mountain View Rd & Oak Dr', time: '7:40 AM', order: 3 },
          { id: 'stop-n4', name: 'School North Gate', location: 'Central School North Entrance', time: '7:50 AM', order: 4 }
        ],
        isActive: true
      }
    ];

    routes.forEach(route => {
      this.routes.set(route.id, route);
    });
  }

  private initializeTrips() {
    const now = new Date();
    const trips: Trip[] = [
      {
        id: 'trip-demo-1',
        routeId: 'route-demo-1',
        driverId: 'driver-demo-1',
        status: 'active',
        startTime: new Date(now.getTime() - 25 * 60 * 1000), // Started 25 minutes ago
        endTime: null,
        currentLocation: 'Park Ave & Oak St - Loading passengers',
        estimatedArrival: new Date(now.getTime() + 10 * 60 * 1000), // ETA in 10 minutes
        notes: 'Running on schedule',
        createdAt: new Date()
      },
      {
        id: 'trip-demo-2',
        routeId: 'route-demo-2',
        driverId: 'driver-demo-2',
        status: 'delayed',
        startTime: new Date(now.getTime() - 20 * 60 * 1000),
        endTime: null,
        currentLocation: 'Maple St & Grove Ave - Traffic delay',
        estimatedArrival: new Date(now.getTime() + 20 * 60 * 1000), // Delayed ETA
        notes: 'Heavy traffic on Maple Street',
        createdAt: new Date()
      },
      {
        id: 'trip-demo-3',
        routeId: 'route-demo-3',
        driverId: 'driver-demo-3',
        status: 'scheduled',
        startTime: new Date(now.getTime() + 5 * 60 * 1000), // Starting in 5 minutes
        endTime: null,
        currentLocation: null,
        estimatedArrival: new Date(now.getTime() + 35 * 60 * 1000),
        notes: null,
        createdAt: new Date()
      },
      {
        id: 'trip-completed-1',
        routeId: 'route-demo-1',
        driverId: 'driver-demo-1',
        status: 'completed',
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(now.getTime() - 23.5 * 60 * 60 * 1000),
        currentLocation: 'Central School Main Gate',
        estimatedArrival: null,
        notes: 'Completed successfully',
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }
    ];

    trips.forEach(trip => this.trips.set(trip.id, trip));
  }

  private initializeStudents() {
    const students: Student[] = [
      // Jennifer Smith's children
      { id: 'student-1', name: 'Emma Smith', grade: '5th Grade', parentId: 'parent-demo-1', routeId: 'route-demo-1', pickupLocation: 'Main Street', dropoffLocation: 'Central School', isActive: true },
      { id: 'student-2', name: 'Liam Smith', grade: '3rd Grade', parentId: 'parent-demo-1', routeId: 'route-demo-1', pickupLocation: 'Main Street', dropoffLocation: 'Central School', isActive: true },
      
      // Michael Jones' children
      { id: 'student-3', name: 'Olivia Jones', grade: '4th Grade', parentId: 'parent-demo-2', routeId: 'route-demo-2', pickupLocation: 'West Plaza', dropoffLocation: 'Central School', isActive: true },
      { id: 'student-4', name: 'Noah Jones', grade: '1st Grade', parentId: 'parent-demo-2', routeId: 'route-demo-2', pickupLocation: 'West Plaza', dropoffLocation: 'Central School', isActive: true },
      
      // Maria Garcia's children
      { id: 'student-5', name: 'Sofia Garcia', grade: '6th Grade', parentId: 'parent-demo-3', routeId: 'route-demo-3', pickupLocation: 'Valley View', dropoffLocation: 'Central School', isActive: true },
      
      // Robert Brown's children
      { id: 'student-6', name: 'Ethan Brown', grade: '2nd Grade', parentId: 'parent-demo-4', routeId: 'route-demo-1', pickupLocation: 'Elm Street', dropoffLocation: 'Central School', isActive: true },
      { id: 'student-7', name: 'Ava Brown', grade: '4th Grade', parentId: 'parent-demo-4', routeId: 'route-demo-1', pickupLocation: 'Elm Street', dropoffLocation: 'Central School', isActive: true }
    ];

    students.forEach(student => this.students.set(student.id, student));
  }

  private initializeAttendance() {
    const now = new Date();
    const attendanceRecords: Attendance[] = [
      // Active trip attendance
      { id: randomUUID(), tripId: 'trip-demo-1', studentId: 'student-1', status: 'boarding', timestamp: new Date(now.getTime() - 20 * 60 * 1000), location: 'Main Street' },
      { id: randomUUID(), tripId: 'trip-demo-1', studentId: 'student-2', status: 'boarding', timestamp: new Date(now.getTime() - 20 * 60 * 1000), location: 'Main Street' },
      { id: randomUUID(), tripId: 'trip-demo-1', studentId: 'student-6', status: 'present', timestamp: new Date(now.getTime() - 15 * 60 * 1000), location: 'Elm Street' },
      { id: randomUUID(), tripId: 'trip-demo-1', studentId: 'student-7', status: 'present', timestamp: new Date(now.getTime() - 15 * 60 * 1000), location: 'Elm Street' },
      
      // Delayed trip attendance
      { id: randomUUID(), tripId: 'trip-demo-2', studentId: 'student-3', status: 'boarding', timestamp: new Date(now.getTime() - 15 * 60 * 1000), location: 'West Plaza' },
      { id: randomUUID(), tripId: 'trip-demo-2', studentId: 'student-4', status: 'boarding', timestamp: new Date(now.getTime() - 15 * 60 * 1000), location: 'West Plaza' },
      
      // Yesterday's completed trip
      { id: randomUUID(), tripId: 'trip-completed-1', studentId: 'student-1', status: 'dropped', timestamp: new Date(now.getTime() - 23.5 * 60 * 60 * 1000), location: 'Central School' },
      { id: randomUUID(), tripId: 'trip-completed-1', studentId: 'student-2', status: 'dropped', timestamp: new Date(now.getTime() - 23.5 * 60 * 60 * 1000), location: 'Central School' }
    ];

    attendanceRecords.forEach(record => this.attendance.set(record.id, record));
  }

  private initializeAlertsAndMessages() {
    const now = new Date();
    
    // Create realistic alerts for all parents
    const alerts: Alert[] = [
      // Recent alerts for active trips
      { id: randomUUID(), type: 'pickup', message: 'Emma and Liam have boarded the bus at Main Street', isRead: false, recipientId: 'parent-demo-1', tripId: 'trip-demo-1', createdAt: new Date(now.getTime() - 20 * 60 * 1000) },
      { id: randomUUID(), type: 'general', message: 'Bus is approaching Park Avenue stop', isRead: false, recipientId: 'parent-demo-1', tripId: 'trip-demo-1', createdAt: new Date(now.getTime() - 5 * 60 * 1000) },
      
      { id: randomUUID(), type: 'delay', message: 'Bus Route 2 is running 15 minutes late due to traffic', isRead: false, recipientId: 'parent-demo-2', tripId: 'trip-demo-2', createdAt: new Date(now.getTime() - 10 * 60 * 1000) },
      { id: randomUUID(), type: 'pickup', message: 'Olivia and Noah have been picked up', isRead: true, recipientId: 'parent-demo-2', tripId: 'trip-demo-2', createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
      
      { id: randomUUID(), type: 'general', message: 'Route 3 will begin boarding in 5 minutes', isRead: false, recipientId: 'parent-demo-3', tripId: 'trip-demo-3', createdAt: new Date(now.getTime() - 2 * 60 * 1000) },
      
      { id: randomUUID(), type: 'pickup', message: 'Ethan and Ava are on board', isRead: true, recipientId: 'parent-demo-4', tripId: 'trip-demo-1', createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
      
      // System alerts
      { id: randomUUID(), type: 'general', message: 'Weather Alert: Light rain expected. All buses equipped with safety equipment.', isRead: false, recipientId: 'parent-demo-1', tripId: null, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
      { id: randomUUID(), type: 'general', message: 'School Closure: Early dismissal tomorrow due to parent-teacher conferences', isRead: false, recipientId: 'parent-demo-2', tripId: null, createdAt: new Date(now.getTime() - 120 * 60 * 1000) }
    ];

    alerts.forEach(alert => this.alerts.set(alert.id, alert));

    // Create sample messages between parents and admin
    const messages: Message[] = [
      { 
        id: randomUUID(), 
        senderId: 'parent-demo-1', 
        recipientId: 'admin-demo-1', 
        subject: 'Bus Stop Change Request', 
        content: 'Hi, I would like to request a bus stop change for my children Emma and Liam. We are moving to a new address next week.', 
        isRead: false, 
        parentMessageId: null, 
        createdAt: new Date(now.getTime() - 180 * 60 * 1000) 
      },
      { 
        id: randomUUID(), 
        senderId: 'admin-demo-1', 
        recipientId: 'parent-demo-1', 
        subject: 'Re: Bus Stop Change Request', 
        content: 'Hello Jennifer, I received your request. Please fill out the address change form and submit it to the main office. The new stop will be effective next Monday.', 
        isRead: true, 
        parentMessageId: null, 
        createdAt: new Date(now.getTime() - 120 * 60 * 1000) 
      },
      { 
        id: randomUUID(), 
        senderId: 'parent-demo-2', 
        recipientId: 'admin-demo-1', 
        subject: 'Late Bus Feedback', 
        content: 'The bus has been consistently 10-15 minutes late this week. Is there anything we can do to improve the timing?', 
        isRead: true, 
        parentMessageId: null, 
        createdAt: new Date(now.getTime() - 240 * 60 * 1000) 
      },
      { 
        id: randomUUID(), 
        senderId: 'manager-demo-1', 
        recipientId: 'driver-demo-2', 
        subject: 'Route Optimization', 
        content: 'Please review the new route optimization suggestions for the Westside Express. The changes should reduce travel time by 5 minutes.', 
        isRead: false, 
        parentMessageId: null, 
        createdAt: new Date(now.getTime() - 60 * 60 * 1000) 
      }
    ];

    messages.forEach(message => this.messages.set(message.id, message));
  }

  async initializeDemoAdmin() {
    const bcrypt = await import('bcrypt');
    // Create a demo admin for messaging with properly hashed password
    const demoAdmin: User = {
      id: 'admin-demo-1',
      email: 'admin@saferide.school',
      password: await bcrypt.hash('admin123', 10), // Password: admin123
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
    return user;
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
