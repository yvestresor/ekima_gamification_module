from flask import Flask, request, jsonify
from api.routes import api
from recommender.model import recommend_learning_path

app = Flask(__name__)
app.register_blueprint(api, url_prefix='/api')

@app.route('/')
def home():
    return 'AI Recommendation Service'

@app.route('/recommend', methods=['POST'])
def recommend():
    user_data = request.json
    recommendations = recommend_learning_path(user_data)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(port=5001, debug=True)