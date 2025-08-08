from flask import Blueprint, request, jsonify
from recommender.model import recommend

api = Blueprint('api', __name__)

@api.route('/recommend', methods=['POST'])
def recommend_route():
    user_data = request.json
    recommendations = recommend(user_data)
    return jsonify({'recommendations': recommendations})