import os
import ctypes

from mimetypes import guess_type

from services.environment import IS_DEV_ENV, IS_WIN_OS, USER_HOME, PROTECTED_PATHS


# To ensure that '//' do not appear in any path
def joiner(path: str, item_name: str) -> str:
    while path.endswith('/'):
        path = path[:-1]
    return f'{path}/{item_name}'


# To represent Internal Storage as IS: in Pydroid-3
def format_path(path: str) -> str:
    return path if IS_WIN_OS else path.replace(USER_HOME, 'IS:')


# To check if any item belongs to protected paths
def is_protected_path(path: str) -> bool:
    return any((path.startswith(p) for p in PROTECTED_PATHS))


# To check if any resource exists in public folder or not
def is_public_resource(resource: str) -> bool:
    return not IS_DEV_ENV and os.path.isfile('./public/' + resource)


# To take or release the screen lock for the main server thread
def keep_screen_awake(lock: bool):
    if IS_WIN_OS:
        state = 0x80000003 if lock else 0x80000000
        ctypes.windll.kernel32.SetThreadExecutionState(state)


# To guess the mime-type of a file for streaming/downloading
def get_mime_type(file_path: str) -> str:
    guess = guess_type(file_path)[0]

    # Return most generic mime-type from the guessed ones
    if guess is not None:
        if guess.startswith('text/'):
            return 'text/plain'
        if guess.startswith('audio/'):
            return 'audio/mpeg'
        if guess.startswith('video/'):
            return 'video/mp4'
        if guess.startswith('image/'):
            return guess
        if guess.startswith('application/'):
            return guess

    # Return most generic mime-type from custom file extention map
    if file_path.count('.') > 0:
        extention = file_path.split('.')[-1].lower()

        audio_extentions = {'flac', 'm4a'}
        image_extentions = {'heic', 'heif'}
        video_extentions = {'mkv', 'webm', 'avi', 'mov'}
        text_extentions = {
            'cfg', 'ini', 'env', 'log', 'md', 'yaml', 'yml', 'toml',
            'sql', 'properties', 'lock', 'rs', 'go', 'dart',
            'ts', 'tsx', 'jsx', 'vue', 'cjs', 'cmd', 'ps1',
            'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp',
            'db', 'sqlite', 'sqlite3', 'pkl', 'dat',
            'cer', 'crt', 'pem', 'key', 'ics', 'vcf',
            'py', 'java', 'js', 'c', 'cpp'
        }

        if extention in text_extentions:
            return 'text/plain'
        if extention in image_extentions:
            return 'image/jpeg'
        if extention in audio_extentions:
            return 'audio/mpeg'
        if extention in video_extentions:
            return 'video/mp4'

    # Fallback to download if not possible to stream the file
    return 'application/octet-stream'
