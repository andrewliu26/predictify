# Predictify: Spotify Listening History Analysis and Song Recommendation System

## Project Description

The application will use machine learning techniques to cluster users with similar music preferences and recommend new tracks they are likely to enjoy. The core idea is to build a robust recommendation engine that goes beyond basic song suggestion algorithms by using a combination of content-based filtering, collaborative filtering, and clustering. 

The project will focus on collecting Spotify listening data via the Spotify API, processing and organizing the data, and building an interactive front-end for users to see their music clusters and personalized song recommendations.

## Project Goals

- **Primary Goal**: Create a recommendation system that predicts and recommends songs for individual users based on their Spotify listening history.
- **Specific Goals**:
  1. Collect and preprocess detailed listening data from the Spotify Web API, including features like track metadata, listening frequency, and user preferences.
  2. Use KMeans clustering to group users based on similar listening habits, leveraging song characteristics such as tempo, energy, and valence.
  3. Implement a hybrid recommendation system that combines collaborative filtering (predicting user preferences based on similar users) and content-based filtering (analyzing song attributes).
  4. Visualize user clusters and song recommendations through an intuitive, interactive front-end built with React.
  5. Evaluate the recommendation system’s performance using appropriate metrics such as Mean Average Precision (MAP) and Root Mean Squared Error (RMSE).

## Data Collection

- **Data Source**: Spotify listening history, obtained through the Spotify Web API.
  
- **Data Collection Method**:
  1. **User Authorization**: Users will authenticate with their Spotify accounts to grant access to their listening history.
  2. **Data Points**: 
     - Track metadata (track ID, title, artist, album, popularity score, genre, release date)
     - Audio features (tempo, energy, valence, loudness, key, danceability, acousticness, instrumentalness)
     - Timestamps (listening frequency, time of day, and day of the week)
     - Explicit user actions (likes, skips, or replays)
  3. **Data Volume**: Aiming for a dataset with at least 10,000 individual song plays across multiple users to build and test the models.

- **Data Preprocessing**: Data cleaning will involve filtering incomplete or duplicate records, normalizing audio features, and structuring the dataset into time series for analysis. The timestamps will be aggregated to extract meaningful patterns, such as peak listening times or seasonal shifts in musical preferences.

## Modeling Plan

- **Clustering**:
  1. **KMeans Clustering**: Initially, users will be clustered based on their listening habits using KMeans clustering. Feature vectors for each user will be created based on the normalized song attributes (e.g., tempo, energy) and metadata (e.g., genre).
  2. **KMeans++ Initialization**: Will be used to improve cluster initialization and ensure the clusters are well-separated.
  3. **Farthest First Initialization**: Another method to compare performance against KMeans++.

- **Recommendation Model**:
  1. **Collaborative Filtering**: Use matrix factorization techniques to predict song preferences based on the listening behavior of users within the same cluster.
  
- **Model Evaluation**:
  - **Mean Average Precision (MAP)**: Measure the ranking accuracy of the recommendation system.
  - **Root Mean Squared Error (RMSE)**: Used for predicting song preferences, minimizing the error between predicted and actual user ratings.
  
## Data Visualization Plan

- **Clustering Visualization**:
  1. **PCA and t-SNE**: Use dimensionality reduction techniques to visualize clusters of users with similar listening preferences in a two-dimensional space.
  2. **Interactive Plots**: Allow users to explore their position in the listening clusters and identify other users with similar music tastes.

- **Song Recommendation Visualization**:
  1. **Scatter Plots**: Show relationships between features such as tempo and popularity for recommended songs. 
  2. **Song Cards**: Display recommended tracks with metadata and audio feature breakdowns, such as how the song's tempo and energy match the user’s historical preferences.
  3. **User Dashboard**: Provide a user-friendly dashboard where users can see their music trends, top genres, and daily listening patterns.

## Test Plan

- **Train-Test Split**:
  1. **Initial Split**: Withhold 20% of the dataset as a test set. The remaining 80% will be used for model training.
  2. **Time-Based Validation**: Train on listening data collected in the first 4 weeks of the study and test on data from the following two weeks.
  
- **Evaluation Metrics**:
  - **MAP (Mean Average Precision)**: Used to evaluate the relevance of recommended songs.
  - **RMSE (Root Mean Squared Error)**: Measure accuracy in predicting song ratings or preferences.
  
- **User Feedback**: Deploy a beta version of the app and collect feedback on song recommendations. User satisfaction with the recommendations will be used as a secondary metric for evaluation.

## Conclusion

This project aims to deliver a sophisticated, data-driven song recommendation system that personalizes music suggestions based on detailed user data from Spotify. The project will involve data collection, clustering, and hybrid recommendation models, while providing interactive visualizations for users. Over the two-month development period, the goal is to create a functional web app that efficiently predicts and recommends songs while providing users with an engaging experience.
