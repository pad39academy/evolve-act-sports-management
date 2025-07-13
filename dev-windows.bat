@echo off
echo.
echo ================================================
echo    Starting Evolve Act Development Server
echo ================================================
echo.

:: Set environment variable for Windows
set NODE_ENV=development

:: Start the development server
echo Starting development server...
echo Environment: %NODE_ENV%
echo.
tsx server/index.ts