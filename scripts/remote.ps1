# -------- DESCRIPTION --------
# This script automates the process of online installation of the MyFileServer
# by downloading the project repo, uzipping it and invoking the installer.ps1


# -------- Step 1) Download the project repo zip from GitHub --------

Write-Host "Downloading the project repository zip"
Invoke-WebRequest `
    -Uri "https://github.com/akshay-nile/file-server-http/archive/refs/heads/master.zip" `
    -OutFile "project.zip" `
    -UseBasicParsing
if (-not (Test-Path "project.zip")) {
    Write-Host "Downloading project zip failed" -ForegroundColor Red
    exit 1
}

# -------- Step 2) Unzipping project.zip and run installer script --------

Write-Host "Unzipping the project.zip "
Expand-Archive -Path "project.zip" -DestinationPath '.' -Force

exit 0