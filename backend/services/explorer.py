import os
import ctypes
import platform

from shutil import disk_usage
from stat import FILE_ATTRIBUTE_HIDDEN

from services.thumbnails import get_cached_thumbnail


IS_WIN_OS = platform.system() == 'Windows'


# To ensure that '//' never appear in any path
def joiner(path: str, item_name: str) -> str:
    while path.endswith('/'):
        path = path[:-1]
    return f'{path}/{item_name}'


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
        marked_hidden = item_name[0] in '.$'
        actual_hidden = IS_WIN_OS and bool(os.stat(item_path).st_file_attributes & FILE_ATTRIBUTE_HIDDEN)
        return marked_hidden or actual_hidden
    except AttributeError:
        print('Attribute Error:', item_path)
        return marked_hidden


def get_sub_items_count(item_path: str, show_hidden: bool):
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


# Performs recursive search in all the sub-folders at given root-path
def deep_search(query: str, root: str):
    for path, folders, files in os.walk(root):
        for item in folders + files:
            if query in item.lower():
                yield joiner(path.replace("\\", "/"), item)


def get_device_info() -> dict:
    if IS_WIN_OS:
        return {'hostname': platform.node(), 'platform': 'Windows'}
    return {'hostname': 'Pydroid', 'platform': 'Android'}


# To get info about storage/disk drives/partitions depending on platform
def get_drives_info() -> list:
    drives_info = []

    if not IS_WIN_OS:
        path = '/storage/emulated/0'
        total, used, free = disk_usage(path)
        drives_info.append({
            'letter': None, 'label': 'Internal Storage', 'path': path,
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
        folder_info['size'] = get_sub_items_count(folder_path, show_hidden)
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
        return file_info
    except PermissionError:
        print('Access Denied:', file_path)
        return None


# To get info about folder present at path
def get_items_info(path: str, sort_by='name', reverse=False, show_hidden=False, search=None):
    files, folders = [], []

    # Not allowed to explore the items inside the project folder
    if path.startswith(os.getcwd().replace('\\', '/')):
        return folders, files

    # Only filtered items will be considered if the search query is provided
    if not search:
        items = map(lambda i: joiner(path, i), os.listdir(path))
    else:
        items = deep_search(search.lower().strip(), path)

    # Skip appending if permission error occured or item is hidden when not show-hidden
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
        folders.sort(key=lambda x: sum(x['size']), reverse=reverse)
        files.sort(key=lambda x: os.path.getsize(x['path']), reverse=reverse)
    else:
        folders.sort(key=lambda x: x[sort_by], reverse=reverse)
        files.sort(key=lambda x: x[sort_by], reverse=reverse)

    return folders, files
