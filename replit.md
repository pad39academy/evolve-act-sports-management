# Evolve Act - Sports Event Management Platform

## Overview

**BACKUP VERSION - COMPLETE AUTHENTICATION SYSTEM**
*Date: July 12, 2025*

Evolve Act is a comprehensive sports event management platform built as a full-stack web application. This version contains a **fully functional authentication system** with the following working features:

✓ **Create New User** - Complete registration with form validation
✓ **Sign In** - User login with role-based access
✓ **Forgot Password** - Password reset via email or mobile
✓ **OTP Verification** - Email and SMS verification system

The system provides complete user authentication, role-based access control, and a dashboard for managing sports events. The application follows a monorepo structure with separate client and server directories, utilizing modern web technologies for both frontend and backend development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for database operations
- **Authentication**: Express sessions with PostgreSQL session store
- **Password Hashing**: bcrypt.js for secure password storage

## Key Components

### Authentication System
- User registration with email verification
- Login/logout functionality
- OTP (One-Time Password) verification for email and SMS
- Session-based authentication with secure HTTP-only cookies
- Role-based access control with predefined user roles

### Database Schema
- **Users Table**: Stores user information including profile data, credentials, and verification status
- **Sessions Table**: Manages user sessions for authentication
- **OTP Verifications Table**: Handles temporary verification codes for email/SMS verification

### UI Components
- Comprehensive component library using Radix UI primitives
- Form components with validation and error handling
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Dark/light theme support through CSS custom properties

### Pages and Routes
- Landing page with feature overview
- User registration with multi-step validation
- Login page with password visibility toggle
- OTP verification page with auto-focus inputs
- Dashboard with user profile and logout functionality
- 404 error page for undefined routes

## Data Flow

### User Registration Flow
1. User fills registration form with validation
2. Form data is validated using Zod schemas
3. Server creates user account with hashed password
4. OTP is generated and sent via email (and SMS if provided)
5. User is redirected to OTP verification page
6. Upon successful verification, user gains access to dashboard

### Authentication Flow
1. User submits login credentials
2. Server validates credentials against database
3. Session is created and stored in PostgreSQL
4. User is redirected to dashboard with authenticated session
5. Protected routes check session validity

### Session Management
- Sessions are stored in PostgreSQL using connect-pg-simple
- Session cookies are HTTP-only and secure in production
- Session expiration is set to 7 days
- Automatic session cleanup for expired sessions

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI/UX**: Radix UI components, Lucide icons, Tailwind CSS
- **State Management**: TanStack Query for API state
- **Validation**: Zod for schema validation
- **Routing**: Wouter for lightweight routing

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL driver
- **Authentication**: Express sessions, bcrypt.js
- **Development**: tsx for TypeScript execution, esbuild for bundling

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Development Server**: Vite dev server with HMR

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle generates migrations and pushes schema changes

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session secret via `SESSION_SECRET` environment variable
- Node environment detection for development/production modes

### Production Considerations
- Secure session cookies in production environment
- Database connection pooling for performance
- Static file serving for built React application
- Error handling and logging middleware

### Development Features
- Hot module replacement for frontend development
- Automatic server restart on backend changes
- Development-specific error overlays and debugging tools
- Console logging for OTP codes in development mode

The application is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, comprehensive error handling, and secure authentication practices.

## Working Features Status

### ✅ FULLY FUNCTIONAL AUTHENTICATION SYSTEM
All authentication features are tested and working perfectly:

1. **User Registration (Create New User)**
   - Complete form validation with Zod schemas
   - Email and mobile number validation
   - Password strength requirements
   - Role-based registration
   - Automatic OTP generation and sending

2. **OTP Verification System**
   - Email OTP delivery (console logs in development)
   - SMS OTP simulation (console logs in development)
   - 6-digit OTP verification
   - Automatic account activation upon verification

3. **User Login (Sign In)**
   - Email/password authentication
   - Role-based access control
   - Session management with PostgreSQL storage
   - Secure password hashing with bcrypt

4. **Forgot Password System**
   - Email or mobile number identification
   - OTP-based password reset
   - Secure password update
   - Automatic login after successful reset

5. **User Dashboard**
   - Role-based user information display
   - Session management
   - Logout functionality

### Testing Status
- ✅ Registration flow: Form → OTP → Verification → Login
- ✅ Login flow: Credentials → Session → Dashboard
- ✅ Forgot password: Email/Mobile → OTP → Reset → Login
- ✅ All 7 user roles working correctly
- ✅ Session persistence and logout

## Sample Data

The system includes 21 pre-approved sample users across all roles:

### User Distribution by Role:
- **State Admin Manager**: 3 users (Sundaram, Chidambaram, Balasubramaniam Corps)
- **Lead Admin**: 3 users (Raman, Chidambaram, Iyer Corps)
- **Admin**: 3 users (Rajagopal, Subramanian, Raman Corps)
- **Event Manager**: 3 users (Iyer, Chidambaram Corps)
- **Team Manager**: 3 users (Tamilnadu Sports Association)
- **Player**: 3 users (Tamilnadu Sports Association)
- **Hotel Manager**: 3 users (Sundaram, Iyer, Venkatesan Corps)

### Sample Login Credentials:
- **Email**: Use any of the sample emails (e.g., siddhartha.sundaram@example.com)
- **Password**: Test@123 (updated password for all sample users)
- **Status**: All users are pre-verified and ready to login

### Key Sample Users:
- **Siddhartha Sundaram** (siddhartha.sundaram@example.com) - State Admin Manager
- **Karthik Raman** (karthik.raman@example.com) - Lead Admin
- **Ravindra Rajagopal** (ravindra.rajagopal@example.com) - Admin
- **Anand Iyer** (anand.iyer@example.com) - Event Manager
- **Karthik Venkatesan** (karthik.venkatesan@example.com) - Team Manager
- **Karthik Chidambaram** (karthik.chidambaram@example.com) - Player
- **Anand Sundaram** (anand.sundaram@example.com) - Hotel Manager

## Recent Changes (July 12, 2025)

### Authentication System Completion
- Fixed apiRequest function signature across all auth functions
- Updated all authentication API calls to use proper JSON handling
- Resolved frontend-backend API compatibility issues
- Confirmed all authentication flows working end-to-end
- Updated sample user passwords to "Test@123" for consistency

### Database Status
- Clean database with 21 sample users
- All users pre-verified and ready for login
- Sequential user IDs properly maintained
- OTP verification system fully operational