from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.song_handler import SongHandler
from app.models import SongResponse, Song, ErrorResponse
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Music Recommendation API",
    description="API for searching songs and getting recommendations based on audio features",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize song handler
csv_path = os.path.join(os.path.dirname(__file__), "data", "spotify_data_cleaned.csv")
song_handler = None


@app.on_event("startup")
async def startup_event():
    global song_handler
    try:
        logger.info("Loading data and initializing model...")
        song_handler = SongHandler(csv_path)

        # Generate evaluation report
        logger.info("Generating model evaluation report...")
        evaluation_path = os.path.join(os.path.dirname(__file__), "evaluation_report")
        song_handler.recommender.generate_evaluation_report(evaluation_path)
        logger.info(f"Evaluation report saved to {evaluation_path}")

    except Exception as e:
        logger.error(f"Failed to initialize: {str(e)}")
        raise


@app.get("/api/songs/search", response_model=SongResponse)
async def search_songs(q: str, limit: int = 10):
    """Search for songs by track name or artist"""
    logger.info(f"Searching for: {q}")
    if len(q) < 2:
        return SongResponse(songs=[], total=0)
    try:
        songs = [Song(**song_dict) for song_dict in song_handler.search_songs(q, limit)]
        return SongResponse(songs=songs, total=len(songs))
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/songs/{track_id}", response_model=Song)
async def get_song(track_id: str):
    """Get a single song by its track_id"""
    logger.info(f"Fetching song: {track_id}")
    try:
        song_dict = song_handler.get_song_by_id(track_id)
        return Song(**song_dict)
    except ValueError as e:
        logger.error(f"Song not found: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching song: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/songs/recommendations/{track_id}", response_model=SongResponse)
async def get_recommendations(track_id: str, limit: int = 5):
    """Get song recommendations based on audio features"""
    logger.info(f"Getting recommendations for: {track_id}")
    try:
        recommendations = song_handler.get_recommendations(track_id, limit)
        if not recommendations:
            raise ValueError("No recommendations found for the given track ID")

        # Convert to list of Songs
        songs = []
        for rec in recommendations:
            audio = rec.get("audio_features", {})
            song_data = {
                "track_id": str(rec["track_id"]),
                "track_name": str(rec["track_name"]),
                "artists": str(rec["artists"]),
                "album_name": str(rec["album_name"]),
                "track_genre": str(rec["track_genre"]),
                # Add other fields that you don't have from recommendations as defaults if necessary
                "popularity": 0,
                "duration_ms": 0,
                "explicit": False,
                "danceability": float(audio.get("danceability", 0.0)),
                "energy": float(audio.get("energy", 0.0)),
                "key": 0,  # If you don't have these from rec, it's okay to keep them 0 or any default
                "loudness": 0.0,
                "mode": 0,
                "speechiness": 0.0,
                "acousticness": float(audio.get("acousticness", 0.0)),
                "instrumentalness": float(audio.get("instrumentalness", 0.0)),
                "liveness": float(audio.get("liveness", 0.0)),
                "valence": float(audio.get("valence", 0.0)),
                "tempo": 0.0,
                "time_signature": 4,
            }
            songs.append(Song(**song_data))

        return SongResponse(songs=songs, total=len(songs))

    except ValueError as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
