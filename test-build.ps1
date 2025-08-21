Write-Host "Testing backend build..." -ForegroundColor Green

# Change to backend directory
Set-Location "backend"

# Clean and build
Write-Host "Running gradle clean build..." -ForegroundColor Yellow
./gradlew clean build -x test --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Starting the application..." -ForegroundColor Yellow
    ./gradlew bootRun
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
} 