# -------- Step 1: Check MyFileServer folder exists or not --------


$AppName = "MyFileServer"

# Folder where installer.ps1 is located
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Expected packaged folder (project root)
$PackageDir = Join-Path $RootDir $AppName

if (-not (Test-Path $PackageDir)) {
    Write-Host "MyFileServer folder not found. Running package.sh..."

    # Check if Git Bash exists

    # Try common Git Bash locations
    $GitBashPaths = @(
        "C:\Program Files\Git\bin\bash.exe",
        "C:\Program Files\Git\usr\bin\bash.exe",
        "C:\Program Files (x86)\Git\bin\bash.exe",
        "C:\Program Files (x86)\Git\usr\bin\bash.exe"
    )

    $BashExe = $GitBashPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $BashExe) {
        Write-Error "Git Bash not found. Please install Git for Windows."
        exit 1
    }

    # Run package.sh to generate MyFileServer folder
    & $BashExe (Join-Path $RootDir "package.sh")

    # Verify again
    if (-not (Test-Path $PackageDir)) {
        Write-Error "Packaging failed. MyFileServer folder was not created."
        exit 1
    }
}
else {
    Write-Host "MyFileServer folder already exists."
}


# -------- Step 2: Copy uv files and Move MyFileServer to User's location --------


# Paths
$ProjectRoot = Get-Location
$SourceDir = Join-Path $ProjectRoot "backend"
$TargetDir = Join-Path $ProjectRoot "MyFileServer"

$ProjectToml = Join-Path $SourceDir "pyproject.toml"
$UvLock = Join-Path $SourceDir "uv.lock"

# Copy files
Copy-Item $ProjectToml -Destination $TargetDir -Force
Copy-Item $UvLock -Destination $TargetDir -Force

# Define source and destination
$SourceDir = Join-Path $PSScriptRoot "MyFileServer"
$UserHome  = [Environment]::GetFolderPath("UserProfile")
$TargetDir = Join-Path $UserHome "MyFileServer"

# Replace existing MyFileServer in user directory
if (Test-Path $TargetDir) {
    Write-Host "Existing MyFileServer found in user directory. Removing it..."
    Remove-Item -Path $TargetDir -Recurse -Force
}

Write-Host "Moving MyFileServer to $TargetDir"
Move-Item -Path $SourceDir -Destination $TargetDir


# -------- Step 3: Install uv globally if needed and generate .venv --------


# Ensure uv is installed
$UvCmd = Get-Command uv -ErrorAction SilentlyContinue

if (-not $UvCmd) {
    Write-Host "uv not found. Installing uv using global Python..."

    $PythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if (-not $PythonCmd) {
        Write-Error "Python is not installed or not available in PATH."
        exit 1
    }

    pip install uv
}

# Run uv sync --no-dev inside MyFileServer
Write-Host "Running uv sync --no-dev..."

Push-Location $TargetDir
uv sync --no-dev
Pop-Location


# -------- Step 4: Create desktop shortcut for "uv run server.py" --------


# Paths
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MyFileServer.lnk"

$UserHome  = [Environment]::GetFolderPath("UserProfile")
$TargetDir = Join-Path $UserHome "MyFileServer"

$IconPath = Join-Path $TargetDir "public\favicon.ico"

# Create shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath = "uv"
$Shortcut.Arguments  = "run server.py"
$Shortcut.WorkingDirectory = $TargetDir
$Shortcut.IconLocation = $IconPath

$Shortcut.Save()
