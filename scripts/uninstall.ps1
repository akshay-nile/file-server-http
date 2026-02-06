# -------- DESCRIPTION --------
# This script automates the process of uninstalling MyFileServer
# and all its components from the project root, user home/desktop


Set-Location -Path $PSScriptRoot | Out-Null


# -------- Check for administator privilege --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator privilege required" -ForegroundColor Red
    Write-Host "Please run this script as administrator" -ForegroundColor Yellow
    exit 1
}


# -------- Kill any running process of MyFileServer -------- 

$PortPID = (Get-NetTCPConnection -LocalPort 8849 -ErrorAction SilentlyContinue).OwningProcess
if ($PortPID) {
    Stop-Process -Id $PortPID -Force
    Write-Host "`nStopped the active server" -ForegroundColor Yellow
}


# -------- Remove MyFileServer from project root -------- 

Set-Location -Path ".." | Out-Null
if (Test-Path "MyFileServer") {
    Remove-Item "MyFileServer" -Recurse -Force
    Write-Host "`nRemoved from Project Root"
}


# -------- Remove MyFileServer from User directory -------- 

$UserHome = [Environment]::GetFolderPath("UserProfile")
$TargetDir = Join-Path $UserHome "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved from User Home"
}


# -------- Remove MyFileServer from Program Files -------- 

$ProgramFiles = [Environment]::GetFolderPath("ProgramFiles")
$TargetDir = Join-Path $ProgramFiles "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved from Program Files"
}


# -------- Remove MyFileServer thumbnails cache -------- 

$ThumbnailsCache = [Environment]::GetFolderPath("LocalApplicationData")
$TargetDir = Join-Path $ThumbnailsCache "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved Thumbnails Cache"
}


# -------- Remove desktop shortcut of MyFileServer -------- 

$Desktop = [Environment]::GetFolderPath("Desktop")
$Shortcut = Join-Path $Desktop "MyFileServer.lnk"
if (Test-Path $Shortcut) {
    Remove-Item -Path $Shortcut -Force
    Write-Host "`nRemoved Desktop Shortcut"
} 


# -------- Unregister MyFileServer from Windows OS -------- 

$RegPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\MyFileServer"
if (Test-Path $RegPath) {
    Remove-Item $RegPath -Recurse -Force
    Write-Host "`nUnregistered MyFileServer from Windows OS"
}


# -------- Uninstall completed successfully

Write-Host "`nSuccessfully uninstalled MyFileServer`n" -ForegroundColor Green
exit 0