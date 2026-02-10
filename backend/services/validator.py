import os

from functools import wraps
from pydoc import describe
from urllib.parse import unquote

from services.explorer import is_protected_path

from flask import request, abort


def validate_path(path_type: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            encoded_path = request.args.get('path', None)

            if not encoded_path:
                abort(400, description=f"Invalid Path: {encoded_path}")

            path = unquote(encoded_path).replace('\\', '/')

            if path == '/':     # Path '/' indicates root or top-most level
                kwargs['path'] = path
                return func(*args, **kwargs)

            elif is_protected_path(path):
                abort(403, description=f"Protected Path: '{path}'")

            elif path_type == 'item':
                if not os.path.exists(path):
                    abort(404, description=f"Item Not Found: '{path}'")

            elif path_type == 'folder':
                if not os.path.isdir(path):
                    abort(404, description=f"Folder Not Found: '{path}'")

            elif path_type == 'file':
                if not os.path.isfile(path):
                    abort(404, description=f"File Not Found: '{path}'")

            else:
                raise TypeError(f"Invalid Argument path_type: {path_type}")

            kwargs['path'] = path
            return func(*args, **kwargs)
        return wrapper
    return decorator
