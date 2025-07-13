@echo off
echo ================================================
echo    Evolve Act Sports Management - Windows Setup
echo ================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

:: Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL might not be installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/
    echo.
)

echo Node.js version:
node --version
echo.
echo NPM version:
npm --version
echo.

:: Install dependencies
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your database details:
    echo - DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports
    echo - SESSION_SECRET=your_super_secret_session_key_here
    echo.
    echo Press any key to open .env file in notepad...
    pause >nul
    notepad .env
)

:: Setup database schema
echo Setting up database schema...
npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup database schema
    echo Please check your database connection in .env file
    pause
    exit /b 1
)

:: Ask user if they want to populate sample data
echo.
echo Do you want to populate sample data? (y/n)
set /p populate_choice=
if /i "%populate_choice%"=="y" (
    echo.
    echo Populating sample data...
    populate-windows.bat
    if %errorlevel% neq 0 (
        echo WARNING: Failed to populate sample data
        echo You can try running populate-windows.bat later
        echo.
    )
)

echo.
echo ================================================
echo    Setup completed successfully!
echo ================================================
echo.
echo To start the application, run:
echo    dev-windows.bat
echo.
echo Alternative: npm run dev (if cross-env is installed)
echo.
echo Then open your browser to: http://localhost:5000
echo.
echo Test credentials:
echo    Team Manager: karthik.venkatesan@example.com
echo    Hotel Manager: anand.sundaram@example.com
echo    Password: Test@123
echo.
echo For more details, see WINDOWS_SETUP_GUIDE.md
echo.
pause