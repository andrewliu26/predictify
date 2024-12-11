import pandas as pd
import numpy as np
from typing import List, Dict, Any
from .recommendation_model import HybridRecommender


class SongHandler:
    def __init__(self, csv_path: str):
        """Initialize SongHandler with the path to the CSV file"""
        self.df = pd.read_csv(csv_path)
        self.recommender = HybridRecommender(n_clusters=8)

        # Convert explicit column to boolean
        self.df["explicit"] = self.df["explicit"].map({"True": True, "False": False})

        # Convert string columns to string type
        string_columns = ["track_name", "artists", "album_name", "track_genre"]
        for col in string_columns:
            self.df[col] = self.df[col].astype(str)

    def search_songs(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search songs by track name, artist, or album name"""
        query = query.lower()
        mask = (
            self.df["track_name"].str.lower().str.contains(query, na=False)
            | self.df["artists"].str.lower().str.contains(query, na=False)
            | self.df["album_name"].str.lower().str.contains(query, na=False)
        )
        matching_songs = self.df[mask].head(limit)
        return [self._convert_row_to_dict(row) for _, row in matching_songs.iterrows()]

    def get_recommendations(
        self, track_id: str, n_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        """Get song recommendations using the hybrid recommender"""
        try:
            recommendations = self.recommender.get_recommendations(
                track_id=track_id, n_recommendations=n_recommendations
            )
            return recommendations
        except Exception as e:
            raise ValueError(f"Error getting recommendations: {str(e)}")

    def _convert_row_to_dict(self, row: pd.Series) -> Dict[str, Any]:
        """Convert a DataFrame row to a dictionary"""
        return {
            "track_id": str(row["track_id"]),
            "artists": str(row["artists"]),
            "album_name": str(row["album_name"]),
            "track_name": str(row["track_name"]),
            "popularity": int(row["popularity"]),
            "duration_ms": int(row["duration_ms"]),
            "explicit": bool(row["explicit"]),
            "track_genre": str(row["track_genre"]),
            "danceability": float(row["danceability"]),
            "energy": float(row["energy"]),
            "key": int(row["key"]),
            "loudness": float(row["loudness"]),
            "mode": int(row["mode"]),
            "speechiness": float(row["speechiness"]),
            "acousticness": float(row["acousticness"]),
            "instrumentalness": float(row["instrumentalness"]),
            "liveness": float(row["liveness"]),
            "valence": float(row["valence"]),
            "tempo": float(row["tempo"]),
            "time_signature": int(row["time_signature"]),
        }

    def get_song_by_id(self, track_id: str) -> Dict[str, Any]:
        """Get a single song by its track_id"""
        song = self.df[self.df["track_id"] == track_id]
        if song.empty:
            raise ValueError(f"Song with track_id {track_id} not found")
        return self._convert_row_to_dict(song.iloc[0])
