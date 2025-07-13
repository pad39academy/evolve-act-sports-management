@echo off
echo.
echo ================================================
echo    Populating Sample Data for Windows
echo ================================================
echo.

:: Set environment variable for Windows
set NODE_ENV=development

:: Run the populate script
echo Running sample data population...
node_modules\.bin\tsx server/populateSampleData.ts

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to populate sample data
    echo Please check your database connection in .env file
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo    Sample data populated successfully!
echo ================================================
echo.
echo You can now test the application with sample users:
echo    Team Manager: karthik.venkatesan@example.com
echo    Hotel Manager: anand.sundaram@example.com
echo    Password: Test@123
echo.
pause