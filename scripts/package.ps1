# -------- DESCRIPTION --------
# This script automates the process of building the frontend,
# collecting required backend files and organizing them into a new
# core directory named 'MyFileServer' created in the project root.

Set-Location $PSScriptRoot

# Step 1) -------- Goto project root and create MyFileServer directory --------

Write-Host "`nStep 1) Setup MyFileServer directory"
Set-Location ".."
if (Test-Path "MyFileServer") {
    Remove-Item "MyFileServer" -Recurse -Force
}
New-Item -ItemType Directory -Path "MyFileServer\services"
New-Item -ItemType File -Path "MyFileServer\.nomedia"


# Step 2) -------- Build frontend and move the generated dist as public --------

Write-Host "`nStep 2) Building the frontend"
Set-Location "frontend"
if (Get-Command npm -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "node_modules")) {
        npm ci
    }
    npm run build
} 
if (-not (Test-Path "dist")) {
    Write-Host "`nFrontend build not found" -ForegroundColor Red
    exit 1
}
Copy-Item -Path "dist" -Destination "..\MyFileServer\public" -Recurse -Force


# Step 3) -------- Copy required python backend files to MyFileServer --------

Write-Host "`nStep 3) Copying the backend files"
Set-Location "..\backend"
Copy-Item -Path "server.py" -Destination "..\MyFileServer"
Copy-Item -Path "services\*.py" -Destination "..\MyFileServer\services"


# Step 4) -------- Verifying the final MyFileServer folder structure --------

Write-Host "`nStep 4) Verifying final structure"
Set-Location ".."

$expectedPaths = @(
    "MyFileServer\public\assets",
    "MyFileServer\public\index.html",
    "MyFileServer\public\favicon.ico",
    "MyFileServer\services\__init__.py",
    "MyFileServer\server.py",
    "MyFileServer\.nomedia"
)

foreach ($path in $expectedPaths) {
    if (-not (Test-Path -Path $path)) {
        Write-Host "`nMissing: $path" -ForegroundColor Yellow
        Write-Host "Packaging Failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nSuccessfully Packaged MyFileServer" -ForegroundColor Green