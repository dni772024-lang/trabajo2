# Script to stop all Node.js processes and restart the server cleanly

Write-Host "🔍 Checking for Node.js processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Yellow
    $nodeProcesses | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize
    
    Write-Host "`n⚠️  Stopping all Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "  ✅ Stopped process $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to stop process $($_.Id): $_" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Green
}

Write-Host "`n🚀 Starting server..." -ForegroundColor Cyan
Write-Host "Running: node server.js" -ForegroundColor Gray
Write-Host "`nServer will start in a new window. Press Ctrl+C in that window to stop it." -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan

# Start server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server.js"

Start-Sleep -Seconds 3

Write-Host "`n✅ Server should now be running on http://localhost:3001" -ForegroundColor Green
Write-Host "✅ Frontend should be accessible at http://localhost:5173" -ForegroundColor Green
Write-Host "`nTry logging in with:" -ForegroundColor Cyan
Write-Host "  Username: admin.pro.001" -ForegroundColor White
Write-Host "  Password: Admin123" -ForegroundColor White
