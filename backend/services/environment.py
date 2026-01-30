import os
import platform


# Identify if the current environment is DEV or PROD
IS_DEV_ENV = all(map(os.path.exists, ('../backend', '../frontend', '../scripts')))

# Identify if the current platform is Windows or Linux (Pydroid-3)
IS_WIN_OS = platform.system() == 'Windows'

# Identify hostname of the current machine
HOST_NAME = platform.node() if IS_WIN_OS else 'Pydroid-3'

# Project's absolute root path (location of server.py launch file)
PROJECT_ROOT = os.path.abspath('.').replace('\\', '/')

# User's home and downloads directory paths
if IS_WIN_OS:       # For Windows (DEV and PROD)
    USER_HOME = os.path.expanduser('~').replace('\\', '/')
    USER_DOWNLOADS = USER_HOME + '/Downloads'
else:               # For Pydorid-3 (PROD)
    USER_HOME = '/storage/emulated/0'
    USER_DOWNLOADS = USER_HOME + '/Download'

# Initialise resouces path variables depending on ENV and OS
if IS_DEV_ENV or not IS_WIN_OS:      # For DEV (on Windows) and PROD (on Pydroid-3)
    THUMBNAILS_DIR = PROJECT_ROOT + '/thumbnails'
    TOKENS_DIR = PROJECT_ROOT
else:                                # For PROD (on Windows)
    # Location to store generated thumbnails cache
    local_app_data = os.getenv('LOCALAPPDATA')
    if local_app_data is None:
        THUMBNAILS_DIR = USER_HOME + '/AppData/Local/MyFileServer/thumbnails'
    else:
        THUMBNAILS_DIR = local_app_data.replace('\\', '/') + '/MyFileServer/thumbnails'
    # Location to store user authentication tokens
    roaming_app_data = os.getenv('APPDATA')
    if roaming_app_data is None:
        TOKENS_DIR = USER_HOME + '/AppData/Roaming/MyFileServer'
    else:
        TOKENS_DIR = roaming_app_data.replace('\\', '/') + '/MyFileServer'

# Finalize all path to make sure they exists in file system
for path in (USER_DOWNLOADS, THUMBNAILS_DIR, TOKENS_DIR):
    os.makedirs(path, exist_ok=True)
