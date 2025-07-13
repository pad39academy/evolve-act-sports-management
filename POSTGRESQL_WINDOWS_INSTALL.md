# PostgreSQL Installation Guide for Windows

## 📋 The Problem

The error `'psql' is not recognized` means PostgreSQL is not installed on your Windows system. This is required for the Evolve Act sports management system to work.

## 🚀 Solution: Install PostgreSQL on Windows

### Step 1: Download PostgreSQL
1. Go to [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Click "Download the installer"
3. Choose the latest version (e.g., PostgreSQL 16.x)
4. Download the Windows x86-64 installer

### Step 2: Run the Installer
1. Run the downloaded `.exe` file as Administrator
2. Click "Next" through the welcome screen
3. **Choose Installation Directory**: Use default (`C:\Program Files\PostgreSQL\16`)
4. **Select Components**: Keep all selected (PostgreSQL Server, pgAdmin, Stack Builder, Command Line Tools)
5. **Data Directory**: Use default (`C:\Program Files\PostgreSQL\16\data`)
6. **Set Password**: 
   - **IMPORTANT**: Remember this password! 
   - Use something simple like `test` or `admin` for development
   - Write it down!

### Step 3: Configure Installation
1. **Port**: Use default `5432`
2. **Advanced Options**: Use default locale
3. **Ready to Install**: Click "Next"
4. Wait for installation to complete
5. **Finish**: Uncheck "Stack Builder" and finish

### Step 4: Verify Installation
1. Open Command Prompt
2. Type: `psql --version`
3. Should show: `psql (PostgreSQL) 16.x`

If it doesn't work, add PostgreSQL to your PATH:
1. Open System Properties (Win+R, type: `sysdm.cpl`)
2. Click "Environment Variables"
3. Under "System Variables", find "Path"
4. Click "Edit" → "New"
5. Add: `C:\Program Files\PostgreSQL\16\bin`
6. Click "OK" and restart Command Prompt

### Step 5: Create Database
1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect using the password you set during installation
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `evolve_act_sports`
5. Click "Save"

### Step 6: Update .env File
Update your `.env` file with the correct password:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports
```

Replace `your_password` with the password you set during installation.

### Step 7: Test the Setup
Run the simple setup script:
```cmd
node simple-windows-setup.js
```

## 🔧 Alternative: Use pgAdmin Only

If command line tools don't work, you can use pgAdmin:

1. **Open pgAdmin**
2. **Connect to Server**: Use password from installation
3. **Create Database**: Right-click Databases → Create → Database
4. **Name**: `evolve_act_sports`
5. **Update .env**: Use correct password
6. **Run**: `node simple-windows-setup.js`

## 🐛 Common Issues

### Issue 1: "psql command not found"
**Solution**: Add PostgreSQL to Windows PATH (see Step 4 above)

### Issue 2: "Connection refused"
**Solution**: 
1. Open Services (`services.msc`)
2. Find "postgresql-x64-16" service
3. Right-click → Start
4. Or run: `net start postgresql-x64-16`

### Issue 3: "Authentication failed"
**Solution**: Check password in .env file matches PostgreSQL password

### Issue 4: "Database does not exist"
**Solution**: Create database in pgAdmin (see Step 5 above)

## 🎯 Quick Test Commands

After installation, test these commands:
```cmd
# Check if PostgreSQL is running
net start postgresql-x64-16

# Connect to database
psql -U postgres -d evolve_act_sports

# If successful, you'll see:
# evolve_act_sports=#
```

## 📞 Need Help?

If you're still having issues:
1. Check Windows Services for PostgreSQL
2. Try restarting your computer
3. Verify the password in .env matches your PostgreSQL installation
4. Use pgAdmin to verify database connection

Once PostgreSQL is installed and running, your Evolve Act application will work perfectly!