# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in User Home and send its shortcut to the Desktop.

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


# -------- Step 1) Run uninstaller and packager to generate a fresh MyFileServer --------

Write-Host "`nStep 1) Running Uninstaller and Packager"
& .\uninstall.ps1
Set-Location "scripts"
& .\package.ps1


# -------- Step 2) Copy required files and move MyFileServer to Program Files --------

Write-Host "`nStep 2) Copying uv files and moving MyFileServer to Program Files"
Copy-Item -Path "backend\pyproject.toml" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\uv.lock" -Destination "MyFileServer" -Force
Copy-Item -Path "scripts\uninstall.ps1" -Destination "MyFileServer" -Force

$ProgramFiles = [Environment]::GetFolderPath("ProgramFiles")
Move-Item -Path "MyFileServer" -Destination $ProgramFiles


# -------- Step 3) Download tools and sync project dependencies --------

Write-Host "`nStep 3) Downloading tools and syncing uv dependencies"
$MyFileServer = Join-Path $ProgramFiles "MyFileServer"

$env:UV_INSTALL_DIR = Join-Path $MyFileServer "tools";
$env:UV_NO_MODIFY_PATH = "1"; 
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

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


# -------- Step 4) Creating desktop shortcut of MyFileServer --------

Write-Host "`nStep 4) Creating Desktop Shortcut"
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


# -------- Step 5) Registering MyFileServer to Windows OS --------

Write-Host "`nStep 5) Registering MyFileServer to Windows OS"
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