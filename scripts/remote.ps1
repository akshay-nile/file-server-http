# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in Windows PC remotely by downloading this project from GitHub repo
# and then invoking the installer script to install (or update) the app.

# The command to execute this script remotely in PowerShell as Administrator
# Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -c irm https://github.com/akshay-nile/file-server-http/raw/master/scripts/remote.ps1 | iex"


# -------- Check for administator privilege --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator privilege required" -ForegroundColor Red
    Write-Host "Please run this script as administrator" -ForegroundColor Yellow
    exit 1
}


# -------- Remove old junk if any --------

Set-Location -Path "$HOME\Downloads" | Out-Null

if (Test-Path "project.zip") {
    Remove-Item "project.zip" -Recurse -Force
}
if (Test-Path "file-server-http-master") {
    Remove-Item "file-server-http-master" -Recurse -Force
}


# -------- Download the project.zip --------

Write-Host "Downloading project.zip"
Invoke-WebRequest `
    -Uri "https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip" `
    -OutFile "project.zip" `
    -UseBasicParsing

if (-not (Test-Path "project.zip")) {
    Write-Host "Downloading failed" -ForegroundColor Red
    exit 1
}


# -------- Extract the project.zip --------

Write-Host "Extracting project.zip"
Expand-Archive -Path "project.zip" -DestinationPath "."

if (-not (Test-Path "file-server-http-master")) {
    Write-Host "Extraction failed" -ForegroundColor Red
    exit 1
}


# -------- Stop if the server is running --------

$WasServerRunning = $false
$PortPID = (Get-NetTCPConnection -LocalPort 8849 -ErrorAction SilentlyContinue).OwningProcess
if ($PortPID) {
    Write-Host "Stopping the active server" -ForegroundColor Yellow
    Stop-Process -Id $PortPID -Force -ErrorAction SilentlyContinue
    $WasServerRunning = $true
}


# -------- Invoke installer.ps1 script --------

Write-Host "Running install.ps1 script"
& ".\file-server-http-master\scripts\install.ps1" -NoFreshBuild


# -------- Restart the server if updated --------

if ($WasServerRunning) {
    $Desktop = [Environment]::GetFolderPath("Desktop")
    $Shortcut = Join-Path $Desktop "MyFileServer.lnk"
    if (Test-Path $Shortcut) {
        Write-Host "Starting the server again" -ForegroundColor Yellow 
        explorer.exe "$Shortcut" 
    }
}


# -------- Clean up downloaded junk --------

Write-Host "Clearning downloaded junk"
Set-Location -Path "$HOME\Downloads" | Out-Null
Remove-Item "project.zip" -Recurse -Force
Remove-Item "file-server-http-master" -Recurse -Force


# -------- Remote installation done --------
Write-Host "Done`n" -ForegroundColor Green