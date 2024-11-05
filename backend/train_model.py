import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

# Load dataset
data = pd.read_csv("spotify_data.csv")

# Select features
features = ["danceability", "energy", "tempo", "valence", "instrumentalness"]
X = data[features]

# Initialize and fit the scaler
scaler = StandardScaler()
scaler.fit(X)

# Save the scaler
joblib.dump(scaler, "scaler.pkl")
print("Scaler trained and saved as 'scaler.pkl'")
