import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role", { enum: ['parent', 'admin', 'driver', 'manager'] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  routeId: varchar("route_id").references(() => routes.id),
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  isActive: boolean("is_active").default(true),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  driverId: varchar("driver_id").references(() => users.id),
  busNumber: text("bus_number"),
  stops: jsonb("stops").$type<Array<{
    id: string;
    name: string;
    location: string;
    time: string;
    order: number;
  }>>(),
  isActive: boolean("is_active").default(true),
});

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  driverId: varchar("driver_id").references(() => users.id).notNull(),
  status: text("status", { enum: ['scheduled', 'active', 'completed', 'delayed', 'cancelled'] }).notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  currentLocation: text("current_location"),
  estimatedArrival: timestamp("estimated_arrival"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  status: text("status", { enum: ['present', 'absent', 'boarding', 'dropped'] }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  location: text("location"),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id),
  type: text("type", { enum: ['delay', 'emergency', 'pickup', 'dropoff', 'general'] }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  recipientId: varchar("recipient_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages: any = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  parentMessageId: varchar("parent_message_id").references((): any => messages.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
