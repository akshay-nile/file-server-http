# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in Windows PC and send its launch shortcut to the Desktop.

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


# -------- Step 1) Run uninstaller and packager to generate MyFileServer core package --------

Write-Host "`nStep 1) Running packager to generate MyFileServer core"
& .\package.ps1


# -------- Step 2) Copy required backend files to MyFileServer core --------

Write-Host "`nStep 2) Copying required backend files to MyFileServer core"
Copy-Item -Path "backend\tone.mp3" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\pyproject.toml" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\uv.lock" -Destination "MyFileServer" -Force
Copy-Item -Path "scripts\uninstall.ps1" -Destination "MyFileServer" -Force


# -------- Step 3) Move/Replace the MyFileServer to Program Files --------

Write-Host "`nStep 3) Moving/Replacing MyFileServer core to Program Files"
$ProgramFiles = [Environment]::GetFolderPath("ProgramFiles")
$MyFileServer = Join-Path $ProgramFiles "MyFileServer"
$UpdatingOldInstallation = $false
if (Test-Path $MyFileServer) {
    Write-Host "`nUpdating the existing installation" -ForegroundColor Yellow
    Copy-Item -Path "$MyFileServer\.venv" -Destination "MyFileServer\.venv" -Recurse -Force
    Copy-Item -Path "$MyFileServer\tools" -Destination "MyFileServer\tools" -Recurse -Force
    Remove-Item $MyFileServer -Recurse -Force
    $UpdatingOldInstallation = $true
}
Move-Item -Path "MyFileServer" -Destination $ProgramFiles -Force


# -------- Step 4) Download tools and sync project dependencies --------

if (-not $UpdatingOldInstallation) {
    Write-Host "`nStep 4) Downloading tools and syncing uv dependencies"
    $env:UV_INSTALL_DIR = Join-Path $MyFileServer "tools";
    $env:UV_NO_MODIFY_PATH = "1"; 
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
}

$UvExe = Join-Path $MyFileServer "tools\uv.exe"
if (-not (Test-Path $UvExe)) {
    Write-Host "`nDownloading tools failed" -ForegroundColor Red
    exit 1
}

Unblock-File $UvExe
Set-Location $MyFileServer
& $UvExe sync --no-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency syncing failed" -ForegroundColor Red
    exit 1
}


# -------- Step 5) Creating desktop shortcut of MyFileServer --------

Write-Host "`nStep 5) Creating the Desktop Shortcut"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MyFileServer.lnk"
$IconPath = Join-Path $MyFileServer "public\favicon.ico"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $UvExe
$Shortcut.Arguments = "run server.py"
$Shortcut.WorkingDirectory = $MyFileServer
$Shortcut.IconLocation = $IconPath
$Shortcut.Save()


# -------- Step 6) Registering MyFileServer to Windows OS --------

Write-Host "`nStep 6) Registering MyFileServer to Windows OS"
$Version = (Get-Content "$PSScriptRoot\..\frontend\package.json" | ConvertFrom-Json).version
$UninstallScript = Join-Path $MyFileServer "uninstall.ps1"
$UninstallCommand = "powershell.exe -ExecutionPolicy Bypass -File `"$UninstallScript`""

$RegPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\MyFileServer"
New-Item -Path $RegPath -Force | Out-Null

Set-ItemProperty $RegPath DisplayName "MyFileServer"
Set-ItemProperty $RegPath DisplayVersion $Version
Set-ItemProperty $RegPath Publisher "Akshay Nile"
Set-ItemProperty $RegPath InstallLocation $MyFileServer
Set-ItemProperty $RegPath UninstallString $UninstallCommand
Set-ItemProperty $RegPath DisplayIcon $IconPath
Set-ItemProperty $RegPath NoModify 1
Set-ItemProperty $RegPath NoRepair 1

Write-Host "`nMyFileServer Installed Successfully" -ForegroundColor Green