# Evolve Act - Sports Event Management Platform

## Overview

Evolve Act is a comprehensive sport event management platform built as a full-stack web application. This system provides complete user authentication, role-based access control, and dashboards for managing sports events, teams, hotels, and accommodations.

## 🌟 Key Features

### ✅ Complete Authentication System
- **7 User Roles**: State Admin Manager, Lead Admin, Admin, Event Manager, Team Manager, Player, Hotel Manager
- **User Registration** with email and mobile verification
- **OTP Verification** for secure account activation
- **Password Reset** via email or mobile
- **Session Management** with PostgreSQL storage

### ✅ Role-Based Dashboards
- **Team Manager**: Create teams, manage players, handle accommodations
- **Event Manager**: Tournament management, team approvals, hotel assignments
- **Hotel Manager**: Hotel management, room categories, booking approvals
- **Player**: View accommodations, booking history, QR codes
- **Admin**: User management, approvals, system oversight

### ✅ Advanced Hotel & Accommodation System
- **Two Hotel Types**: Pay-per-use and On-availability
- **Room Categories**: Single, twin, triple sharing options
- **Booking Workflow**: Request → Assignment → Approval → Confirmation
- **QR Code Integration**: Scannable codes for check-in/check-out

### ✅ Team Management
- **Team Creation**: Multi-player registration with detailed profiles
- **Approval Workflow**: Team Manager → Event Manager → Admin
- **Accommodation Requests**: Individual player hotel assignments
- **Bulk Operations**: Check-in/check-out entire teams

### ✅ QR Code System
- **Player QR Codes**: Individual accommodation verification
- **Bulk Check-in QR**: Team manager generates, hotel manager scans
- **Downloadable QR Codes**: 96x96px professional format
- **Status Tracking**: Pending, checked-in, checked-out, early checkout

## 🚀 Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state management
- **Shadcn/ui** components with Radix UI
- **Tailwind CSS** for styling
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations
- **Express Sessions** for authentication

### Development
- **Hot Module Replacement** for fast development
- **Database Migrations** with Drizzle Kit
- **TypeScript** strict configuration
- **RESTful API** architecture

## 📋 Sample Data

The system includes 21 pre-verified users across all roles:

### Login Credentials
- **Email**: Use any sample email (e.g., `siddhartha.sundaram@example.com`)
- **Password**: `Test@123` (consistent across all accounts)

### Sample Users by Role
- **State Admin**: Sundaram, Chidambaram, Balasubramaniam
- **Lead Admin**: Raman, Chidambaram, Iyer
- **Admin**: Rajagopal, Subramanian, Raman
- **Event Manager**: Iyer, Chidambaram
- **Team Manager**: Venkatesan, Raman, Iyer
- **Player**: Chidambaram, Sundaram, Venkatesan
- **Hotel Manager**: Sundaram, Iyer, Venkatesan

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Environment Variables
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
```

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd evolve-act
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Push database schema
   npm run db:push
   
   # Populate sample data
   npm run populate-sample-data
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: `http://localhost:5000`
   - Backend API: `http://localhost:5000/api`

## 🏗 Project Structure

```
evolve-act/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
├── shared/                 # Shared code
│   └── schema.ts           # Database schema & types
└── README.md
```

## 🔐 Authentication Flow

### Registration Process
1. User fills registration form
2. Server validates and creates account
3. OTP sent via email/SMS
4. User verifies OTP
5. Account activated

### Login Process
1. User submits credentials
2. Server validates against database
3. Session created and stored
4. User redirected to role-based dashboard

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **sessions**: Authentication sessions
- **otp_verifications**: Temporary verification codes
- **hotels**: Hotel information and settings
- **room_categories**: Room types and pricing
- **team_requests**: Team registration requests
- **team_members**: Individual team member details
- **player_accommodation_requests**: Hotel booking workflow

## 🎯 Key Workflows

### Team Creation & Approval
1. **Team Manager** creates team with players
2. **Event Manager** reviews and approves team
3. **System** creates accommodation requests for players
4. **Event Manager** assigns hotels to players
5. **Hotel Manager** approves/rejects assignments

### Accommodation Management
1. **Player** gets accommodation assignment
2. **Hotel Manager** approves booking
3. **System** generates QR codes
4. **Team Manager** performs bulk check-in
5. **Hotel Manager** can scan QR codes

### Bulk Check-in Process
1. **Team Manager** generates bulk QR code
2. **Hotel Manager** scans QR in scanner tab
3. **System** validates permissions
4. **All eligible players** checked in simultaneously

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Team Management
- `GET /api/team-manager/team-requests` - List team requests
- `POST /api/team-manager/team-requests` - Create team request
- `POST /api/team-manager/team-requests/:id/bulk-checkin` - Bulk check-in
- `POST /api/team-manager/team-requests/:id/bulk-checkout` - Bulk check-out

### Hotel Management
- `GET /api/hotel-manager/hotels` - List hotels
- `POST /api/hotel-manager/hotels` - Create hotel
- `GET /api/hotel-manager/accommodation-requests` - List accommodation requests
- `POST /api/hotel-manager/process-bulk-qr` - Process bulk QR codes

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set secure session secret
- Enable HTTPS cookies

## 🧪 Testing

### Sample Test Scenarios
1. **User Registration**: Test OTP verification flow
2. **Team Creation**: Create team with multiple players
3. **Hotel Assignment**: Assign accommodation to players
4. **Bulk Operations**: Test check-in/check-out workflows
5. **QR Code System**: Generate and scan QR codes

## 📈 Recent Updates

### Latest Features (July 2025)
- ✅ **Bulk Check-in QR System**: Team managers generate QR codes, hotel managers scan
- ✅ **Enhanced QR Code Display**: 96x96px professional QR codes with download functionality
- ✅ **Early Checkout Status**: Informational display instead of separate button
- ✅ **Hotel Booking Categories**: Pay-per-use and On-availability hotel types
- ✅ **Player-Level Accommodations**: Individual accommodation requests per player

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `replit.md`
- Review the database schema in `shared/schema.ts`

---

**Built with ❤️ for efficient sports event management**