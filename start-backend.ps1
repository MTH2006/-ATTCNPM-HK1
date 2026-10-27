# HotelBooking - Start Backend Service (Spring Boot)
$backendDir = Join-Path $PSScriptRoot "backend"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting HotelBooking Spring Boot Backend " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location $backendDir

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Running with Maven CLI..." -ForegroundColor Green
    mvn spring-boot:run
} elseif (Test-Path ".\mvnw.cmd") {
    Write-Host "Running with Maven Wrapper..." -ForegroundColor Green
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "Java/Maven not found in PATH." -ForegroundColor Red
    Write-Host "Vui lòng cài đặt JDK 17+ và Maven để khởi chạy backend." -ForegroundColor Yellow
}
