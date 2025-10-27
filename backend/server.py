from services import configure_flask_app
from services.validator import validate_path
from services.thumbnails import get_generated_thumbnail
from services.network import get_stream_or_download_response
from services.authenticator import generate_unique_token, verify_user_token, require_authentication
from services.explorer import formatPath, get_clipboard_info, get_device_info, get_drives_info, get_items_info, getSavePath, filter_existing_shortcuts, get_total_size

from flask import Flask, jsonify, redirect, send_from_directory, request
from werkzeug.exceptions import HTTPException
from waitress import serve


# Create flask app and configure it for either dev or prod mode
app = configure_flask_app(Flask(__name__))


# To serve the index.html from public folder
@app.route('/', methods=['GET'])
def home():
    if app.config['DEBUG']:
        return redirect('http://localhost:3000')
    return send_from_directory('./public', 'index.html')


# To serve static resources from public folder
@app.route('/public/<path:resource>', methods=['GET'])
def serve_static(resource: str):
    return send_from_directory('./public', resource)


# To get info about home or items at the given valid folder path
@app.route('/explore', methods=['GET', 'POST'])
@validate_path('folder')
@require_authentication
def get_items(path):
    print('Explore -', formatPath(path))
    if request.method == 'POST':
        return jsonify({
            'device': get_device_info(),
            'drives': get_drives_info(),
            'shortcuts': filter_existing_shortcuts(),
            'clipboard': get_clipboard_info()
        })
    folders, files = get_items_info(path)
    return jsonify({'folders': folders, 'files': files})


# To generate the thumbnail of a supported file and get its thumbnail url
@app.route('/thumbnail', methods=['GET'])
@validate_path('file')
@require_authentication
def generate_thumbnail(path):
    thumbnail = get_generated_thumbnail(path)
    return jsonify({'filepath': path, 'thumbnail': thumbnail})


# To download or stream file contents in 1 MB chunks with Range header
@app.route('/open', methods=['GET'])
@validate_path('file')
@require_authentication
def open_file(path):
    token = request.args.get('token')
    stream = request.args.get('stream') == 'true'
    range_header = request.headers.get('Range')
    print('Stream -' if stream else 'Download -', formatPath(path), range_header, token)
    return get_stream_or_download_response(path, stream)


# To save an uploaded file in user's Downlaods folder
@app.route('/upload', methods=['POST'])
@require_authentication
def save_files():
    file = request.files.get('file', None)
    if file is None:
        return jsonify({'status': 'failed'})
    file.save(f'{getSavePath()}/{file.filename}')
    print('Upload -', file.filename)
    return jsonify({'status': 'uploaded'})


# To get the total size in bytes of all the given folders
@app.route('/total-size', methods=['POST'])
@require_authentication
def get_folders_size():
    folders = request.get_json()
    return jsonify({'totalSize': get_total_size(folders)})


# To generate and verify the unique token for authentication
@app.route('/authenticate', methods=['GET'])
def authenticate():
    user_token = request.args.get('verify')
    if user_token is not None:
        if verify_user_token(user_token):
            return jsonify({'status': 'verified'})
        return jsonify({'status': 'failed'})
    token = generate_unique_token()
    print(f'\nToken Generated:  {token}\n')
    return jsonify({'status': 'generated'})


# Global http error handler to get jsonified error response
@app.errorhandler(HTTPException)
def handle_http_exception(error):
    error_response = {'code': error.code, 'error': error.name, 'message': error.description}
    return jsonify(error_response), error.code


# Run the app on dev or prod server depending on current mode
if app.config['DEBUG']:
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
else:
    serve(
        app=app,
        host=app.config['HOST'],
        port=app.config['PORT'],
        threads=16,                                     # Max concurrent connections 16
        max_request_body_size=8 * 1024 * 1024 * 1024,   # Max upload size limit (8 GB)
        channel_timeout=15 * 60,                        # Max request timeout (15 Minutes)
        ident='MyFileServer'
    )
