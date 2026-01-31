# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in Windows PC remotly by downloading this project from GitHub repo.


# -------- Check admin privilege is available or not --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator Privilege Required" -ForegroundColor Red
    Write-Host "Please run this script as Administrator" -ForegroundColor Yellow
    exit 1
}



# -------- Download the project.zip --------

Write-Host "Downloading project.zip"
Set-Location [Environment]::GetFolderPath("Downloads")
Invoke-WebRequest `
    -Uri "https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip" `
    -OutFile "project.zip" `
    -UseBasicParsing;


# -------- Extract the project.zip --------

