# -------- DESCRIPTION --------
# This script automates the process of installing the MyFileServer
# in User Home and send its shortcut to the Desktop.

Set-Location $PSScriptRoot

# -------- Step 1) Run uninstaller and packager to generate a fresh MyFileServer --------

Write-Host "`nStep 1) Running Uninstaller and Packager"
& .\uninstall.ps1
Set-Location "scripts"
& .\package.ps1


# -------- Step 2) Copy uv files and move MyFileServer to User Home --------

Write-Host "`nStep 2) Moving MyFileServer to User Home"
Copy-Item -Path "backend\pyproject.toml" -Destination "MyFileServer" -Force
Copy-Item -Path "backend\uv.lock" -Destination "MyFileServer" -Force
$UserHome = [Environment]::GetFolderPath("UserProfile")
Move-Item -Path "MyFileServer" -Destination $UserHome


# -------- Step 3) Download tools and sync project dependencies --------

Write-Host "`nStep 3) Downloading tools and syncing dependencies"
$MyFileServer = Join-Path $UserHome "MyFileServer"
$env:UV_INSTALL_DIR = Join-Path $MyFileServer "tools";
$env:UV_NO_MODIFY_PATH = "1"; 
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
$UvExe = Join-Path $MyFileServer "tools\uv.exe"
if (-not (Test-Path $UvExe)) {
    Write-Host "`nDownloading tools failed" -ForegroundColor Red
    exit 1
}
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

Write-Host "`nMyFileServer Installed Successfully" -ForegroundColor Green