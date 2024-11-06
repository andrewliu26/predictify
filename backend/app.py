from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from recommendation_model import HybridRecommender
import traceback
import json

app = Flask(__name__)
CORS(app)  # Simple CORS setup

# Initialize our recommendation model
recommender = HybridRecommender(n_clusters=8)


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        print("\n=== New Recommendation Request ===")
        print("Request Headers:", dict(request.headers))

        data = request.get_json()
        print("Received data:", json.dumps(data, indent=2))

        if not data or "tracks" not in data:
            return jsonify({"success": False, "error": "No tracks data provided"}), 400

        tracks_data = data["tracks"]
        user_tracks = pd.DataFrame(tracks_data)
        print("Processing tracks:", user_tracks.to_dict("records"))

        # You can adjust the cluster weight here (0.6 means 60% clustering, 40% content-based)
        recommended_features = recommender.recommend_features(
            user_tracks, cluster_weight=0.6
        )

        recommendations = dict(
            zip(recommender.get_feature_names(), recommended_features)
        )

        print("Sending recommendations:", recommendations)
        return jsonify({"success": True, "recommended_features": recommendations})

    except Exception as e:
        error_msg = f"Error in recommendation: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return jsonify({"success": False, "error": error_msg}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)  # Explicitly set host to 127.0.0.1
