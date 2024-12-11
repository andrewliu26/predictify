from pydantic import BaseModel
from typing import List, Optional

class Song(BaseModel):
    track_id: str
    artists: str
    album_name: str
    track_name: str
    popularity: int
    duration_ms: int
    explicit: bool
    track_genre: str
    danceability: float
    energy: float
    key: int
    loudness: float
    mode: int
    speechiness: float
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float
    time_signature: int

class SongResponse(BaseModel):
    songs: List[Song]
    total: int

class ErrorResponse(BaseModel):
    detail: str