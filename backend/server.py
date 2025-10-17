from services import configure_flask_app
from services.validator import validate_path
from services.thumbnails import get_generated_thumbnail
from services.network import get_stream_or_download_response
from services.explorer import formatPath, get_device_info, get_drives_info, get_items_info
from services.authenticator import generate_unique_code, verify_user_code, require_authentication

from flask import Flask, jsonify, redirect, send_from_directory, request
from werkzeug.exceptions import HTTPException
from waitress import serve


# Create flask app and configure it for either dev or prod mode
app = Flask(__name__, static_url_path='/public/')
configure_flask_app(app)


# To serve the static frontend build from public folder in production
@app.route('/', methods=['GET'])
def home():
    if app.config['DEBUG']:
        return redirect('http://localhost:3000')
    return send_from_directory('./public', 'index.html')


# To get info about device, drives and items at the given valid path
@app.route('/explore', methods=['GET'])
@validate_path('folder')
@require_authentication
def get_items(path):
    print('Explore -', formatPath(path))
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


# To generate the the thumbnail of any supported file and get its url
@app.route('/thumbnail', methods=['GET'])
@validate_path('file')
@require_authentication
def generate_thumbnail(path):
    thumbnail = get_generated_thumbnail(path)
    return jsonify({'filepath': path, 'thumbnail': thumbnail})


# To download or stream file contents in 1MB chunks with Range header
@app.route('/open', methods=['GET'])
@validate_path('file')
@(require_authentication if not app.config['DEBUG'] else lambda fun: fun)
def open_file(path):
    stream = request.args.get('stream') == 'true'
    range_header = request.headers.get('Range')
    print('Stream -' if stream else 'Download -', formatPath(path), range_header)
    return get_stream_or_download_response(path, stream)


# To generate and verify the verification code for authentication
@app.route('/authenticate', methods=['GET'])
def authenticate():
    user_code = request.args.get('verify')
    if user_code is not None:
        if verify_user_code(user_code):
            return jsonify({'status': 'verified'})
        return jsonify({'status': 'failed'})
    verification_code = generate_unique_code()
    print(f'\nVerification Code:  {verification_code}\n')
    return jsonify({'status': 'generated'})


# Global http error handler to get jsonified error response
@app.errorhandler(HTTPException)
def handle_http_exception(error):
    error_response = {'code': error.code, 'error': error.name, 'message': error.description}
    return jsonify(error_response), error.code


# Run the app on dev or prod server depending on current mode
if app.config['DEBUG']:
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
else:
    serve(app=app, host=app.config['HOST'], port=app.config['PORT'], threads=16, ident='MyFileServer')
