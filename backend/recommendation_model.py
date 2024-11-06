import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import time


class HybridRecommender:
    def __init__(self, n_clusters=8):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.feature_names = [
            "danceability",
            "energy",
            "valence",
            "loudness",
            "instrumentalness",
        ]
        self.dataset = None  # Will store our full dataset
        self.scaled_features = None  # Will store pre-scaled features

        print("Initializing HybridRecommender...")
        self._load_and_train_model()

    def _load_and_train_model(self):
        print("Loading dataset...")
        start_time = time.time()

        # Load dataset
        self.dataset = pd.read_csv("spotify_data.csv")
        print(f"Dataset loaded in {time.time() - start_time:.2f} seconds")
        print(f"Dataset shape: {self.dataset.shape}")

        print("Starting training process...")
        print("Scaling features...")

        # Extract features in the correct order
        features = self.dataset[self.feature_names]
        print("Feature statistics before scaling:")
        print(features.describe())

        # Fit the scaler and transform features
        self.scaled_features = self.scaler.fit_transform(features)

        print("Training K-Means clustering...")
        start_time = time.time()
        self.kmeans.fit(self.scaled_features)
        print(f"K-Means training completed in {time.time() - start_time:.2f} seconds")

        # Print cluster sizes
        cluster_labels = self.kmeans.labels_
        for i in range(self.n_clusters):
            cluster_size = np.sum(cluster_labels == i)
            print(f"Cluster {i} size: {cluster_size} songs")

    def _get_cluster_recommendations(self, scaled_input):
        """Get recommendations based on K-means clustering"""
        # Predict cluster and get centroid
        cluster = self.kmeans.predict(scaled_input)[0]
        centroid = self.kmeans.cluster_centers_[cluster]

        # Get all songs in this cluster
        cluster_mask = self.kmeans.labels_ == cluster
        cluster_songs = self.scaled_features[cluster_mask]

        # Find distances to centroid
        distances = np.linalg.norm(cluster_songs - centroid, axis=1)

        return centroid, distances, cluster_mask

    def _get_content_based_recommendations(self, scaled_input):
        """Get recommendations based on content similarity"""
        # Calculate cosine similarity between input and all songs
        similarities = cosine_similarity(scaled_input, self.scaled_features)[0]
        return similarities

    def recommend_features(self, user_tracks, cluster_weight=0.6):
        """
        Recommend features using hybrid approach
        cluster_weight: weight given to cluster-based recommendations (0-1)
        """
        # Ensure the features are in the correct order
        user_features = user_tracks[self.feature_names].copy()

        # Scale the input features
        scaled_input = self.scaler.transform(user_features)

        # Get cluster-based recommendations
        centroid, cluster_distances, cluster_mask = self._get_cluster_recommendations(
            scaled_input
        )

        # Get content-based recommendations
        content_similarities = self._get_content_based_recommendations(scaled_input)

        # Combine both approaches
        # Initialize scores for all songs
        hybrid_scores = np.zeros(len(self.dataset))

        # Add cluster-based scores (inverse of distance)
        cluster_scores = np.zeros(len(self.dataset))
        cluster_scores[cluster_mask] = 1 / (
            cluster_distances + 1e-6
        )  # Add small constant to avoid division by zero

        # Normalize scores
        cluster_scores = cluster_scores / np.max(cluster_scores)
        content_similarities = content_similarities / np.max(content_similarities)

        # Combine scores with weights
        hybrid_scores = (
            cluster_weight * cluster_scores
            + (1 - cluster_weight) * content_similarities
        )

        # Get the features of the top recommended song
        top_song_idx = np.argmax(hybrid_scores)
        recommended_features = self.scaled_features[top_song_idx]

        # Convert back to original scale
        recommended_features = self.scaler.inverse_transform([recommended_features])[0]

        # Create recommendations dictionary
        recommendations = dict(zip(self.feature_names, recommended_features))

        # Print debug info
        print(f"Input features (scaled): {scaled_input}")
        print(f"Cluster contribution: {cluster_weight}")
        print(f"Content similarity contribution: {1 - cluster_weight}")
        print(f"Recommended features: {recommendations}")

        return recommended_features

    def get_feature_names(self):
        """Return the feature names in the correct order"""
        return self.feature_names
