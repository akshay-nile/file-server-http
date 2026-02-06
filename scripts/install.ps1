# -------- DESCRIPTION --------
# This script automates the process of installing (or updating) 
# the MyFileServer in Windows PC and create shortcut to desktop.


param( [switch]$NoFreshBuild )


# -------- Check for administator privilege --------

$IsAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Administrator privilege required" -ForegroundColor Red
    Write-Host "Please run this script as administrator" -ForegroundColor Yellow
    exit 1
}


# -------- Declare fixed directory paths --------

$ProjectRoot = Split-Path "$PSScriptRoot"
$InstallDir = Join-Path $([Environment]::GetFolderPath("ProgramFiles")) "MyFileServer"


# -------- Prepare installation directory --------

Write-Host "`nPreparing installation directory"
$UpdateExistingInstallation = Test-Path "$InstallDir"

if ($UpdateExistingInstallation) {
    Write-Host "Updating the existing installation" -ForegroundColor Yellow
    
    Get-ChildItem -Path "$InstallDir" -Force |
    Where-Object { $_.Name -notin '.venv', 'tools' } |
    Remove-Item -Recurse -Force
}
else {
    Write-Host "Creating new install directory"
    New-Item -ItemType Directory "$InstallDir" | Out-Null

    Write-Host "Downloading uv tools"
    $env:UV_INSTALL_DIR = Join-Path "$InstallDir" "tools";
    $env:UV_NO_MODIFY_PATH = "1"; 
    powershell.exe -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
}

$UvExe = Join-Path "$InstallDir" "tools\uv.exe"
if (-not (Test-Path "$UvExe")) {
    Write-Host "Downloading tools failed" -ForegroundColor Red
    exit 1
}
Unblock-File "$UvExe"


# -------- Preparing frontend build --------

Write-Host "`nPreparing frontend build"

if (-not $NoFreshBuild) {
    Write-Host "Building fresh frontend dist"
    Set-Location -Path "$ProjectRoot\frontend" | Out-Null
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        if (-not (Test-Path "node_modules")) {
            npm ci
        }
        npm run build
    } 
}
else {
    Write-Host "Using bundled frontend dist"
}

if (-not (Test-Path "$ProjectRoot\frontend\dist")) {
    Write-Host "Frontend build not found" -ForegroundColor Red
    exit 1
}


# -------- Copying required backend files --------

Write-Host "`nCopying the required files"
Set-Location -Path "$ProjectRoot" | Out-Null

New-Item -ItemType Directory "$InstallDir\services" | Out-Null
Copy-Item -Path "$ProjectRoot\README.md" -Destination "$InstallDir" -Force
Copy-Item -Path "$ProjectRoot\frontend\dist" -Destination "$InstallDir\public" -Recurse -Force
Copy-Item -Path "$ProjectRoot\backend\services\*.py" -Destination "$InstallDir\services" -Recurse -Force
Copy-Item -Path "$ProjectRoot\backend\server.py" -Destination "$InstallDir" -Force
Copy-Item -Path "$ProjectRoot\backend\tone.mp3" -Destination "$InstallDir" -Force
Copy-Item -Path "$ProjectRoot\backend\pyproject.toml" -Destination "$InstallDir" -Force
Copy-Item -Path "$ProjectRoot\backend\uv.lock" -Destination "$InstallDir" -Force
Copy-Item -Path "$ProjectRoot\scripts\uninstall.ps1" -Destination "$InstallDir" -Force


# -------- Syncing uv dependencies --------

Write-Host "`nSyncing uv dependencies"
Set-Location -Path "$InstallDir" | Out-Null

& $UvExe sync --no-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency syncing failed" -ForegroundColor Red
    exit 1
}


# -------- Creating the desktop shortcut --------

Write-Host "`nCreating the desktop shortcut"
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

Write-Host "`nRegistering MyFileServer to Windows OS"

$PackageJson = Join-Path "$ProjectRoot" "frontend\package.json"
$Version = (Get-Content "$PackageJson" | ConvertFrom-Json).version

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


# -------- Installation completed successfully --------

Write-Host "`nMyFileServer installed successfully" -ForegroundColor Green