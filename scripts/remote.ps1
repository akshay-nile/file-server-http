# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in Windows PC remotly by downloading this project from GitHub repo.

# The command to execute this script remotely in PowerShell as Administrator
# Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -c irm https://github.com/akshay-nile/file-server-http/raw/master/scripts/remote.ps1 | iex"


# -------- Check admin privilege --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator Privilege Required" -ForegroundColor Red
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
    exit 1
}


# -------- Download the project.zip --------

Set-Location $HOME\Downloads

if (Test-Path "project.zip") {
    Remove-Item .\project.zip -Recurse -Force
}
if (Test-Path "file-server-http-master") {
    Remove-Item .\file-server-http-master -Recurse -Force
}

Write-Host "Downloading project.zip"
Invoke-WebRequest `
    -Uri "https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip" `
    -OutFile "project.zip" `
    -UseBasicParsing;

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
    Write-Host "Killing process PID: $PortPID" -ForegroundColor Yellow
    Stop-Process -Id $PortPID -Force
    $WasServerRunning = $true
}


# -------- Invoke installer.ps1 script --------

Write-Host "Running installer.ps1 script"
Set-Location "file-server-http-master\scripts"
powershell.exe -ExecutionPolicy Bypass -File .\installer.ps1


# -------- Restart the server if updated --------

if ($WasServerRunning) {
    $Desktop = [Environment]::GetFolderPath("Desktop")
    $Shortcut = Join-Path $Desktop "MyFileServer.lnk"
    if (Test-Path $Shortcut) { & $Shortcut }
}


# -------- Clean up downloaded junk --------

Set-Location $HOME\Downloads
Write-Host "Clearning downloaded junk"
Remove-Item .\project.zip -Recurse -Force
Remove-Item .\file-server-http-master -Recurse -Force
Write-Host "Done!`n" -ForegroundColor Green
exit 0