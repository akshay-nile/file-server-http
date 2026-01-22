Write-Host "Uninstalling MyFileServer..."

# Paths
$UserHome   = [Environment]::GetFolderPath("UserProfile")
$TargetDir  = Join-Path $UserHome "MyFileServer"

$Desktop    = [Environment]::GetFolderPath("Desktop")
$Shortcut   = Join-Path $Desktop "MyFileServer.lnk"

# Remove MyFileServer folder
if (Test-Path $TargetDir) {
    Write-Host "Removing MyFileServer folder..."
    Remove-Item -Path $TargetDir -Recurse -Force
} else {
    Write-Host "MyFileServer folder not found."
}

# Remove Desktop shortcut
if (Test-Path $Shortcut) {
    Write-Host "Removing Desktop shortcut..."
    Remove-Item -Path $Shortcut -Force
} else {
    Write-Host "Desktop shortcut not found."
}

Write-Host "MyFileServer has been uninstalled successfully!"
