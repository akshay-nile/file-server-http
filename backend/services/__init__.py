import os
import sys

# Identify (or guess) if the current environment is dev or prod
IS_DEV_ENV = all(map(os.path.exists, ('.venv', 'pyproject.toml', 'uv.lock')))

if not IS_DEV_ENV:
    # Prepend libs abs-path to sys.path to refer to the local libs in prod
    libs_path = os.path.abspath('libs')
    if libs_path not in sys.path:
        sys.path.insert(0, libs_path)


from flask import Flask


def configure_flask_app(app: Flask):
    app.static_folder = os.path.abspath('public')

    if IS_DEV_ENV:
        # Bind to all IPs, set custom port and enable debug mode
        app.config['HOST'] = '0.0.0.0'
        app.config['PORT'] = 5000
        app.config['DEBUG'] = True

        # Enable CORS for all routes in dev mode only
        from flask_cors import CORS
        CORS(app)
    else:
        from services.network import get_user_selection, publish_server_address

        # Bind to actual network ip, set custom port and disable debug mode
        app.config['HOST'] = get_user_selection()
        app.config['PORT'] = 8849
        app.config['DEBUG'] = False

        # Publish the appropriate socket address to my website
        server_address = f"http://{app.config['HOST']}:{app.config['PORT']}"
        publish_server_address(server_address)
        print(' * Serving at', server_address)
