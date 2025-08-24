import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Initialize demo admin with proper password
storage.initializeDemoAdmin().catch(console.error);
import { insertUserSchema, insertStudentSchema, insertRouteSchema, insertTripSchema, insertAttendanceSchema, insertAlertSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "saferide-secret-key";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        }, 
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Student routes
  app.get("/api/students", authenticateToken, async (req: any, res) => {
    try {
      const students = await storage.getStudentsByParent(req.user.userId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/students", authenticateToken, async (req: any, res) => {
    try {
      const studentData = insertStudentSchema.parse({
        ...req.body,
        parentId: req.user.userId,
      });
      
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  // Route routes
  app.get("/api/routes", authenticateToken, async (req: any, res) => {
    try {
      let routes;
      if (req.user.role === 'driver') {
        routes = await storage.getRoutesByDriver(req.user.userId);
      } else {
        routes = await storage.getAllRoutes();
      }
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/routes", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const routeData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(routeData);
      res.json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data" });
    }
  });

  // Trip routes
  app.get("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      let trips;
      if (req.user.role === 'driver') {
        trips = await storage.getActiveTripsByDriver(req.user.userId);
      } else if (req.user.role === 'parent') {
        trips = await storage.getActiveTripsByParent(req.user.userId);
      } else {
        // Admin or manager - get all trips
        const allRoutes = await storage.getAllRoutes();
        trips = [];
        for (const route of allRoutes) {
          const routeTrips = await storage.getTripsByRoute(route.id);
          trips.push(...routeTrips);
        }
      }
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/trips", authenticateToken, async (req: any, res) => {
    try {
      const tripData = insertTripSchema.parse({
        ...req.body,
        driverId: req.user.userId,
      });
      
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      res.status(400).json({ message: "Invalid trip data" });
    }
  });

  app.put("/api/trips/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const trip = await storage.updateTrip(id, updates);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/:tripId", authenticateToken, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const attendance = await storage.getAttendanceByTrip(tripId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/attendance", authenticateToken, async (req: any, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(attendanceData);
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Alert routes
  app.get("/api/alerts", authenticateToken, async (req: any, res) => {
    try {
      const alerts = await storage.getAlertsByUser(req.user.userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/alerts", authenticateToken, async (req: any, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.put("/api/alerts/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.markAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message routes
  app.get("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.user.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/conversation/:userId", authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const conversation = await storage.getConversationBetweenUsers(req.user.userId, userId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.put("/api/messages/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const message = await storage.markMessageAsRead(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admins", authenticateToken, async (req: any, res) => {
    try {
      const admins = await storage.getAllAdmins();
      res.json(admins.map(admin => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      })));
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
