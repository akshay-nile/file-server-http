import os
from functools import wraps
import platform
from flask import request, abort
from urllib.parse import unquote


def validate_path(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        encoded_path = request.args.get('path', None)

        if not encoded_path:
            abort(400, description="path query-param is missing/empty/null")

        path = unquote(encoded_path).replace('\\', '/')

        if path == '/':     # This path '/' indicates root or top-most level
            kwargs['path'] = path
            return func(*args, **kwargs)

        while path.endswith('/'):  # Remove any trailing forward slash '/' from path
            path = path[:-1]

        if not os.path.exists(path):
            abort(404, description=f"no item found at path: {path}")

        kwargs['path'] = path
        return func(*args, **kwargs)
    return wrapper
