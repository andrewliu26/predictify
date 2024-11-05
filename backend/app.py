from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import joblib

app = Flask(__name__)
CORS(app)

# Load the Spotify dataset
df = pd.read_csv("spotify_data.csv")

# Initialize the scaler
scaler = StandardScaler()

# Select features for content-based filtering
FEATURES = ["danceability", "energy", "valence", "tempo", "instrumentalness"]

# Scale the features
scaled_features = scaler.fit_transform(df[FEATURES])
feature_matrix = pd.DataFrame(scaled_features, columns=FEATURES)


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        # Get user's track features
        user_features = request.json

        if not user_features:
            return jsonify({"error": "No features provided"}), 400

        # Create user feature vector
        user_vector = np.array(
            [
                [
                    user_features.get("danceability", 0),
                    user_features.get("energy", 0),
                    user_features.get("valence", 0),
                    user_features.get("tempo", 0) / 200,  # Normalize tempo
                    user_features.get("instrumentalness", 0),
                ]
            ]
        )

        # Scale user vector
        scaled_user_vector = scaler.transform(user_vector)

        # Calculate similarity scores
        similarities = cosine_similarity(scaled_user_vector, scaled_features)

        # Get top 10 similar tracks
        similar_indices = similarities[0].argsort()[-10:][::-1]

        recommendations = []
        for idx in similar_indices:
            recommendations.append(
                {
                    "name": df.iloc[idx]["name"],
                    "artist": df.iloc[idx]["artist"],
                    "danceability": df.iloc[idx]["danceability"],
                    "energy": df.iloc[idx]["energy"],
                    "valence": df.iloc[idx]["valence"],
                    "tempo": df.iloc[idx]["tempo"],
                    "instrumentalness": df.iloc[idx]["instrumentalness"],
                }
            )

        return jsonify(recommendations)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
