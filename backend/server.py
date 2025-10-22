from services import configure_flask_app
from services.validator import validate_path
from services.thumbnails import get_generated_thumbnail
from services.network import get_stream_or_download_response
from services.authenticator import generate_unique_token, verify_user_token, require_authentication
from services.explorer import formatPath, get_clipboard_info, get_device_info, get_drives_info, get_items_info, getSavePath

from flask import Flask, jsonify, make_response, redirect, send_from_directory, request
from werkzeug.exceptions import HTTPException
from waitress import serve


# Create flask app and configure it for either dev or prod mode
app = Flask(__name__)
configure_flask_app(app)


# To serve the index.html from public folder in production mode
@app.route('/', methods=['GET'])
def home():
    if app.config['DEBUG']:
        return redirect('http://localhost:3000')
    return send_from_directory('./public', 'index.html')


# To serve the static files from public folder with cache response
@app.route('/public/<path:resource>', methods=['GET'])
def serve_static(resource: str):
    print(resource)
    response = make_response(send_from_directory('./public', resource))
    response.headers["Cache-Control"] = "public, max-age=315360000, immutable"
    return response


# To get info about device, drives and items at the given valid path
@app.route('/explore', methods=['GET'])
@validate_path('folder')
@require_authentication
def get_items(path):
    print('Explore -', formatPath(path))
    if path == '/':
        return jsonify({
            'device': get_device_info(),
            'drives': get_drives_info(),
            'clipboard': get_clipboard_info()
        })
    folders, files = get_items_info(path)
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
@require_authentication
def open_file(path):
    token = request.args.get('token')
    stream = request.args.get('stream') == 'true'
    range_header = request.headers.get('Range')
    print('Stream -' if stream else 'Download -', formatPath(path), range_header, token)
    return get_stream_or_download_response(path, stream)


# To save an uploaded file in Downlaods folder
@app.route('/upload', methods=['POST'])
@require_authentication
def save_files():
    file = request.files.get('file', None)
    if file is None:
        return jsonify({'status': 'failed'})
    file.save(f'{getSavePath()}/{file.filename}')
    print('Upload -', file.filename)
    return jsonify({'status': 'uploaded'})


# To save an uploaded file in Downlaods folder
@app.route('/test', methods=['GET'])
def test():
    return get_clipboard_info()


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
