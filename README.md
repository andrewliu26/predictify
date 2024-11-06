# Predictify: Spotify Music Recommendation System

### [Midterm Demo](https://www.youtube.com/watch?v=tQtJyXIZlVc)

## Table of Contents

- [Project Description](#project-description)
- [Project Goals](#project-goals)
- [Data](#data)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Recommendation System](#recommendation-system)
  - [Feature Engineering](#feature-engineering)
- [Development Notes](#development-notes)
- [Future Improvements](#future-improvements)
- [Conclusion](#conclusion)

## Project Description

Predictify is a web application that analyzes users' Spotify most listened to tracks and recommends new tracks using a hybrid machine learning approach. The system combines K-means clustering with content-based filtering, enhanced by Spotify's audio features API to suggest songs that match the user's music preferences.

## Project Goals

- **Primary Goal**: Recommend songs based on users' Spotify listening history.
- **Specific Goals**:
  1. Collect listening data from Spotify, including song metadata and audio features.
  2. Analyze user listening habits based on key audio features.
  3. Build a content-based recommendation model to suggest similar songs.
  4. Create a simple interface where users can view their music trends and recommendations.

## Data

Due to [Spotify's developer policy](https://developer.spotify.com/terms#section-iv-restrictions:~:text=Misuse%20of%20the,or%20AI%20model%3B) against using Spotify Content (such as track metadata and audio features) for machine learning and AI training, I'm using this [Kaggle dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset/data) from 2022 with 114,000 Spotify tracks to train and test the model.

## Features

- Spotify OAuth integration for secure user authentication
- Display of user's top tracks
- Advanced hybrid recommendation engine combining:
  - K-means clustering for grouping similar songs
  - Content-based filtering using audio features
  - Adjustable weights between clustering and content similarity

## Tech Stack

- **Frontend**:
  - Next.js 13+ with App Router
  - TypeScript
  - TailwindCSS
- **Backend**:
  - Flask
  - Python 3.11+
  - scikit-learn for ML models
- **APIs**:
  - Spotify Web API
- **ML Components**:
  - K-means clustering for song grouping
  - Cosine similarity for content-based filtering
  - Feature scaling with StandardScaler

## Setup and Installation

### Prerequisites

- Node.js (v20.15.0 or higher)
- Python (v3.11.5 or higher)
- Spotify Developer Account

### Running the Application

**Note:** In its current state, the app cannot be run locally or remotely by machines other than mine since it requires the client id and secret for my Spotify Developer project.

1. Start the backend server:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The backend will run on http://127.0.0.1:5000

2. Start the frontend server (in a new terminal):

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:3000

3. Visit http://localhost:3000 in browser to use the application

## Project Structure

```
predictify/
├── frontend/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── api/               # API endpoints
│   │   │   ├── recommendations/  # ML model integration
│   │   │   ├── spotify/         # Spotify API handlers
│   │   │   └── getSpotifyToken/ # OAuth token management
│   │   ├── callback/          # Spotify OAuth callback
│   │   └── dashboard/         # Main application interface
│   └── package.json           # Frontend dependencies
└── backend/
    ├── app.py                 # Flask server
    ├── recommendation_model.py # Hybrid ML model
    ├── spotify_data.csv       # Training dataset
    └── requirements.txt       # Backend dependencies
```

## How It Works

### Recommendation System

The application uses a hybrid recommendation approach:

1. **K-means Clustering**

   - Groups songs with similar audio features
   - Identifies cluster centers that represent typical feature combinations
   - Assigns new songs to the most appropriate cluster

2. **Content-Based Filtering**

   - Calculates cosine similarity between songs
   - Compares audio features directly
   - Finds similar songs regardless of cluster assignment

3. **Hybrid Integration**
   - Combines both approaches with adjustable weights
   - Default: 60% clustering, 40% content-based
   - Allows fine-tuning of recommendations

### Feature Engineering

The model considers key Spotify audio features:

- Danceability
- Energy
- Valence (musical positiveness)
- Tempo
- Instrumentalness

## Development Notes

- The ML model is trained on startup using the spotify_data.csv dataset
- Recommendations combine ML predictions with Spotify's recommendation API endpoint

## Future Improvements

- Enhanced user interface with more detailed music analytics
- Expanded feature set for more precise recommendations
- Additional recommendation algorithms (e.g., collaborative filtering)

## Conclusion

So far, I've implemented a simple music recommendation system that helps users discover new songs based on their listening habits. The project combines data processing, content-based filtering, and interactive visualizations in an easy-to-use web app, leveraging both K-means clustering and content-based filtering for more accurate recommendations. I plan to further improve the model and web interface to make this a more effective and useful application.
