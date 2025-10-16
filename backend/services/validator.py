import os
from functools import wraps
from urllib.parse import unquote
from flask import request, abort


def validate_path(path_type: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            encoded_path = request.args.get('path', None)

            if not encoded_path:
                abort(400, description="path query-param is missing/empty/null")

            path = unquote(encoded_path).replace('\\', '/')

            if path == '/':     # This path '/' indicates root or top-most level
                kwargs['path'] = path
                return func(*args, **kwargs)

            elif path_type == 'item':
                if not os.path.exists(path):
                    abort(404, description=f"invalid item path: '{path}'")

            elif path_type == 'folder':
                if not os.path.isdir(path):
                    abort(404, description=f"invalid folder path: '{path}'")

            elif path_type == 'file':
                if not os.path.isfile(path):
                    abort(404, description=f"invalid file path: '{path}'")

            else:
                raise Exception(f"invalid path_type argument: {path_type}")

            kwargs['path'] = path
            return func(*args, **kwargs)
        return wrapper
    return decorator
