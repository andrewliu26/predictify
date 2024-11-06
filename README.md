# Predictify: Spotify Music Recommendation System

## Project Description

Predictify is a web application that analyzes users' Spotify listening history and recommends new tracks using a hybrid machine learning approach. The system combines K-means clustering with content-based filtering, enhanced by Spotify's audio features API to suggest songs that match the user's music preferences.

## Features

- Spotify OAuth integration for secure user authentication
- Display of user's top tracks
- Advanced hybrid recommendation engine combining:
  - K-means clustering for grouping similar songs
  - Content-based filtering using audio features
  - Adjustable weights between clustering and content similarity
- Real-time song recommendations based on listening patterns

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

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/andrewliu26/predictify.git
cd predictify
```

2. Set up the frontend:

```bash
cd frontend
npm install
```

3. Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/callback
```

4. Set up the backend:

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Application

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

3. Visit http://localhost:3000 in your browser to use the application

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
- Recommendations combine ML predictions with Spotify's API
- Feature weights can be adjusted via the `cluster_weight` parameter

## Future Improvements

- Enhanced user interface with more detailed music analytics
- Expanded feature set for more precise recommendations
- User feedback integration for recommendation refinement
- Mobile responsiveness optimization
- Additional recommendation algorithms (e.g., collaborative filtering)
