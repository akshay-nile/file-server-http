from services import configure_flask_app
from services.validator import validate_path
from services.environment import USER_DOWNLOADS
from services.network import get_stream_or_download_response
from services.thumbnails import get_generated_thumbnail, THUMBNAILS_DIR
from services.utilities import is_public_resource, format_path, keep_screen_awake, log
from services.authenticator import generate_unique_token, verify_user_token, require_authentication, play_notification_tone
from services.explorer import delete_items, rename_item, get_clipboard_info, get_device_info, get_drives_info, get_items_info, get_updated_shortcuts, get_total_size

from flask import Flask, jsonify, make_response, send_from_directory, request
from werkzeug.exceptions import HTTPException
from waitress import serve


# Create flask app and configure it for either dev or prod mode
app = configure_flask_app(Flask(__name__))


# To serve static resources from public and thumbnails folder
@app.route('/', endpoint='public')
@app.route('/<path:resource>', endpoint='public')
@app.route('/thumbnails/<path:resource>', endpoint='thumbnails')
def serve_static_files(resource='index.html'):
    directory = THUMBNAILS_DIR
    if request.endpoint == 'public':
        directory = './public'
        if not is_public_resource(resource):
            resource = 'index.html'
    response = send_from_directory(directory, resource)
    response.headers['Cache-Control'] = 'no-cache' if resource == 'index.html' else 'public, max-age=31536000, immutable'
    return response


# To get info about home or items at the given valid folder path
@app.route('/explore', methods=['GET', 'POST'])
@validate_path('folder')
@require_authentication
def get_items(path):
    log('Explore -', format_path(path), color='B')
    if request.method == 'POST':
        return jsonify({
            'device': get_device_info(), 'drives': get_drives_info(),
            'shortcuts': get_updated_shortcuts(), 'clipboard': get_clipboard_info()
        })
    folders, files = get_items_info(path)
    return jsonify({'folders': folders, 'files': files})


# To generate the thumbnail of a supported file and get its thumbnail url
@app.route('/thumbnail')
@validate_path('file')
@require_authentication
def generate_thumbnail(path):
    thumbnail = get_generated_thumbnail(path)
    return jsonify({'filepath': path, 'thumbnail': thumbnail})


# To download or stream file contents in 1 MB chunks with Range header
@app.route('/open')
@validate_path('file')
@require_authentication
def open_file(path):
    token = request.cookies.get('token')
    stream = request.args.get('stream') == 'true'
    range_header = request.headers.get('Range')
    log('Stream -' if stream else 'Download -', format_path(path), range_header, token, color='Y')
    return get_stream_or_download_response(path, stream)


# To save an uploaded file in user's Downlaods folder
@app.route('/upload', methods=['POST'])
@require_authentication
def save_files():
    file = request.files.get('file', None)
    if file is None:
        return jsonify({'status': 'failed'})
    file.save(f'{USER_DOWNLOADS}/{file.filename}')
    log('Upload -', file.filename, color='Y')
    return jsonify({'status': 'uploaded'})


# To delete multiple items or rename any single item
@app.route('/modify/<string:action>', methods=['POST'])
@require_authentication
def modify_items(action: str):
    items = request.get_json()
    if action == 'delete':
        log('Delete - ', end='', color='R')
        log(*map(format_path, items), sep='\nDelete - ', color='R')
        return jsonify({'deleted': delete_items(items)})
    if action == 'rename':
        log('Rename (old) -', format_path(items[0]), color='B')
        log('Rename (new) -', format_path(items[1]), color='B')
        return jsonify({'renamed': rename_item(*items)})
    return jsonify({'unknown': action})


# To get the total size in bytes of all the given folders
@app.route('/total', methods=['POST'])
@require_authentication
def get_folders_size():
    folders = request.get_json()
    return jsonify({'totalSize': get_total_size(folders)})


# To generate and verify the unique token for authentication
@app.route('/authenticate')
def authenticate():
    user_token = request.args.get('verify')
    if user_token is not None:
        if verify_user_token(user_token):
            response = make_response(jsonify({'status': 'verified'}))
            response.set_cookie(key='token', value=user_token, httponly=True, samesite='Lax', max_age=31536000)
            return response
        response = make_response(jsonify({'status': 'failed'}))
        response.delete_cookie(key='token')
        return response
    token = generate_unique_token()
    log(f'\nToken Generated:  {token}\n', color='Y')
    play_notification_tone()
    return jsonify({'status': 'generated'})


# Global http error handler to get jsonified error response
@app.errorhandler(HTTPException)
def handle_http_exception(error):
    error_response = {'code': error.code, 'status': error.name, 'message': error.description}
    return jsonify(error_response), error.code


# Run the app on dev or prod server depending on current mode
try:
    if app.config['DEBUG']:
        app.run(
            host=app.config['HOST'],
            port=app.config['PORT'],
            debug=app.config['DEBUG']
        )
    else:
        keep_screen_awake(True)
        serve(
            app=app,
            host=app.config['HOST'],
            port=app.config['PORT'],
            threads=16,                                     # Max concurrent connections 16
            max_request_body_size=8 * 1024 * 1024 * 1024,   # Max upload size limit (8 GB)
            channel_timeout=15 * 60,                        # Max request timeout (15 Minutes)
            ident='MyFileServer'
        )
finally:
    keep_screen_awake(False)
