import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
import time
import logging
import os


class HybridRecommender:
    def __init__(self, n_clusters=8, test_size=0.2):
        """
        Initialize the hybrid recommendation system.

        Args:
            n_clusters (int): Number of clusters for K-means
            test_size (float): Proportion of data to use for testing
        """
        self.n_clusters = n_clusters
        self.test_size = test_size
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)

        # Core audio features for recommendation
        self.feature_names = [
            "danceability",
            "energy",
            "valence",
            "acousticness",
            "instrumentalness",
            "liveness",
        ]

        # Feature weights for similarity calculation
        self.feature_weights = {
            "danceability": 1.2,  # Important for rhythm and mood
            "energy": 1.2,  # Important for overall feel
            "valence": 1.0,  # Musical positiveness
            "acousticness": 0.8,  # Less important but relevant
            "instrumentalness": 0.8,  # Less important but relevant
            "liveness": 0.6,  # Least important feature
        }

        # Weights for hybrid scoring
        self.cluster_weight = 0.4  # Cluster influence
        self.content_weight = 0.6  # Content similarity influence

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Initialize data storage
        self.dataset = None
        self.train_data = None
        self.test_data = None
        self.scaled_features_train = None
        self.scaled_features_test = None

        self.logger.info("Initializing HybridRecommender...")
        self._load_and_train_model()

    def _load_and_train_model(self):
        """Load dataset and train the model with train-test split"""
        try:
            start_time = time.time()

            # Load dataset
            self.logger.info("Loading dataset...")
            self.dataset = pd.read_csv("data/spotify_data.csv")
            self.logger.info(f"Dataset loaded: {self.dataset.shape} records")

            # Ensure track_id is string type
            self.dataset["track_id"] = self.dataset["track_id"].astype(str)

            # Split into train and test sets
            train_indices, test_indices = train_test_split(
                np.arange(len(self.dataset)), test_size=self.test_size, random_state=42
            )

            self.train_data = self.dataset.iloc[train_indices].reset_index(drop=True)
            self.test_data = self.dataset.iloc[test_indices].reset_index(drop=True)

            # Scale features
            self.logger.info("Scaling features...")
            train_features = self.train_data[self.feature_names]
            test_features = self.test_data[self.feature_names]

            self.scaled_features_train = self.scaler.fit_transform(train_features)
            self.scaled_features_test = self.scaler.transform(test_features)

            # Train K-means
            self.logger.info("Training K-means clustering...")
            self.kmeans.fit(self.scaled_features_train)

            # Log cluster distribution
            labels = self.kmeans.labels_
            for i in range(self.n_clusters):
                cluster_size = np.sum(labels == i)
                self.logger.info(f"Cluster {i} size: {cluster_size} songs")

            self.logger.info(
                f"Model training completed in {time.time() - start_time:.2f} seconds"
            )

        except Exception as e:
            self.logger.error(f"Error in _load_and_train_model: {str(e)}")
            raise

    def get_recommendations(self, track_id: str, n_recommendations: int = 5) -> list:
        """
        Get song recommendations based on a track ID.

        Args:
            track_id (str): The ID of the track to base recommendations on
            n_recommendations (int): Number of recommendations to return

        Returns:
            list: List of recommended songs with similarity scores
        """
        try:
            self.logger.info(f"Fetching recommendations for track ID: {track_id}")

            # First try to find the song in training data
            song = self.train_data[self.train_data["track_id"] == str(track_id)]
            in_test = False

            if song.empty:
                # If not in training data, check test data
                song = self.test_data[self.test_data["track_id"] == str(track_id)]
                in_test = True
                if song.empty:
                    raise ValueError(f"Track ID {track_id} not found in dataset")

            # Get the song's features
            song_features = song[self.feature_names]
            scaled_features = self.scaler.transform(song_features)

            # Get recommendations
            recommendations = self._get_hybrid_recommendations(
                scaled_features,
                n_recommendations=n_recommendations,
                exclude_ids=[track_id],
                input_song=song.iloc[0],
            )

            if not recommendations:
                raise ValueError("No recommendations generated")

            return recommendations

        except Exception as e:
            self.logger.error(f"Error in get_recommendations: {str(e)}")
            raise

    def _get_hybrid_recommendations(
        self, scaled_input, n_recommendations=5, exclude_ids=None, input_song=None
    ):
        try:
            # Weight the features
            weighted_features_train = self.scaled_features_train * np.array(
                [self.feature_weights[f] for f in self.feature_names]
            )
            weighted_input = scaled_input * np.array(
                [self.feature_weights[f] for f in self.feature_names]
            )

            # Get cluster-based scores
            cluster = self.kmeans.predict(scaled_input)[0]
            cluster_mask = self.kmeans.labels_ == cluster

            # Calculate weighted cosine similarity
            similarities = cosine_similarity(weighted_input, weighted_features_train)[0]

            # Initialize cluster scores
            cluster_scores = np.zeros_like(similarities)
            cluster_scores[cluster_mask] = 1.0

            # Calculate hybrid scores
            hybrid_scores = (
                self.cluster_weight * cluster_scores
                + self.content_weight * similarities
            )

            # Add genre boost if we have the input song
            if input_song is not None:
                input_genre = input_song["track_genre"]
                genre_boost = np.array(
                    [
                        (
                            0.2
                            if self.train_data.iloc[i]["track_genre"] == input_genre
                            else 0
                        )
                        for i in range(len(self.train_data))
                    ]
                )
                hybrid_scores += genre_boost

            # Normalize scores
            hybrid_scores = (hybrid_scores - hybrid_scores.min()) / (
                hybrid_scores.max() - hybrid_scores.min() + 1e-6
            )

            # Exclude specified tracks
            if exclude_ids:
                exclude_mask = ~self.train_data["track_id"].isin(exclude_ids)
                hybrid_scores = hybrid_scores * exclude_mask

            # Get top recommendations
            top_indices = np.argsort(hybrid_scores)[::-1][:n_recommendations]
            recommendations = []

            for idx in top_indices:
                if (
                    hybrid_scores[idx] > 0.1
                ):  # Only include if similarity is significant
                    song = self.train_data.iloc[idx]
                    recommendations.append(
                        {
                            "track_id": str(song["track_id"]),
                            "track_name": str(song["track_name"]),
                            "artists": str(song["artists"]),
                            "album_name": str(song["album_name"]),
                            "track_genre": str(song["track_genre"]),
                            "similarity_score": float(hybrid_scores[idx]),
                            "audio_features": {
                                "danceability": float(song["danceability"]),
                                "energy": float(song["energy"]),
                                "valence": float(song["valence"]),
                                "acousticness": float(song["acousticness"]),
                                "instrumentalness": float(song["instrumentalness"]),
                                "liveness": float(song["liveness"]),
                            },
                        }
                    )

            # Add logging for debugging
            self.logger.info(f"Generated recommendations: {recommendations}")

            return recommendations

        except Exception as e:
            self.logger.error(f"Error in _get_hybrid_recommendations: {str(e)}")
            raise

    def evaluate_model(self):
        """
        Evaluate the model using the test set.

        Returns:
            dict: Dictionary containing evaluation metrics
        """
        self.logger.info("Evaluating model performance...")

        try:
            # Calculate silhouette score on test data
            test_clusters = self.kmeans.predict(self.scaled_features_test)
            silhouette_test = silhouette_score(self.scaled_features_test, test_clusters)

            # Calculate mean cosine similarity within clusters
            mean_similarities = []
            for i in range(self.n_clusters):
                mask = test_clusters == i
                if np.sum(mask) > 1:
                    cluster_features = self.scaled_features_test[mask]
                    similarities = cosine_similarity(cluster_features)
                    mean_similarities.append(np.mean(similarities))

            avg_cluster_similarity = np.mean(mean_similarities)

            self.logger.info(f"Test Set Silhouette Score: {silhouette_test:.3f}")
            self.logger.info(
                f"Average Intra-cluster Similarity: {avg_cluster_similarity:.3f}"
            )

            return {
                "silhouette_score": silhouette_test,
                "avg_cluster_similarity": avg_cluster_similarity,
            }

        except Exception as e:
            self.logger.error(f"Error in evaluate_model: {str(e)}")
            raise

    def get_feature_importances(self):
        """
        Analyze feature importance based on cluster centers.

        Returns:
            dict: Dictionary of feature importance scores
        """
        try:
            feature_importances = {}
            cluster_centers = self.kmeans.cluster_centers_

            for i, feature in enumerate(self.feature_names):
                variation = np.std(cluster_centers[:, i])
                feature_importances[feature] = variation

            # Normalize importances
            total = sum(feature_importances.values())
            feature_importances = {k: v / total for k, v in feature_importances.items()}

            return feature_importances

        except Exception as e:
            self.logger.error(f"Error in get_feature_importances: {str(e)}")
            raise

    def generate_evaluation_report(self, save_path="evaluation_report"):
        """
        Generate evaluation report with visualizations.

        Args:
            save_path (str): Directory to save evaluation files
        """
        os.makedirs(save_path, exist_ok=True)
        self.logger.info(f"Generating evaluation report in {save_path}")

        try:
            # 1. Generate Cluster Distribution Plot
            plt.figure(figsize=(10, 6))
            cluster_labels = self.kmeans.labels_
            cluster_sizes = pd.Series(cluster_labels).value_counts().sort_index()
            sns.barplot(x=cluster_sizes.index, y=cluster_sizes.values)
            plt.title("Distribution of Songs Across Clusters")
            plt.xlabel("Cluster")
            plt.ylabel("Number of Songs")
            plt.savefig(f"{save_path}/cluster_distribution.png")
            plt.close()

            # 2. Generate Feature Importance Plot
            importances = self.get_feature_importances()
            plt.figure(figsize=(10, 6))
            plt.barh(list(importances.keys()), list(importances.values()))
            plt.title("Feature Importance in Clustering")
            plt.xlabel("Relative Importance")
            plt.tight_layout()
            plt.savefig(f"{save_path}/feature_importance.png")
            plt.close()

            # 3. Generate Feature Correlation Matrix
            plt.figure(figsize=(10, 8))
            feature_df = pd.DataFrame(
                self.scaled_features_train, columns=self.feature_names
            )
            sns.heatmap(
                feature_df.corr(), annot=True, fmt=".2f", cmap="coolwarm", center=0
            )
            plt.title("Feature Correlation Matrix")
            plt.tight_layout()
            plt.savefig(f"{save_path}/correlation_matrix.png")
            plt.close()

            # 4. Generate PCA Visualization
            pca = PCA(n_components=2)
            pca_features = pca.fit_transform(self.scaled_features_train)
            plt.figure(figsize=(10, 6))
            plt.scatter(
                pca_features[:, 0],
                pca_features[:, 1],
                c=self.kmeans.labels_,
                cmap="viridis",
                alpha=0.6,
            )
            plt.title("PCA Visualization of Clusters")
            plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)")
            plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)")
            plt.savefig(f"{save_path}/pca_clusters.png")
            plt.close()

            # 5. Save Evaluation Metrics
            metrics = self.evaluate_model()
            with open(f"{save_path}/evaluation_metrics.txt", "w") as f:
                f.write(
                    f"Test Set Silhouette Score: {metrics['silhouette_score']:.3f}\n"
                )
                f.write(
                    f"Average Intra-cluster Similarity: {metrics['avg_cluster_similarity']:.3f}\n"
                )
                f.write("\nFeature Importances:\n")
                for feature, importance in sorted(
                    importances.items(), key=lambda x: x[1], reverse=True
                ):
                    f.write(f"{feature}: {importance:.3f}\n")

            self.logger.info("Evaluation report generated successfully")

        except Exception as e:
            self.logger.error(f"Error generating evaluation report: {str(e)}")
            raise
