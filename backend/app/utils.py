import pandas as pd
from typing import Dict, Any


def normalize_features(df: pd.DataFrame, feature_columns: list) -> pd.DataFrame:
    """Normalize numerical features to a 0-1 range"""
    df_normalized = df.copy()
    for column in feature_columns:
        if df[column].max() != df[column].min():
            df_normalized[column] = (df[column] - df[column].min()) / (
                df[column].max() - df[column].min()
            )
    return df_normalized


def convert_row_to_song_dict(row: pd.Series) -> Dict[str, Any]:
    """Convert a DataFrame row to a Song dictionary"""
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
