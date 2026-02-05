# -------- DESCRIPTION --------
# This script automates the process of installing (or updating) 
# the MyFileServer in Windows PC and create shortcut to desktop.

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


# -------- Run package.ps1 to generate a fresh MyFileServer core --------

Write-Host "`nRunning package.ps1 to generate MyFileServer core"
& .\package.ps1
$ProjectRoot = (Get-Location).Path


# -------- Copy required backend files to MyFileServer core --------

Write-Host "`nCopying required backend files to MyFileServer core"
Copy-Item -Path "backend\tone.mp3" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\pyproject.toml" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\uv.lock" -Destination "MyFileServer" -Force
Copy-Item -Path "scripts\uninstall.ps1" -Destination "MyFileServer" -Force
Write-Host "`nMyFileServer core is ready to install/update"


# -------- Move (or Update) the MyFileServer to Program Files --------

$ProgramFiles = [Environment]::GetFolderPath("ProgramFiles")
$MyFileServer = Join-Path $ProgramFiles "MyFileServer"

if (Test-Path $MyFileServer) {
    Write-Host "`nUpdating the existing installation" -ForegroundColor Yellow

    Get-ChildItem -Path $MyFileServer -Force |
    Where-Object { $_.Name -notin '.venv', 'tools' } |
    Remove-Item -Recurse -Force

    Move-Item -Path "MyFileServer\*" -Destination $MyFileServer -Force
    Remove-Item "MyFileServer" -Recurse -Force
    $UpdatedOldInstallation = $true
}
else {
    Write-Host "`nMoving the MyFileServer core to Program Files"
    Move-Item -Path "MyFileServer" -Destination $ProgramFiles -Recurse -Force
    $UpdatedOldInstallation = $false
}


# -------- Download uv tools and sync project dependencies --------

if (-not $UpdatedOldInstallation) {
    Write-Host "`nDownloading uv tools and syncing project dependencies"
    $env:UV_INSTALL_DIR = Join-Path $MyFileServer "tools";
    $env:UV_NO_MODIFY_PATH = "1"; 
    powershell.exe -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
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
    Write-Host "`nDependency syncing failed" -ForegroundColor Red
    exit 1
}


# -------- Creating the desktop shortcut to launch MyFileServer --------

Write-Host "`nCreating the Desktop Shortcut"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MyFileServer.lnk"
$IconPath = Join-Path $MyFileServer "public\favicon.ico"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $UvExe
$Shortcut.Arguments = "run --no-dev server.py"
$Shortcut.WorkingDirectory = $MyFileServer
$Shortcut.IconLocation = $IconPath
$Shortcut.Save()


# -------- Registering MyFileServer to Windows OS --------

Write-Host "`nRegistering MyFileServer to Windows OS"
$Version = (Get-Content "$ProjectRoot\frontend\package.json" | ConvertFrom-Json).version
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
