# -------- DESCRIPTION --------
# This script automates the process of uninstalling MyFileServer
# and all its components from the project root, user home/desktop


# Step 1) Remove MyFileServer from project root

Set-Location ".."
if (Test-Path "MyFileServer") {
    Remove-Item "MyFileServer" -Recurse -Force
    Write-Host "`nRemoved from Project Root"
}


# Step 2) Remove MyFileServer from User directory

$UserHome   = [Environment]::GetFolderPath("UserProfile")
$TargetDir  = Join-Path $UserHome "MyFileServer"
if (Test-Path $TargetDir) {
    Remove-Item $TargetDir -Recurse -Force
    Write-Host "`nRemoved from User Home"
}


# Step 3) Remove desktop shortcut of MyFileServer

$Desktop    = [Environment]::GetFolderPath("Desktop")
$Shortcut   = Join-Path $Desktop "MyFileServer.lnk"
if (Test-Path $Shortcut) {
    Remove-Item -Path $Shortcut -Force
    Write-Host "`nRemoved Desktop Shortcut"
} 

Write-Host "`nSuccessfully Uninstalled MyFileServer`n" -ForegroundColor Green