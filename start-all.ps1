# GoBeauty Full System Startup Script
# Runs Backend, Admin, and Mobile together
# Usage: .\start-all.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "GoBeauty Full System Startup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Ensure MongoDB is running
Write-Host "📦 Starting MongoDB service..." -ForegroundColor Yellow
Get-Service | Where-Object {$_.Name -like '*MongoDB*'} | Start-Service -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Set MongoDB connection
$env:MONGO_URI = "mongodb://localhost:27017/gobeauty"
$env:NODE_ENV = "development"

# Create jobs array
$jobs = @()

# Start Backend Server
Write-Host "🚀 Starting Backend Server on port 4000..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
  Set-Location "c:\Users\lucky\Desktop\Downloads\GoBeauty-Complete-Audited(1)\WebApp\server"
  $env:MONGO_URI = "mongodb://localhost:27017/gobeauty"
  $env:NODE_ENV = "development"
  node src/app.js
} -Name "GoBeauty-Backend"
$jobs += $backendJob

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Admin Dev Server
Write-Host "⚙️  Starting Admin Dev Server on port 3000..." -ForegroundColor Cyan
$adminJob = Start-Job -ScriptBlock {
  Set-Location "c:\Users\lucky\Desktop\Downloads\GoBeauty-Complete-Audited(1)\WebApp\admin"
  npm run dev
} -Name "GoBeauty-Admin"
$jobs += $adminJob

# Wait for admin to start
Start-Sleep -Seconds 3

# Start Mobile Expo
Write-Host "📱 Starting Mobile App (Expo)..." -ForegroundColor Cyan
$mobileJob = Start-Job -ScriptBlock {
  Set-Location "c:\Users\lucky\Desktop\Downloads\GoBeauty-Complete-Audited(1)\WebApp\mobile"
  npm start
} -Name "GoBeauty-Mobile"
$jobs += $mobileJob

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ All services starting..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:   http://localhost:4000/api" -ForegroundColor Cyan
Write-Host "Admin:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "Mobile:    Scan Expo QR code" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Admin:    admin@gobeauty.com / admin123" -ForegroundColor White
Write-Host "  Provider: pro@gobeauty.com / pro12345" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running and show job output
while ($true) {
  foreach ($job in $jobs) {
    $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
    if ($output) {
      Write-Host $output
    }
  }
  Start-Sleep -Milliseconds 500
}
