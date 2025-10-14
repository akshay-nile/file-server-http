import os
import random
import string

from functools import wraps
from flask import abort, request


browsers: set[str] = set()
unique_code: str | None = None

if os.path.isfile('.browsers'):
    with open('.browsers', 'rt') as file:
        lines = file.read().split('\n')
        striped = map(lambda b: b.strip(), lines)
        filtered = filter(lambda b: len(b) == 4, striped)
        browsers = set(filtered)
else:
    open('.browsers', 'wt').close()


def generate_unique_code() -> str:
    global unique_code
    if unique_code is None:
        chars = string.ascii_uppercase + string.digits
        unique_code = ''.join(random.choices(chars, k=4))
    return unique_code


def verify_unique_code(user_code) -> bool:
    global unique_code
    if unique_code and user_code == unique_code:
        browsers.add(unique_code)
        with open('.browsers', 'wt') as file:
            file.write('\n'.join(browsers))
        unique_code = None
        return True
    return False


def require_authentication(f):
    @wraps(f)
    def authenticate_browser(*args, **kwargs):
        browser_id = request.headers.get("X-Browser-ID")
        if not browser_id:
            abort(400, 'Missing Request Header: X-Browser-ID')
        if browser_id not in browsers:
            abort(401, 'Unauthorized Browser ID: ' + browser_id)
        return f(*args, **kwargs)
    return authenticate_browser
