from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from services.decorators import validate_path
from services.explorer import get_drives_info, get_items_info

app = Flask(__name__)


# To serve the UI app build (under development)
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Hello from Python-Flask!'})


# To get info about drives or items at the given path
@app.route('/api/items', methods=['GET'])
@validate_path
def get_items(path):
    if path == '/':
        return jsonify(get_drives_info())
    search = request.args.get('search', None)
    folders, files = get_items_info(path, search=search)
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
    app.run(port=8849, debug=True)
