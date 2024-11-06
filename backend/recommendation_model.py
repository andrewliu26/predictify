import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import time
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import os
from sklearn.decomposition import PCA


class HybridRecommender:
    def __init__(self, n_clusters=8):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.feature_names = [
            "danceability",
            "energy",
            "valence",
            "tempo",
            "instrumentalness",
        ]
        self.dataset = None  # Will store our full dataset
        self.scaled_features = None  # Will store pre-scaled features

        # Add visualization directory setup
        self.viz_dir = Path("visualizations")
        self.viz_dir.mkdir(exist_ok=True)

        print("Initializing HybridRecommender...")
        self._load_and_train_model()

    def _generate_feature_distribution_plot(self):
        plt.figure(figsize=(12, 6))
        for feature in self.feature_names:
            sns.kdeplot(data=self.dataset[feature], label=feature)

        plt.title("Feature Distributions")
        plt.xlabel("Value")
        plt.ylabel("Density")
        plt.legend()
        plt.savefig(self.viz_dir / "feature_distributions.png")
        plt.close()

    def _generate_cluster_visualization(self):
        # Create PCA for 2D visualization
        pca = PCA(n_components=2)
        reduced_features = pca.fit_transform(self.scaled_features)

        plt.figure(figsize=(10, 10))
        scatter = plt.scatter(
            reduced_features[:, 0],
            reduced_features[:, 1],
            c=self.kmeans.labels_,
            cmap="viridis",
            alpha=0.6,
        )

        # Plot cluster centers
        centers_reduced = pca.transform(self.kmeans.cluster_centers_)
        plt.scatter(
            centers_reduced[:, 0],
            centers_reduced[:, 1],
            c="red",
            marker="x",
            s=200,
            linewidths=3,
            label="Centroids",
        )

        plt.title(f"Song Clusters (K={self.n_clusters})")
        plt.colorbar(scatter, label="Cluster")
        plt.legend()
        plt.savefig(self.viz_dir / "cluster_visualization.png")
        plt.close()

    def _generate_feature_correlation_plot(self):
        plt.figure(figsize=(10, 8))
        correlation_matrix = self.dataset[self.feature_names].corr()
        sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm", center=0)
        plt.title("Feature Correlation Matrix")
        plt.tight_layout()
        plt.savefig(self.viz_dir / "feature_correlations.png")
        plt.close()

    def _load_and_train_model(self):
        print("Loading dataset...")
        start_time = time.time()

        # Load dataset
        self.dataset = pd.read_csv("spotify_data.csv")
        print(f"Dataset loaded in {time.time() - start_time:.2f} seconds")
        print(f"Dataset shape: {self.dataset.shape}")

        # Generate initial distribution plot
        print("Generating feature distribution plot...")
        self._generate_feature_distribution_plot()

        # Generate correlation plot
        print("Generating feature correlation plot...")
        self._generate_feature_correlation_plot()

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

        # Train KMeans and generate cluster visualization
        print("Generating cluster visualization...")
        self._generate_cluster_visualization()

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

        # Generate visualization of the recommendation
        self._generate_recommendation_visualization(user_tracks, recommended_features)

        return recommended_features

    def _generate_recommendation_visualization(self, user_tracks, recommended_features):
        plt.figure(figsize=(10, 6))

        # Plot user tracks features
        x = np.arange(len(self.feature_names))
        width = 0.35

        plt.bar(
            x - width / 2,
            user_tracks[self.feature_names].mean(),
            width,
            label="User Average",
            alpha=0.7,
        )
        plt.bar(
            x + width / 2, recommended_features, width, label="Recommended", alpha=0.7
        )

        plt.xlabel("Features")
        plt.ylabel("Value")
        plt.title("User Average vs Recommended Features")
        plt.xticks(x, self.feature_names, rotation=45)
        plt.legend()
        plt.tight_layout()

        plt.savefig(self.viz_dir / "recommendation_comparison.png")
        plt.close()

    def get_feature_names(self):
        """Return the feature names in the correct order"""
        return self.feature_names
