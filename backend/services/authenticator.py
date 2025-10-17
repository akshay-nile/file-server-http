import os
import random
import string

from functools import wraps
from services.network import is_stream_request_from_vlc_on_same_network

from flask import abort, request


filename = '.verified'
verified: set[str] = set()
unique_code: str | None = None

if os.path.isfile(filename):
    with open(filename, 'rt') as file:
        lines = file.read().split('\n')
        striped = map(lambda b: b.strip(), lines)
        filtered = filter(lambda b: len(b) == 4, striped)
        verified = set(filtered)
else:
    open(filename, 'wt').close()


def generate_unique_code() -> str:
    global unique_code
    if unique_code is None:
        chars = string.ascii_uppercase + string.digits
        unique_code = ''.join(random.choices(chars, k=4))
    return unique_code


def verify_user_code(user_code: str) -> bool:
    global unique_code
    if unique_code and user_code == unique_code:
        verified.add(unique_code)
        with open(filename, 'wt') as file:
            file.write('\n'.join(verified))
        unique_code = None
        return True
    return False


def require_authentication(f):
    @wraps(f)
    def authenticate(*args, **kwargs):
        if is_stream_request_from_vlc_on_same_network():
            return f(*args, **kwargs)
        verification_code = request.headers.get("X-Verification-Code")
        if not verification_code:
            abort(400, 'Missing Request Header: X-Verification-Code')
        if verification_code not in verified:
            abort(401, 'Unauthentic Verification Code: ' + verification_code)
        return f(*args, **kwargs)
    return authenticate
