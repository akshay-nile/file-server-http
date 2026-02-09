import os
from services.environment import IS_WIN_OS, IS_DEV_ENV


# While running on Pydroid-3
if not IS_WIN_OS:
    # Declare required modules for Pydroid-3 global installation
    modules = [
        'flask', 'requests', 'mutagen', 'waitress', 'pyperclip',
        {'import': 'PIL', 'install': 'pillow'},
    ]

    # Global pip installation for missing requirements in Pydroid-3
    for module in modules:
        import_name, install_name = module, module
        if isinstance(module, dict):
            import_name, install_name = module.get('import'), module.get('install')
        try:
            exec(f'import {import_name}')
        except ImportError:
            os.system(f'pip install {install_name}')


from flask import Flask


def configure_flask_app(app: Flask) -> Flask:
    if IS_DEV_ENV:
        # Bind to all IPs, set custom port and enable debug mode
        app.config['HOST'] = 'localhost'
        app.config['PORT'] = 5000
        app.config['DEBUG'] = True

        # Enable CORS for all routes in dev mode only
        from flask_cors import CORS
        CORS(app)
    else:
        from services.network import is_socket_available, check_for_update, get_user_selection, publish_server_address

        # Bind to actual network ip, set custom port and disable debug mode
        app.config['HOST'] = get_user_selection()
        app.config['PORT'] = 8849
        app.config['DEBUG'] = False

        # Check for the socket availability before binding to the server
        if not is_socket_available(app.config['HOST'], app.config['PORT']):
            print('Socket is already in use')
            exit(0)

        # Publish the appropriate socket/server address to my website
        server_address = f"http://{app.config['HOST']}:{app.config['PORT']}"
        publish_server_address(server_address)

        from services.network import is_public_ip
        print(f" {'🌐' if is_public_ip else '🛜'} Serving at {server_address}")

        # Launch a new thread to check if updated version is available or not
        check_for_update()
    return app
