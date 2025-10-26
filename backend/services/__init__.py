import os
import platform

# Declare common 3rd party requirements here
modules = [
    'flask', 'requests', 'mutagen', 'waitress', 'pyperclip',
    {'import': 'PIL', 'install': 'pillow'},
]

# Append platform specific requirements here
if platform.system() == 'Windows':
    modules.append('moviepy')

# Identify (or guess) if the current environment is dev or prod
IS_DEV_ENV = all(map(os.path.exists, ('.venv', 'pyproject.toml', 'uv.lock')))

if not IS_DEV_ENV:
    # Global pip installation if any required module is missing
    for module in modules:
        import_name = module if isinstance(module, str) else module.get('import')
        install_name = module if isinstance(module, str) else module.get('install')
        try:
            exec(f'import {import_name}')
        except ImportError:
            os.system(f'pip install {install_name}')


from flask import Flask


def configure_flask_app(app: Flask) -> Flask:
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
    return app
