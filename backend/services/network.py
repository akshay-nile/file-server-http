import os
import socket
import threading
import subprocess

from services.explorer import get_file_info
from services.environment import IS_WIN_OS

from flask import Response, request, abort
from requests import get, post, RequestException


mid_line_printed = False


def print_mid_line():
    global mid_line_printed
    if mid_line_printed:
        print()
    else:
        mid_line_printed = True


def get_local_ip():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(('8.8.8.8', 80))
        ip = sock.getsockname()[0]
        if not ip.startswith('192.168.'):
            print('Not connected to WiFi')
    except OSError:
        ip = None
    finally:
        sock.close()
    return ip


def get_public_ip():
    try:
        ip = get('https://ifconfig.me', timeout=5).text
        if ip.count('.') != 3:
            ip = f'[{ip}]'
    except RequestException:
        ip = None
        print('Not connected to Internet')
    return ip


def get_user_selection():
    text = input('Run server on Public IP (Yes/No): ').lower().strip()

    # Entering Yes, yes, or simply y will get public ip
    if text.startswith('y'):
        ip = get_public_ip()
    # Entering No, no, n or simply nothing will get local ip
    elif text.startswith('n') or not text:
        ip = get_local_ip()
    else:                   # Otherwise use the localhost ip
        ip = '127.0.0.1'

    if ip is None:
        exit()
    print()     # Extra blank line to saperate the server logs

    return ip


def publish_server_address(server_address: str):
    def publisher():
        try:
            pythonanywhere = 'https://akshaynile.pythonanywhere.com/publish?socket='
            status = post(pythonanywhere + server_address, timeout=5).text
            if status == 'success':
                print(' * Socket publication was successful ✅')
        except RequestException:
            print(' * Socket publication attempt failed ❌')
        print_mid_line()
    threading.Thread(target=publisher).start()


def check_for_update():
    def updator():
        try:
            github = 'https://github.com/akshay-nile/file-server-http/raw/master/README.md'
            remote = get(github, timeout=5).text.splitlines()[0].strip()
            with open('README.md', encoding='utf-8') as file:
                local = file.read().splitlines()[0].strip()
            if (remote != local):
                print(' * Updated version is available ⚠️')
                if IS_WIN_OS:
                    subprocess.Popen([
                        "powershell.exe",
                        "-NoProfile",
                        "-Command",
                        (
                            "Start-Process powershell.exe "
                            "-Verb RunAs "
                            "-ArgumentList "
                            "'-ExecutionPolicy Bypass -Command "
                            "irm https://github.com/akshay-nile/file-server-http/raw/master/scripts/remote.ps1 | iex'"
                        )
                    ])
                    os._exit(0)
        except Exception as e:
            print(' * Failed to check for the update ❌')
        print_mid_line()
    threading.Thread(target=updator).start()


def is_socket_available(host: str, port: int) -> bool:
    socket_family = socket.AF_INET
    if host.startswith('[') and host.endswith(']'):
        socket_family = socket.AF_INET6
        host = host[1:-1]
    with socket.socket(socket_family, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) != 0


def chunk_generator(filepath: str, start: int, end: int):
    chunk_size = 1024 * 1024
    with open(filepath, 'rb') as file:
        file.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            read_size = min(chunk_size, remaining)
            chunk = file.read(read_size)
            if not chunk:
                break
            yield chunk
            remaining -= len(chunk)


def get_stream_or_download_response(filepath: str, stream=True) -> Response:
    # Get file information like name, size and mime-type
    file_info = get_file_info(filepath)
    if file_info is None:
        abort(403, description="Access Denied: " + filepath)

    # Set default start-end pointers and status-code
    start, end = 0, file_info['size'] - 1
    status = 200

    # Parse Range header and update pointers and status-code
    range_header = request.headers.get('Range')
    if range_header:
        range_values = range_header.replace('bytes=', '').split('-')
        if range_values[0]:
            start = int(range_values[0])
        if range_values[1]:
            end = int(range_values[1])
        status = 206

    # Create a direct_passthrough response object
    response = Response(
        chunk_generator(filepath, start, end),
        status=status,
        mimetype=file_info['mimetype'] if stream else 'application/octet-stream',
        direct_passthrough=True
    )

    # Set common headers for both status-codes 200 and 206
    response.headers.set('Content-Length', end - start + 1)
    response.headers.set('Accept-Ranges', 'bytes')

    # Set Content-Range if Range header from client is respected
    if status == 206:
        response.headers.set('Content-Range', f"bytes {start}-{end}/{file_info['size']}")
        response.headers.set('Cache-Control', 'no-cache')

    # Set Content-Disposition with quoted filename
    disposition = 'inline' if stream else 'attachment'
    response.headers.set('Content-Disposition', f'{disposition}; filename="{file_info["name"]}"')

    return response
