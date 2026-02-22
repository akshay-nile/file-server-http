# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# remotely by downloading the project build from GitHub repository
# and then install or update the MyFileServer in Windows PC.

# The command to execute this script remotely in PowerShell as Administrator
# Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -c irm https://github.com/akshay-nile/file-server-http/raw/master/scripts/install.ps1 | iex"


# -------- Check for administator privilege --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator Privilege Required" -ForegroundColor Red
    exit 1
}


# -------- Remove the old junk if any --------

Set-Location -Path "$HOME\Downloads" | Out-Null

if (Test-Path "package.zip") {
    Remove-Item "package.zip" -Recurse -Force
}
if (Test-Path "file-server-http-package") {
    Remove-Item "file-server-http-package" -Recurse -Force
}


# -------- Download the package.zip --------

Write-Host "Downloading package.zip"
Invoke-WebRequest `
    -Uri "https://github.com/akshay-nile/file-server-http/archive/refs/heads/package.zip" `
    -OutFile "package.zip" `
    -UseBasicParsing

if (-not (Test-Path "package.zip")) {
    Write-Host "Downloading failed" -ForegroundColor Red
    exit 1
}


# -------- Extract the package.zip --------

Write-Host "Extracting package.zip"
Expand-Archive -Path "package.zip" -DestinationPath "."

if (-not (Test-Path "$HOME\Downloads\file-server-http-package\MyFileServer")) {
    Write-Host "Extraction failed" -ForegroundColor Red
    exit 1
}


# -------- Declare fixed directory paths --------

$PackageDir = "$HOME\Downloads\file-server-http-package\MyFileServer"
$InstallDir = Join-Path $([Environment]::GetFolderPath("ProgramFiles")) "MyFileServer"


# -------- Prepare installation directory --------

$UvExe = Join-Path "$InstallDir" "tools\uv.exe"
$UpdateExistingInstallation = Test-Path "$UvExe"
$IsServerAlreadyRunning = $false

if ($UpdateExistingInstallation) {

    # -------- Stop if the server is already running --------

    $PortPID = (Get-NetTCPConnection -LocalPort 8849 -ErrorAction SilentlyContinue).OwningProcess
    if ($PortPID) {
        Write-Host "Stopping the active server" -ForegroundColor Yellow
        Stop-Process -Id $PortPID -Force -ErrorAction SilentlyContinue
        $IsServerAlreadyRunning = $true
    }

    Write-Host "Updating the existing installation" -ForegroundColor Yellow
    
    Get-ChildItem -Path "$InstallDir" -Force |
    Where-Object { $_.Name -notin '.venv', 'tools' } |
    Remove-Item -Recurse -Force

    Move-Item -Path "$PackageDir\*" -Destination "$InstallDir" -Force | Out-Null
}
else {
    Write-Host "Preparing the fresh installation"
    Move-Item -Path "$PackageDir" -Destination "$InstallDir" -Force | Out-Null

    Write-Host "Downloading uv tools"
    $env:UV_INSTALL_DIR = Join-Path "$InstallDir" "tools";
    $env:UV_NO_MODIFY_PATH = "1"; 
    powershell.exe -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
}


# -------- Verify and unblock tools/uv.exe --------

if (-not (Test-Path "$UvExe")) {
    Write-Host "Downloading tools failed" -ForegroundColor Red
    exit 1
}
Unblock-File "$UvExe"


# -------- Syncing uv dependencies --------

Write-Host "Syncing uv dependencies"
Set-Location -Path "$InstallDir" | Out-Null

& $UvExe sync --no-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency syncing failed" -ForegroundColor Red
    exit 1
}


# -------- Creating the desktop shortcut --------

Write-Host "Creating the desktop shortcut"
$ShortcutPath = Join-Path "$([Environment]::GetFolderPath("Desktop"))" "MyFileServer.lnk"
$IconPath = Join-Path "$InstallDir" "public\favicon.ico"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $UvExe
$Shortcut.Arguments = "run --no-dev server.py"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = $IconPath
$Shortcut.Save()


# -------- Registering MyFileServer to Windows OS --------

Write-Host "Registering MyFileServer to Windows OS"

$Version = $(Get-Content "$InstallDir\version.txt")
$UninstallScript = Join-Path "$InstallDir" "uninstall.ps1"
$UninstallCommand = "powershell.exe -ExecutionPolicy Bypass -File `"$UninstallScript`""

$RegPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\MyFileServer"
New-Item -Path $RegPath -Force | Out-Null

Set-ItemProperty $RegPath DisplayName "MyFileServer"
Set-ItemProperty $RegPath DisplayVersion $Version
Set-ItemProperty $RegPath Publisher "Akshay Nile"
Set-ItemProperty $RegPath InstallLocation "$InstallDir"
Set-ItemProperty $RegPath UninstallString $UninstallCommand
Set-ItemProperty $RegPath DisplayIcon "$IconPath"
Set-ItemProperty $RegPath NoModify 1
Set-ItemProperty $RegPath NoRepair 1


# -------- Restart the server if it is updated --------

if ($IsServerAlreadyRunning) {
    $Shortcut = "$HOME\Desktop\MyFileServer.lnk"
    if (Test-Path $Shortcut) {
        Write-Host "Starting the server again" -ForegroundColor Yellow 
        explorer.exe "$Shortcut" 
    }
}


# -------- Clean up downloaded junk --------

Write-Host "Clearning downloaded junk"
Set-Location -Path "$HOME\Downloads" | Out-Null
Remove-Item "package.zip" -Recurse -Force
Remove-Item "file-server-http-package" -Recurse -Force


# -------- Installation finished --------

if ($UpdateExistingInstallation) {
    Write-Host "`nSuccessfully Updated to MyFileServer v$Version" -ForegroundColor Green
}
else {
    Write-Host "`nSuccessfully Installed MyFileServer v$Version" -ForegroundColor Green
}

Start-Sleep -Seconds 10