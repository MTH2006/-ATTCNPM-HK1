# Stop Local PostgreSQL Instance
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$pgDataDir = Join-Path $rootDir "database\pgdata"
$pgctlExe = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"

if (Test-Path $pgDataDir) {
    & $pgctlExe -D $pgDataDir stop -m fast
    Write-Host "PostgreSQL local cluster stopped." -ForegroundColor Yellow
} else {
    Write-Host "Database folder not found." -ForegroundColor Red
}
