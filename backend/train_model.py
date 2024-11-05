import pandas as pd
from sklearn.cluster import KMeans
import joblib

# Load dataset
data = pd.read_csv("./spotify_data.csv")

# Example preprocessing (modify according to your actual data columns)
# Assume your CSV has columns like "danceability", "energy", "tempo", "valence"
features = data[["danceability", "energy", "tempo", "valence"]]

# Train a KMeans model
num_clusters = 5  # You can tune this number based on your data
model = KMeans(n_clusters=num_clusters, random_state=42)
model.fit(features)

# Save the trained model
joblib.dump(model, "model.pkl")
print("Model trained and saved as 'model.pkl'")
