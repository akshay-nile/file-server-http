import time
from services import configure_flask_app
from services.decorators import validate_path
from services.explorer import get_device_info, get_drives_info, get_items_info

from flask import Flask, jsonify, send_from_directory, request
from werkzeug.exceptions import HTTPException


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
def get_items(path):
    # time.sleep(2)
    if path == '/':
        device = get_device_info()
        drives = get_drives_info()
        return jsonify({'device': device, 'drives': drives})
    options = dict()
    options['search'] = request.args.get('search', None)
    options['sort_by'] = request.args.get('sort_by', 'name')
    options['reverse'] = request.args.get('reverse', False)
    options['show_hidden'] = request.args.get('show_hidden', False)
    folders, files = get_items_info(path, **options)
    return jsonify({'folders': folders, 'files': files})


# Global http error handler to get jsonified error response
@app.errorhandler(HTTPException)
def handle_http_exception(error):
    response = {
        "error": error.name,
        "message": error.description,
        "code": error.code
    }
    return jsonify(response), error.code


if __name__ == '__main__':
    app.run(
        host=app.config.get('HOST'),
        port=app.config.get('PORT'),
        debug=app.config.get('DEBUG')
    )
