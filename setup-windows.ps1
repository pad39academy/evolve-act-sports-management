# Evolve Act Sports Management - Windows PowerShell Setup Script

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Evolve Act Sports Management - Windows Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Git
if (-not (Test-Command "git")) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check PostgreSQL
if (-not (Test-Command "psql")) {
    Write-Host "WARNING: PostgreSQL might not be installed or not in PATH" -ForegroundColor Yellow
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/" -ForegroundColor Yellow
    Write-Host ""
}

# Display versions
Write-Host "Node.js version:" -ForegroundColor Green
node --version
Write-Host ""
Write-Host "NPM version:" -ForegroundColor Green
npm --version
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Please edit .env file with your database details:" -ForegroundColor Red
    Write-Host "- DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports" -ForegroundColor White
    Write-Host "- SESSION_SECRET=your_super_secret_session_key_here" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open .env file in notepad..."
    Read-Host
    notepad .env
}

# Setup database schema
Write-Host "Setting up database schema..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to setup database schema" -ForegroundColor Red
    Write-Host "Please check your database connection in .env file" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Success message
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   Setup completed successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open your browser to: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Yellow
Write-Host "   Team Manager: karthik.venkatesan@example.com" -ForegroundColor White
Write-Host "   Hotel Manager: anand.sundaram@example.com" -ForegroundColor White
Write-Host "   Password: Test@123" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see WINDOWS_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"