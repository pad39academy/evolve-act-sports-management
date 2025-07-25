# Windows Setup Guide - Evolve Act Sports Management

## 📋 Prerequisites for Windows

Before setting up the project on your Windows laptop, ensure you have:

### Required Software
1. **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **Git** - [Download from git-scm.com](https://git-scm.com/)
3. **PostgreSQL** - [Download from postgresql.org](https://www.postgresql.org/download/windows/)
4. **Code Editor** - [VS Code](https://code.visualstudio.com/) (recommended)

### Optional but Recommended
- **Windows Terminal** - Better terminal experience
- **Git Bash** - Comes with Git installation
- **Postman** - For API testing

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js
1. Download Node.js LTS from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation in Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Install Git
1. Download Git from [git-scm.com](https://git-scm.com/)
2. During installation, select "Git Bash Here" option
3. Verify installation:
   ```cmd
   git --version
   ```

### Step 3: Install PostgreSQL
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation:
   - Remember the password for `postgres` user
   - Default port: 5432
   - Install pgAdmin (database management tool)
3. Verify installation:
   ```cmd
   psql --version
   ```

### Step 4: Create Database
1. Open **pgAdmin** or use command line
2. Create a new database:
   ```sql
   CREATE DATABASE evolve_act_sports;
   ```
3. Note your connection details:
   - Host: localhost
   - Port: 5432
   - Database: evolve_act_sports
   - Username: postgres
   - Password: [your_password]

### Step 5: Clone the Project
1. Open **Command Prompt** or **Git Bash**
2. Navigate to your desired directory:
   ```cmd
   cd C:\Users\YourName\Documents
   ```
3. Clone the repository:
   ```cmd
   git clone https://github.com/YOUR_USERNAME/evolve-act-sports-management.git
   cd evolve-act-sports-management
   ```

### Step 6: Install Dependencies
1. In the project directory:
   ```cmd
   npm install
   ```
2. Wait for all packages to install (this may take a few minutes)

### Step 7: Configure Environment Variables
1. Create `.env` file in the project root:
   ```cmd
   copy .env.example .env
   ```
2. Edit `.env` file with your database details:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports
   SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random
   NODE_ENV=development
   ```

### Step 8: Set Up Database Schema
1. Push database schema:
   ```cmd
   npm run db:push
   ```
2. If you want sample data (multiple options):
   ```cmd
   # Option 1: Windows batch script
   populate-windows.bat
   
   # Option 2: PowerShell script
   populate-windows-alt.ps1
   
   # Option 3: Node.js script
   node populate-simple.js
   
   # Option 4: Direct npx command
   npx tsx server/populateSampleData.ts
   ```

### Step 9: Start the Application

#### Option 1: Using Windows Batch Script (Recommended)
1. Start development server:
   ```cmd
   dev-windows.bat
   ```

#### Option 2: Using NPM (if cross-env is installed)
1. Install cross-env for Windows compatibility:
   ```cmd
   npm install cross-env
   ```
2. Start development server:
   ```cmd
   npm run dev
   ```

3. Open your browser and go to: `http://localhost:5000`

## 🧪 Testing the Application

### Test User Accounts
Use these credentials to test different roles:

**Team Manager:**
- Email: `karthik.venkatesan@example.com`
- Password: `Test@123`

**Hotel Manager:**
- Email: `anand.sundaram@example.com`
- Password: `Test@123`

**Event Manager:**
- Email: `anand.iyer@example.com`
- Password: `Test@123`

**Player:**
- Email: `karthik.chidambaram@example.com`
- Password: `Test@123`

### Test Scenarios

#### 1. Authentication Testing
- Test user registration with OTP verification
- Test login with different roles
- Test password reset functionality

#### 2. Team Management Testing
- Login as Team Manager
- Create a new team with multiple players
- Test accommodation requests

#### 3. Hotel Management Testing
- Login as Hotel Manager
- Create hotels with room categories
- Test accommodation approval workflow

#### 4. QR Code Testing
- Generate QR codes for accommodations
- Test bulk check-in QR generation
- Test QR code scanning functionality

#### 5. Bulk Operations Testing
- Test bulk check-in functionality
- Test bulk check-out (regular and early)
- Verify status updates

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- **TypeScript and JavaScript Language Features**
- **Tailwind CSS IntelliSense**
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### Database Management
- **pgAdmin** - Graphical PostgreSQL management
- **DBeaver** - Universal database tool (alternative)

### API Testing
- **Postman** - Test API endpoints
- **Thunder Client** - VS Code extension for API testing

## 🐛 Troubleshooting

### Common Issues on Windows

#### 1. PowerShell Execution Policy Error
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Node.js PATH Issues
If `node` command not found:
1. Restart Command Prompt
2. Check if Node.js is in PATH
3. Reinstall Node.js with "Add to PATH" option

#### 3. PostgreSQL Connection Issues
If database connection fails:
1. Check if PostgreSQL service is running:
   ```cmd
   net start postgresql-x64-14
   ```
2. Verify connection string in `.env`
3. Check firewall settings

#### 4. NODE_ENV Environment Variable Error
If you get `'NODE_ENV' is not recognized` error:
1. **Use Windows batch scripts** (recommended):
   ```cmd
   dev-windows.bat
   populate-windows.bat
   ```
2. **Install cross-env** for npm script compatibility:
   ```cmd
   npm install cross-env
   ```

#### 5. Port 5000 Already in Use
If port 5000 is occupied:
1. Find and kill the process:
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```
2. Or modify the port in `server/index.ts`

#### 6. TypeScript Compilation Errors
If TypeScript errors occur:
```cmd
npm run build
```

#### 7. Git Line Ending Issues
Configure Git for Windows:
```cmd
git config --global core.autocrlf true
```

#### 8. 'tsx' is not recognized Error
If you get `'tsx' is not recognized` error:
1. **Use Node.js script** (most reliable):
   ```cmd
   node populate-simple.js
   ```
2. **Use PowerShell script**:
   ```cmd
   populate-windows-alt.ps1
   ```
3. **Use npx** (if available):
   ```cmd
   npx tsx server/populateSampleData.ts
   ```
4. **Use full path to tsx**:
   ```cmd
   node_modules\.bin\tsx server/populateSampleData.ts
   ```

#### 9. Missing populate-sample-data Script
If `npm run populate-sample-data` fails:
1. Use any of the alternative scripts above
2. Check if dependencies are installed:
   ```cmd
   npm install
   ```

## 📊 Performance Optimization

### For Better Performance on Windows:
1. **Use Windows Terminal** instead of Command Prompt
2. **Enable Windows Subsystem for Linux (WSL)** for better compatibility
3. **Use SSD** for faster npm installs
4. **Increase Node.js memory** if needed:
   ```cmd
   node --max-old-space-size=4096 node_modules/.bin/vite
   ```

## 🔐 Security Considerations

### Local Development Security:
1. Never commit `.env` file
2. Use strong `SESSION_SECRET`
3. Keep dependencies updated:
   ```cmd
   npm audit
   npm audit fix
   ```
4. Use HTTPS in production

## 📱 Mobile Testing

### Test on Mobile Devices:
1. Find your local IP address:
   ```cmd
   ipconfig
   ```
2. Access from mobile browser:
   ```
   http://YOUR_LOCAL_IP:5000
   ```
3. Ensure Windows Firewall allows connections on port 5000

## 🚀 Production Build Testing

### Test Production Build:
1. Build the application:
   ```cmd
   npm run build
   ```
2. Start production server:
   ```cmd
   npm start
   ```
3. Test all functionality in production mode

## 📝 Development Commands

### Useful Commands for Development:
```cmd
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:push

# Generate database schema
npm run db:generate

# View database in browser
npm run db:studio

# Check for TypeScript errors
npm run type-check

# Run tests (if available)
npm test
```

## 📞 Support

### If You Need Help:
1. Check the console for error messages
2. Review the main README.md for detailed documentation
3. Check database logs in pgAdmin
4. Verify all environment variables are set correctly

### Useful Resources:
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Your Windows development environment is now ready! 🎉**

The application should be running at `http://localhost:5000` with full functionality including:
- User authentication and role-based access
- Team and hotel management
- QR code generation and scanning
- Bulk operations
- Real-time status updates

You can now develop, test, and modify the application on your Windows laptop!