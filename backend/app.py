from flask import Flask, jsonify, request
import pandas as pd
import joblib
from sklearn.cluster import KMeans

app = Flask(__name__)

# Load the trained model
model = joblib.load("model.pkl")


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        # Get audio features from request
        data = request.json
        user_features = pd.DataFrame([data])

        # Predict cluster for user's features
        cluster = model.predict(user_features)[0]

        # Recommend songs from the same cluster (example using sample dataset)
        # You can load the original dataset here or cache it for recommendations
        dataset = pd.read_csv("./spotify_data.csv")
        features = dataset[["danceability", "energy", "tempo", "valence"]]

        # Find songs in the same cluster
        dataset["cluster"] = model.predict(features)
        recommendations = dataset[dataset["cluster"] == cluster].sample(
            5
        )  # Sample 5 songs

        # Format the response
        recommended_songs = recommendations.to_dict(orient="records")
        return jsonify(recommended_songs)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
