import os
import ctypes
import platform

from shutil import disk_usage
from mimetypes import guess_type
from stat import FILE_ATTRIBUTE_HIDDEN
from services.thumbnails import get_cached_thumbnail

from flask import request
from pyperclip import paste, PyperclipException


root = '/storage/emulated/0'  # Android's Internal Storage
IS_WIN_OS = platform.system() == 'Windows'

if IS_WIN_OS:
    username = os.getenv('USERNAME') or os.getenv('USER')
    root = os.getenv('USERPROFILE') or f'C:/{username}'
    if not os.path.exists(root):
        print('Warning: root path not found')
        root = '.'
    else:
        root = root.replace('\\', '/')

total_size_cache: dict[str, int] = dict()


# To ensure that '//' do not appear in any path
def joiner(path: str, item_name: str) -> str:
    while path.endswith('/'):
        path = path[:-1]
    return f'{path}/{item_name}'


def formatPath(path: str) -> str:
    return path if IS_WIN_OS else path.replace(root, 'IS:')


# Returns the path of Downloads folder to save the uploaded files
def getSavePath() -> str:
    savepath = root + ('/Downloads' if IS_WIN_OS else '/Download')
    os.makedirs(savepath, exist_ok=True)
    return savepath


# Keeps only the existing items from the recieved set of shortcuts
def filter_existing_shortcuts() -> dict | None:
    shortcuts: dict | None = request.get_json()
    if shortcuts is None:
        return None
    folders = list(filter(lambda folder: os.path.isdir(folder.get('path', '')), shortcuts.get('folders', [])))
    files = list(filter(lambda file: os.path.isfile(file.get('path', '')), shortcuts.get('files', [])))
    for file in files:
        file['thumbnail'] = get_cached_thumbnail(file['path'])
    return {'folders': folders, 'files': files}


# To get the items info copied in clipboard
def get_clipboard_info() -> dict:
    show_hidden = request.args.get('show_hidden', 'false').lower() == 'true'
    content: str | dict | None = None

    try:
        content = paste()
        if content is None or content.strip() == '':
            raise PyperclipException

        if os.path.exists(content) or content.count('"') > 0:
            folders, files = [], []
            for item in content.strip().split('"'):
                item_path = item.strip().replace('\\', '/')
                if item_path == '' or not os.path.exists(item_path):
                    continue

                if os.path.isdir(item_path):
                    folder_info = get_folder_info(item_path, show_hidden)
                    if folder_info and (show_hidden or not folder_info.get('hidden')):
                        folders.append(folder_info)
                elif os.path.isfile(item_path):
                    file_info = get_file_info(item_path)
                    if file_info and (show_hidden or not file_info.get('hidden')):
                        files.append(file_info)

            if folders or files:
                content = {'folders': folders, 'files': files}
                return {'type': 'items', 'content': content}
    except PyperclipException:
        return {'type': 'error', 'content': content}

    return {'type': 'text', 'content': content}


# Works on Windows platform only
def get_drive_label(drive_letter: str) -> str:
    drive_label_buffer = ctypes.create_unicode_buffer(1024)

    result = ctypes.windll.kernel32.GetVolumeInformationW(
        ctypes.c_wchar_p(drive_letter),
        drive_label_buffer,
        ctypes.sizeof(drive_label_buffer), None, None, None, None, 0)

    if result and drive_label_buffer.value:
        return drive_label_buffer.value

    return f"{drive_letter}:"


def is_item_hidden(item_path: str, item_name: str) -> bool:
    try:
        marked_hidden = item_name != '' and item_name[0] in '.$'
        actual_hidden = IS_WIN_OS and bool(os.stat(item_path).st_file_attributes & FILE_ATTRIBUTE_HIDDEN)
        return marked_hidden or actual_hidden
    except AttributeError:
        print('Attribute Error:', item_path)
        return marked_hidden


# To get sub-items (folders, files) count of given folder
def get_items_count(item_path: str, show_hidden: bool):
    folder_count, file_count = 0, 0

    for sub_item_name in os.listdir(item_path):
        sub_item_path = joiner(item_path, sub_item_name)
        is_hidden = is_item_hidden(sub_item_path, sub_item_name)
        if not is_hidden or show_hidden:
            if os.path.isdir(sub_item_path):
                folder_count += 1
            elif os.path.isfile(sub_item_path):
                file_count += 1

    return folder_count, file_count


# To get the total size in bytes of the given list of folders
def get_total_size(folders: list[str]) -> int:
    total_size = 0
    for folder in folders:
        folder_size = 0
        if folder in total_size_cache:
            total_size += total_size_cache[folder]
            continue
        for root, _, files in os.walk(folder):
            root_path = root.replace('\\', '/')
            if root_path in total_size_cache:
                folder_size += total_size_cache[root_path]
                continue
            for file in files:
                try:
                    folder_size += os.path.getsize(joiner(root, file))
                except PermissionError:
                    continue
        total_size_cache[folder] = folder_size
        total_size += folder_size
    return total_size


# Performs recursive search in all the sub-folders at given root-path
def deep_search(query: str, root: str):
    for path, folders, files in os.walk(root):
        for item in folders + files:
            if query in item.lower():
                yield joiner(path.replace("\\", "/"), item)


def get_device_info() -> dict:
    if IS_WIN_OS:
        return {'hostname': platform.node(), 'platform': 'Windows'}
    return {'hostname': 'Pydroid-3', 'platform': 'Android'}


# To get info about storage/disk drives/partitions depending on platform
def get_drives_info() -> list:
    drives_info = []

    if not IS_WIN_OS:
        total, used, free = disk_usage(root)
        drives_info.append({
            'letter': None, 'label': 'Internal Storage', 'path': root,
            'size': {'total': total, 'used': used, 'free': free}
        })
        return drives_info

    for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        path = f'{letter}:/'
        if not os.path.exists(path):
            continue
        label = get_drive_label(path)
        total, used, free = disk_usage(path)
        drives_info.append({
            'letter': letter, 'label': label, 'path': path,
            'size': {'total': total, 'used': used, 'free': free}
        })
    return drives_info


def get_folder_info(folder_path: str, show_hidden: bool) -> dict | None:
    try:
        folder_info = dict()
        folder_info['path'] = folder_path
        folder_info['name'] = folder_path.split('/')[-1]
        folder_info['hidden'] = is_item_hidden(folder_path, folder_info['name'])
        folder_info['count'] = get_items_count(folder_path, show_hidden)
        folder_info['date'] = int(os.path.getctime(folder_path) * 1000)
        return folder_info
    except PermissionError:
        print('Access Denied:', folder_path)
        return None


def get_file_info(file_path: str) -> dict | None:
    try:
        file_info = dict()
        file_info['path'] = file_path
        file_info['name'] = file_path.split('/')[-1]
        file_info['hidden'] = is_item_hidden(file_path, file_info['name'])
        file_info['size'] = os.path.getsize(file_path)
        file_info['date'] = round(os.path.getmtime(file_path) * 1000)
        file_info['thumbnail'] = get_cached_thumbnail(file_path)
        file_info['mimetype'] = get_mime_type(file_path)
        return file_info
    except PermissionError:
        print('Access Denied:', file_path)
        return None


# To get info about sub-items inside the given folder-path
def get_items_info(path: str):
    search = request.args.get('search', None)
    sort_by = request.args.get('sort_by', 'name')
    reverse = request.args.get('reverse', 'false').lower() == 'true'
    show_hidden = request.args.get('show_hidden', 'false').lower() == 'true'
    files, folders = [], []

    # Not allowed to explore the items inside the project folder
    if path.startswith(os.getcwd().replace('\\', '/')):
        return folders, files

    # Only filtered items will be considered if the search query is provided
    if not search:
        items = map(lambda i: joiner(path, i), os.listdir(path))
    else:
        items = deep_search(search.lower().strip(), path)

    # Skip appending if permission error or item is hidden when not show-hidden
    for item_path in items:
        if os.path.isdir(item_path):
            folder_info = get_folder_info(item_path, show_hidden)
            if folder_info and (show_hidden or not folder_info.get('hidden')):
                folders.append(folder_info)
        elif os.path.isfile(item_path):
            file_info = get_file_info(item_path)
            if file_info and (show_hidden or not file_info.get('hidden')):
                files.append(file_info)

    # Sorting folders and files saperately depending on the given sort_by key
    if sort_by == 'type':
        folders.sort(key=lambda x: x['name'], reverse=reverse)
        files.sort(key=lambda x: x['name'].split('.')[-1], reverse=reverse)
    elif sort_by == 'size':
        folders.sort(key=lambda x: sum(x['count']), reverse=reverse)
        files.sort(key=lambda x: x['size'], reverse=reverse)
    else:
        folders.sort(key=lambda x: x[sort_by], reverse=reverse)
        files.sort(key=lambda x: x[sort_by], reverse=reverse)

    return folders, files


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
            'cer', 'crt', 'pem', 'key', 'ics', 'vcf'
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
