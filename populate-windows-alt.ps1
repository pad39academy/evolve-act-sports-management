# Alternative PowerShell script for populating sample data on Windows

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Populating Sample Data for Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable
$env:NODE_ENV = "development"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules directory not found!" -ForegroundColor Red
    Write-Host "Please run 'npm install' first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if tsx exists
$tsxPath = "node_modules\.bin\tsx.cmd"
if (-not (Test-Path $tsxPath)) {
    Write-Host "ERROR: tsx not found in node_modules!" -ForegroundColor Red
    Write-Host "Please run 'npm install' to install dependencies." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the populate script
Write-Host "Running sample data population..." -ForegroundColor Yellow
try {
    & $tsxPath "server/populateSampleData.ts"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "   Sample data populated successfully!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now test the application with sample users:" -ForegroundColor Cyan
        Write-Host "   Team Manager: karthik.venkatesan@example.com" -ForegroundColor White
        Write-Host "   Hotel Manager: anand.sundaram@example.com" -ForegroundColor White
        Write-Host "   Password: Test@123" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "ERROR: Failed to populate sample data" -ForegroundColor Red
        Write-Host "Please check your database connection in .env file" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Failed to run populate script" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Press Enter to exit"