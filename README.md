# Predictify: Spotify Listening History Analysis and Song Recommendation System

## Project Description

Predictify is a music recommendation app that analyzes users' Spotify listening histories and suggests new tracks based on song attributes like tempo, energy, and mood. The app will collect listening data, process it, and provide song recommendations through a user-friendly interface.

## Project Goals

- **Primary Goal**: Recommend songs based on users’ Spotify listening history using content-based filtering.
- **Specific Goals**:
  1. Collect listening data from Spotify, including song metadata and audio features.
  2. Analyze user listening habits based on features like tempo and energy.
  3. Build a content-based recommendation model to suggest similar songs.
  4. Create a simple interface where users can view their music trends and recommendations.

## Data Collection

- **Source**: [Kaggle Spotify tracks dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset/data)
  - (Changed due to [Spotify's developer policy](https://developer.spotify.com/terms#section-iv-restrictions:~:text=Misuse%20of%20the,or%20AI%20model%3B) against using Spotify content for machine learning model training).
- **Collected Data**: 
  - Song metadata (track title, artist, album, etc.)
  - Audio features (tempo, energy, mood, etc.)
  - Timestamps (listening frequency and time of day)
  
- **Data Preprocessing**: Clean the data, normalize audio features, and extract useful patterns from listening habits.

## Recommendation Model

- **Content-Based Filtering**: Recommend songs similar to the user's listening history by comparing song attributes.
- **Cosine Similarity**: Measure similarity between songs based on audio features to generate recommendations.

## Visualization

- **Music Trends**: Display users' top genres, preferred listening times, and audio features like tempo and energy.
- **Song Recommendations**: Show recommended tracks along with details on how they match the user’s history.

## Testing

- **Train-Test Split**: Use 80% of the data for training and 20% for testing.
- **Metrics**: Use Mean Average Precision (MAP) to evaluate how well the recommendations match user preferences.

## Conclusion

Predictify aims to build a simple yet effective music recommendation system that helps users discover new songs based on their listening habits. The project will involve data collection, content-based filtering, and interactive visualizations in an easy-to-use web app.
