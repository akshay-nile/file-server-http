import flask

app = flask.Flask(__name__)


@app.route('/', methods=['GET'])
def home():
    return flask.jsonify({'message': 'Hello from Python-Flask!'})


if __name__ == '__main__':
    app.run(port=8849, debug=True)
