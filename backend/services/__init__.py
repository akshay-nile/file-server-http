import os
import sys

# Identify (or guess) if the current environment is dev or prod
IS_DEV_ENV = all(map(os.path.exists, ('.venv', 'pyproject.toml', 'uv.lock')))

if IS_DEV_ENV:
    # Add libs abs path to the beginning of sys.path to refer to the local libraries
    libs_path = os.path.abspath('libs')
    if libs_path not in sys.path:
        sys.path.insert(0, libs_path)


from flask import Flask


def configure_flask_app(app: Flask):
    app.static_folder = os.path.abspath('public')

    if IS_DEV_ENV:
        # Bind to localhost, set custom port and enable debug mode
        app.config['HOST'] = 'localhost'
        app.config['PORT'] = 8849
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
        host, port = app.config['HOST'], app.config['PORT']
        publish_server_address(f'http://{host}:{port}')
