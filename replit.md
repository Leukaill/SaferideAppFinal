# SafeRide - Student Transport Safety App

## Overview

SafeRide is a comprehensive student transport safety application designed to provide real-time tracking and monitoring for school transportation systems. The platform serves multiple user roles including parents, drivers, administrators, and managers, offering features like live GPS tracking, attendance monitoring, route management, and safety alerts. Built as a mobile-first progressive web application (PWA), SafeRide enables seamless communication between all stakeholders in student transportation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React 18** with TypeScript, adopting a mobile-first responsive design approach. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight navigation solution. State management is handled through **TanStack Query (React Query)** for server state and React's built-in hooks for local state. The UI framework is **shadcn/ui** built on top of **Radix UI** primitives, styled with **Tailwind CSS** using an iOS-inspired design system.

**Component Architecture**: The app follows a modular component structure with reusable UI components in the `/components/ui` directory and page-specific components organized by functionality. A custom authentication context provider manages user sessions and role-based access control.

**Progressive Web App**: The application is configured as a PWA with service worker support for offline capabilities and mobile app-like behavior, including custom manifest and caching strategies.

### Backend Architecture
The backend is built with **Express.js** and TypeScript, following a RESTful API design pattern. The server implements middleware for request logging, JSON parsing, and JWT-based authentication. Routes are modularized and registered through a central route handler that provides endpoints for authentication, user management, and core application features.

**Authentication System**: JWT-based authentication with bcrypt password hashing. The system supports role-based access control with four distinct user roles: parent, driver, admin, and manager.

**Error Handling**: Centralized error handling middleware captures and formats errors consistently across all API endpoints.

### Data Storage Solutions
The application uses **Drizzle ORM** with **PostgreSQL** as the primary database solution, specifically configured for **Neon Database** (serverless PostgreSQL). The database schema is defined using Drizzle's schema definition with TypeScript types, providing type-safe database operations.

**Schema Design**: The database includes tables for users, students, routes, trips, attendance records, and alerts. Relationships are properly established with foreign keys, and the schema supports complex operations like route management with JSON-stored stop information.

**Type Safety**: Drizzle-Zod integration provides runtime validation and type inference from database schemas to ensure data consistency.

### Authentication and Authorization
**JWT Implementation**: JSON Web Tokens are used for stateless authentication with a secret key. Tokens contain user ID and role information for authorization decisions.

**Role-Based Access**: Four distinct user roles with different access levels:
- Parents: Access to their children's information and trip tracking
- Drivers: Route management and trip operations
- Admins: System-wide management capabilities
- Managers: Analytics and oversight functions

**Session Management**: Client-side token storage in localStorage with automatic authentication state persistence.

### External Dependencies
**UI and Styling**: 
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- Custom iOS-inspired design tokens

**Development Tools**:
- Vite for fast development and building
- TypeScript for type safety
- ESBuild for production bundling
- Replit-specific development enhancements

**Database and ORM**:
- Neon Database (serverless PostgreSQL)
- Drizzle ORM with PostgreSQL dialect
- Connection pooling via @neondatabase/serverless

**Authentication and Security**:
- bcrypt for password hashing
- jsonwebtoken for JWT implementation
- connect-pg-simple for session storage (if needed)

**Utilities and Validation**:
- Zod for schema validation
- date-fns for date manipulation
- class-variance-authority for component variants
- clsx and tailwind-merge for conditional styling

**Potential Future Integrations**:
- Firebase configuration is prepared for real-time features
- PWA capabilities for mobile app deployment
- Service worker for offline functionality