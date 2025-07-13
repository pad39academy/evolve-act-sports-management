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

## Recent Changes (July 13, 2025)

### Data Cleanup - COMPLETED ✅
- **Removed Coimbatore Thunder Test Data** - Cleaned up duplicate team requests and associated data
- **Database Optimization** - Removed 5 duplicate team requests, 6 team members, and 2 account creation requests
- **Maintained Data Integrity** - Preserved foreign key relationships while removing test data

### QR Code Enhancement System - FULLY IMPLEMENTED ✅
- **Enhanced QR Code Display** - QR codes now show as actual scannable images (200x200px) instead of text
- **Improved QR Code Downloads** - Downloads now save as PNG image files instead of text files
- **QR Code Loading States** - Added "Generating QR..." loading indicators while QR codes are being created
- **Complete QR Code Integration** - Updated all QR code sections (current bookings, pending requests, booking history)
- **QR Code Caching** - Implemented client-side caching to improve performance and reduce regeneration
- **Professional QR Code Display** - QR codes now display in clean white bordered containers with download buttons
- **Player Dashboard QR Codes** - All accommodation QR codes now render as proper scannable images for hotel booking verification

### Event Manager Team Creation System - FULLY IMPLEMENTED ✅
- **Complete Team Creation Functionality** - Event Managers can now create teams with automatic approval
- **New Dashboard Tab** - Added "Add Team" tab to Event Manager dashboard with comprehensive team management
- **Multi-Player Registration** - Full support for adding multiple players with detailed information (name, contact, position, accommodation)
- **Automatic User Account Creation** - Team members automatically get user accounts with proper password hashing
- **User Account Login** - All created team members can log in with email/password (default: Test@123)
- **Accommodation Request Integration** - Players requiring accommodation automatically get accommodation requests created
- **API Route Implementation** - Added `/api/event-manager/team-requests` endpoint for team creation
- **Password Security** - Proper bcrypt password hashing with 12-round salting for security
- **User Verification** - Auto-verification of created accounts for immediate login access
- **Organization Field Management** - Fixed organization field handling in user creation process
- **Database Integration** - Full database persistence with proper user linking and accommodation requests
- **Testing Completed** - Successfully tested with multiple teams: Chennai Champions, Mumbai Warriors, Delhi Dynamos, Bangalore Blazers, Kolkata Knights

### Hotel Booking Categorization System - FULLY IMPLEMENTED ✅
- **Two Booking Categories Added** - "Pay Per Use" and "On Availability" hotel booking types
- **Pay Per Use Hotels** - Fixed room allocation with sharing options (single/twin/triple sharing)
- **On Availability Hotels** - Traditional hotel manager approval workflow with dynamic availability
- **Auto-Approval Logic** - Pay-per-use hotels automatically approve accommodations when assigned by event managers
- **Sharing Configuration** - Room categories now support single, twin, and triple sharing configurations for sports events
- **UI Updates** - Hotel manager dashboard updated with booking type selection and sharing room configuration
- **Database Schema** - Added booking_type to hotels table and sharing fields to room_categories table
- **Event Manager Integration** - Assignment workflow checks hotel booking type and auto-approves for pay-per-use hotels
- **Dynamic Room Availability** - Pay-per-use hotels show all rooms as available initially, then decrease as rooms are allocated
- **Automated Room Tracking** - System automatically updates available room counts when accommodations are confirmed
- **Form Validation** - Available rooms field disabled for pay-per-use hotels (auto-calculated from total rooms)
- **Complete Testing Ready** - All workflows tested and ready for user demonstration

## Recent Changes (July 13, 2025)

### Windows Testing Setup - COMPLETED ✅
- **Environment Variable Loading** - Created load-env.js to properly load .env files on Windows
- **Database Setup Script** - Created setup-database.js for automated PostgreSQL database creation
- **Enhanced Populate Script** - Created populate-with-env.js with proper environment variable loading
- **Complete Windows Setup** - Created windows-complete-setup.bat for automated setup process
- **Multiple Fallback Options** - Created alternative scripts for different Windows environments
- **Comprehensive Documentation** - Updated WINDOWS_SETUP_GUIDE.md with tsx command fixes
- **Database Connection Diagnostics** - Added detailed error messages for database connection issues

### GitHub Integration Setup - COMPLETED ✅
- **Complete Project Documentation** - Created comprehensive README.md with all features, setup instructions, and API documentation
- **Repository Preparation** - Added .gitignore with proper exclusions for Node.js, TypeScript, and Replit files
- **Deployment Guide** - Created DEPLOYMENT_GUIDE.md with GitHub setup steps and deployment options
- **Environment Configuration** - Added .env.example template for other developers
- **Project Structure** - Organized codebase for easy GitHub integration and collaboration
- **Security Checklist** - Included production deployment security guidelines
- **Documentation Standards** - Professional documentation ready for open-source sharing

### Early Checkout Status Enhancement - COMPLETED ✅
- **Removed Separate Button** - Eliminated cluttered "Early Check Out" button from interface
- **Dropdown Integration** - Added dropdown menu to Bulk Check Out with "Regular" and "Early" options
- **Status Display Enhancement** - Early checkout now shows as orange informational badge
- **Improved UX** - Clean interface with early checkout as status indicator, not action button
- **Database Integration** - Properly uses isEarlyCheckout boolean field for status tracking

### Bulk Check-in/Check-out System Implementation - COMPLETED ✅
- **Team Manager Bulk Operations** - Added accommodation management tab to team manager dashboard
- **Bulk Check-in Functionality** - Team managers can check in all approved players at once
- **Bulk Check-out Functionality** - Team managers can check out all checked-in players (regular or early checkout)
- **Early Checkout Support** - Special early checkout option for flexible departure times
- **Real-time Status Tracking** - Live updates of check-in/check-out status and actual times
- **Database Schema Updates** - Added check_in_status, check_out_status, actual_check_in_time, actual_check_out_time fields
- **API Routes Implementation** - Full REST API for bulk operations (/api/team-manager/team-requests/:id/bulk-checkin, /api/team-manager/team-requests/:id/bulk-checkout)
- **UI Status Badges** - Visual indicators for pending, checked in, and checked out status
- **Complete Testing** - Successfully tested with Mumbai Warriors team (2 players checked in and out)

### Automatic User Account Creation - COMPLETED ✅
- **Fixed Team Member User Creation** - Team members now automatically get user accounts when added to teams
- **Individual Player Login** - All team members (Virat Kohli, Jasprit Bumrah, Rohit Sharma, Hardik Pandya) now have working login accounts
- **Automatic Password Assignment** - New team members get default password "Test@123" for immediate login access
- **User Account Linking** - Team members table properly links to users table with correct user_id references
- **Complete Authentication** - Team members can now log in with their email addresses and access player dashboards
- **Backward Compatibility** - Fixed existing team members to have proper user accounts and login access

### Player-Level Accommodation System Implementation - COMPLETED ✅
- **Database Schema Updates** - Added player_accommodation_requests table with complete workflow fields
- **Team Member Accommodation Fields** - Moved accommodation preferences from team level to individual player level
- **UI Updates** - Updated team manager dashboard to include accommodation checkbox and preferences per player
- **Enhanced Team Approval Process** - Team approval now creates accommodation requests for players who need them
- **Event Manager Hotel Assignment** - Added accommodation assignment dialog for hotel and room category selection
- **Hotel Manager Accommodation Review** - API routes for hotel managers to approve/reject individual player requests
- **Player Accommodation Dashboard** - Routes for players to view their accommodation booking status
- **Complete Workflow Implementation** - Team approval → accommodation request → hotel assignment → hotel approval/rejection → reassignment capability
- **Hotel Manager Accommodation Approval** - Added "Accommodation Requests" tab to Hotel Manager dashboard for approve/reject functionality
- **Event Manager Rejected Accommodations** - Added "Rejected Accommodations" tab to Event Manager dashboard for reassignment capability
- **Complete API Integration** - Full REST API support for hotel approval/rejection and reassignment workflow
- **Testing Completed** - Successfully tested complete workflow: assignment → rejection → reassignment cycle

### Team Management System Implementation - COMPLETED ✅
- **Complete Team Manager Dashboard** - Fully functional with team creation and multi-player registration
- **Team Request Management** - Create team requests with detailed team information and tournament selection
- **Multi-Player Registration** - Add multiple team members with comprehensive player details (name, DOB, contact, position, sport)
- **Event Manager Team Approval** - Team approvals tab added to Event Manager dashboard with approve/reject functionality
- **Database Schema Extended** - Added team_requests, team_members, account_creation_requests tables
- **API Routes Implementation** - Full REST API for team management and approval workflows
- **Role-based Access Control** - Team managers see only their teams, Event Managers can approve all team requests
- **Account Creation Notifications** - Automated email notifications for new user account creation requests
- **Complete Workflow Testing** - Successfully tested team creation → approval → rejection flow

### Hotel Management System Implementation
- **Complete Hotel Manager Dashboard** - Fully functional with hotel CRUD operations
- **Room Category Management** - Create, edit, delete room categories with pricing
- **Booking Request Management** - Approve/reject booking requests with reasons
- **Enhanced Contact Information** - Separate fields for phone, email, alternate contacts
- **Database Schema Extended** - Added hotels, room_categories, booking_requests tables
- **API Routes Implementation** - Full REST API for hotel management operations
- **Sample Data Population** - 33+ booking requests across 3 hotel managers
- **Role-based Access Control** - Hotel managers only see their assigned hotels

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
- 8 sample hotels assigned to 3 hotel managers
- 7 room categories with pricing and amenities
- 33+ booking requests for comprehensive testing
- 7 team requests created with multi-player registration
- Team approval workflow tested with both approval and rejection scenarios
- New player_accommodation_requests table for individual player hotel assignments
- Accommodation preferences moved from team level to individual player level
- Sample team #7 (Doblex) has player with accommodation requirement for testing

### Hotel Manager Dashboard Features
- **Hotel Management**: Create, edit, delete hotels with detailed information
- **Room Categories**: Manage room types, pricing, availability, and amenities
- **Booking Requests**: Review, approve, or reject team booking requests
- **Contact Information**: Structured contact fields (phone, email, alternates)
- **Auto-approval Settings**: Toggle automatic booking approval per hotel
- **Role-based Routing**: Automatic redirection to appropriate dashboard