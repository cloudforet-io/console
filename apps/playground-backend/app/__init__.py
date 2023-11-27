from flask import Flask, jsonify
from flask_cors import CORS

import os

# instantiate the app
app = Flask(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

# sanity check route
@app.route('/', methods=['GET'])
def test_router():

    return jsonify('This is Docker Test developments Server!')

@app.route('/health_check', methods=['GET'])
def health_check():
    return jsonify('good')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=os.getenv('FLASK_RUN_PORT'),debug=os.getenv('FLASK_DEBUG'))