@echo off
echo.
echo ================================================
echo    Complete Windows Setup for Evolve Act
echo ================================================
echo.

:: Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your database details
    echo Press any key to open .env file in notepad...
    pause >nul
    notepad .env
    echo.
    echo Press any key to continue after editing .env file...
    pause >nul
)

:: Step 1: Setup database
echo Step 1: Setting up database...
node setup-database.js
if %errorlevel% neq 0 (
    echo.
    echo Database setup failed. Please check the error above.
    pause
    exit /b 1
)

:: Step 2: Populate sample data
echo.
echo Step 2: Populating sample data...
node populate-with-env.js
if %errorlevel% neq 0 (
    echo.
    echo Sample data population failed. Please check the error above.
    pause
    exit /b 1
)

echo.
echo ================================================
echo    Setup completed successfully!
echo ================================================
echo.
echo Your application is ready to use!
echo.
echo To start the application:
echo   npm run dev
echo.
echo Then open your browser to: http://localhost:5000
echo.
echo Test with these credentials:
echo   Team Manager: karthik.venkatesan@example.com
echo   Hotel Manager: anand.sundaram@example.com
echo   Password: Test@123
echo.
pause