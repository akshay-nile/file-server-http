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


# -------- Step 3) Install uv and sync project dependencies --------

Write-Host "`nStep 3) Installing uv and syncing dependencies"
$MyFileServer = Join-Path $UserHome "MyFileServer"
Set-Location $MyFileServer
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    pip install uv
}
uv sync --no-dev


# -------- Step 4) Creating desktop shortcut of MyFileServer --------

Write-Host "`nStep 4) Creating Desktop Shortcut"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MyFileServer.lnk"
$IconPath = Join-Path $MyFileServer "public\favicon.ico"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "uv"
$Shortcut.Arguments = "run server.py"
$Shortcut.WorkingDirectory = $MyFileServer
$Shortcut.IconLocation = $IconPath
$Shortcut.Save()

Write-Host "`nMyFileServer Installed Successfully" -ForegroundColor Green