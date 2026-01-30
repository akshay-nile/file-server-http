# -------- DESCRIPTION --------
# This script automates the process of uninstalling MyFileServer
# and all its components from the project root, user home/desktop

Set-Location $PSScriptRoot


# -------- Check admin privilege is available or not --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator Privilege Required" -ForegroundColor Red
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
    exit 1
}


# Step 0) Kill any running process of MyFileServer

$PortPID = (Get-NetTCPConnection -LocalPort 8849 -ErrorAction SilentlyContinue).OwningProcess
if ($PortPID) {
    Write-Host "Killing process PID: $PortPID" -ForegroundColor Yellow
    Stop-Process -Id $PortPID -Force
}


# Step 1) Remove MyFileServer from project root

Set-Location ".."
if (Test-Path "MyFileServer") {
    Remove-Item "MyFileServer" -Recurse -Force
    Write-Host "`nRemoved from Project Root"
}


# Step 2) Remove MyFileServer from User directory

$UserHome = [Environment]::GetFolderPath("UserProfile")
$TargetDir = Join-Path $UserHome "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved from User Home"
}


# Step 3) Remove MyFileServer from Program Files

$ProgramFiles = [Environment]::GetFolderPath("ProgramFiles")
$TargetDir = Join-Path $ProgramFiles "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved from Program Files"
}


# Step 4) Remove MyFileServer thumbnails cache

$ThumbnailsCache = [Environment]::GetFolderPath("LocalApplicationData")
$TargetDir = Join-Path $ThumbnailsCache "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved Thumbnails Cache"
}


# Step 5) Remove desktop shortcut of MyFileServer

$Desktop = [Environment]::GetFolderPath("Desktop")
$Shortcut = Join-Path $Desktop "MyFileServer.lnk"
if (Test-Path $Shortcut) {
    Remove-Item -Path $Shortcut -Force
    Write-Host "`nRemoved Desktop Shortcut"
} 


# Step 6) Unregister MyFileServer from Windows OS

$RegPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\MyFileServer"
if (Test-Path $RegPath) {
    Remove-Item $RegPath -Recurse -Force
    Write-Host "`nUnregistered MyFileServer from Windows OS"
}


Write-Host "`nSuccessfully Uninstalled MyFileServer`n" -ForegroundColor Green