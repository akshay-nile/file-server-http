# -------- DESCRIPTION --------
# This script automates the process of building the frontend,
# collecting required backend files and organizing them into a new
# core directory named 'MyFileServer' created in the project root.

param ( [switch]$SkipFreshBuild )
Set-Location $PSScriptRoot

# -------- Goto project root and create MyFileServer directory --------

Write-Host "`nSetup MyFileServer directory"
Set-Location ".."
if (Test-Path "MyFileServer") {
    Remove-Item "MyFileServer" -Recurse -Force
}
New-Item -ItemType Directory -Path "MyFileServer\services"
New-Item -ItemType File -Path "MyFileServer\.nomedia"
Copy-Item -Path "README.md" -Destination "MyFileServer" -Force


# -------- Build frontend and move the generated dist as public --------

Set-Location "frontend"
if (-not $SkipFreshBuild) {
    Write-Host "`nBuilding fresh frontend dist"
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        if (-not (Test-Path "node_modules")) {
            npm ci
        }
        npm run build
    } 
}
else {
    Write-Host "`nUsing default frontend dist"
}

if (-not (Test-Path "dist")) {
    Write-Host "`nFrontend build not found" -ForegroundColor Red
    exit 1
}
Copy-Item -Path "dist" -Destination "..\MyFileServer\public" -Recurse -Force


# -------- Copy required python backend files to MyFileServer --------

Set-Location "..\backend"
Write-Host "`nCopying the backend files"
Copy-Item -Path "server.py" -Destination "..\MyFileServer"
Copy-Item -Path "services\*.py" -Destination "..\MyFileServer\services"


# -------- Verifying the final MyFileServer folder structure --------

Set-Location ".."
Write-Host "`nVerifying the final structure"

$expectedPaths = @(
    "MyFileServer\public\assets",
    "MyFileServer\public\index.html",
    "MyFileServer\public\favicon.ico",
    "MyFileServer\services\__init__.py",
    "MyFileServer\server.py",
    "MyFileServer\.nomedia",
    "MyFileServer\README.md"
)

foreach ($path in $expectedPaths) {
    if (-not (Test-Path -Path $path)) {
        Write-Host "`nMissing: $path" -ForegroundColor Yellow
        Write-Host "Packaging Failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nSuccessfully Packaged MyFileServer" -ForegroundColor Green