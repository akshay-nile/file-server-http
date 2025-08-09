import os
import sys
from flask import Flask

from services.network import publish_socket_address, get_user_selection


# Identify (or guess) the current environment is dev or prod
IS_DEV_ENV = all(map(os.path.exists, ('.venv', 'pyproject.toml', 'uv.lock')))


def configure_environment(app: Flask) -> Flask:
    if IS_DEV_ENV:
        app.config['HOST'] = 'localhost'
        app.config['PORT'] = 8849
        app.config['DEBUG'] = True
    else:
        # Add libs abs path to the beginning of sys.path to refer to the local libraries
        libs_path = os.path.abspath('libs')
        if libs_path not in sys.path:
            sys.path.insert(0, libs_path)

        # Configure app to use dist folder to serve the UI build at home route '/'
        dist_path = os.path.abspath('dist')
        app.static_folder = dist_path
        app.template_folder = dist_path

        # Bind to actual network ip, set custom port and disable debug mode
        app.config['HOST'] = get_user_selection()
        app.config['PORT'] = 8849
        app.config['DEBUG'] = False

        # Set ssl-context to use RSA keys in production mode for https support
        # app.config['SSL_CONTEXT'] = ('ssl_keys/public.key', 'ssl_keys/private.key')

        # Publish the appropriate socket address to my website
        host, port = app.config['HOST'], app.config['PORT']
        sock_addr = f'{host}:{port}' if host.count('.') == 3 else f'[{host}]:{port}'
        publish_socket_address(sock_addr)

    return app
