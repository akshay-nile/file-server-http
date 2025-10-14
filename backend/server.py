from services import IS_DEV_ENV, configure_flask_app
from services.decorators import validate_path
from services.thumbnails import get_cached_thumbnails, get_generated_thumbnail
from services.explorer import get_device_info, get_drives_info, get_items_info
from services.authenticator import generate_unique_code, verify_unique_code, require_authentication

from flask import Flask, jsonify, send_from_directory, request
from werkzeug.exceptions import HTTPException
from waitress import serve


app = Flask(__name__, static_url_path='/public/')
configure_flask_app(app)


# To serve the UI build from dist folder after packaging
@app.route('/', methods=['GET'])
def home():
    if app.config.get('DEBUG'):
        return "<h1>Cannot serve 'index.html' in Development Mode!</h1>"
    return send_from_directory('./public', 'index.html')


# To get info about drives or items at the given path
@app.route('/explore', methods=['GET'])
@validate_path
@require_authentication
def get_items(path):
    print('Explore:', path)
    if path == '/':
        device = get_device_info()
        drives = get_drives_info()
        return jsonify({'device': device, 'drives': drives})
    options = dict()
    options['search'] = request.args.get('search', None)
    options['sort_by'] = request.args.get('sort_by', 'name')
    options['reverse'] = request.args.get('reverse', 'false').lower() == 'true'
    options['show_hidden'] = request.args.get('show_hidden', 'false').lower() == 'true'
    folders, files = get_items_info(path, **options)
    return jsonify({'folders': folders, 'files': files})


# To get the map of all the sub-file paths to their thumbnail paths
@app.route('/thumbnails', methods=['GET'])
@validate_path
@require_authentication
def get_thumbnails(path):
    base_url = request.base_url.replace('/thumbnails', '/public/thumbnails')
    if request.args.get('cached') == 'true':
        return jsonify(get_cached_thumbnails(path, base_url))
    return jsonify(get_generated_thumbnail(path, base_url))


# To generate and verify the unique authentication code
@app.route('/authenticate', methods=['GET'])
def authenticate():
    user_code = request.args.get('verify')
    if user_code is not None:
        if verify_unique_code(user_code):
            print('Verified:', user_code)
            return jsonify({'status': 'verified'})
        return jsonify({'status': 'failed'})
    unique_code = generate_unique_code()
    print('Unique Code Generated:', unique_code)
    return jsonify({'status': 'generated'})


# Global http error handler to get jsonified error response
@app.errorhandler(HTTPException)
def handle_http_exception(error):
    response = {
        "code": error.code,
        "error": error.name,
        "message": error.description
    }
    return jsonify(response), error.code


host, port = app.config.get('HOST'), app.config.get('PORT')

if IS_DEV_ENV:
    app.run(host=host, port=port, debug=True)
else:
    serve(app=app, host=host, port=port, threads=64, ident='MyFileServer')
