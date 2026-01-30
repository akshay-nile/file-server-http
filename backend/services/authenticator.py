import os
import random
import string

from functools import wraps
from services.environment import TOKENS_DIR

from flask import abort, request


filename = TOKENS_DIR + '/.tokens'
tokens: set[str] = set()
token: str | None = None

if os.path.isfile(filename):
    with open(filename, 'rt') as file:
        lines = file.read().split('\n')
        striped = map(lambda b: b.strip(), lines)
        filtered = filter(lambda b: len(b) == 4, striped)
        tokens = set(filtered)
else:
    open(filename, 'wt').close()


def generate_unique_token() -> str:
    global token
    if token is None:
        chars = string.ascii_uppercase + string.digits
        token = ''.join(random.choices(chars, k=4))
    return token


def verify_user_token(user_token: str) -> bool:
    global token
    if token and user_token == token:
        tokens.add(token)
        with open(filename, 'wt') as file:
            file.write('\n'.join(tokens))
        token = None
        return True
    return False


def require_authentication(f):
    @wraps(f)
    def authenticate(*args, **kwargs):
        token = request.headers.get('X-Token') or request.args.get('token')

        if not token:
            abort(400, 'Missing Token')

        if token not in tokens:
            abort(401, 'Unauthentic Token: ' + token)

        return f(*args, **kwargs)
    return authenticate
