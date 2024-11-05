"use client";

import React, { useEffect, useState } from "react";
import TrackSection from "@/app/components/TrackSection";
import DataVisualizations from "@/app/components/DataVisualizations";

interface Artist {
  name: string;
}

interface Album {
  images: { url: string }[];
}

interface TrackItem {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  url: string;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  instrumentalness: number;
}

interface RecentlyPlayedItem {
  track: TrackItem;
}

interface TopTrackItem {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  url: string;
}

async function fetchAudioFeatures(tracks: TrackItem[], token: string) {
  const trackIds = tracks.map(track => track.id);
  
  try {
    const response = await fetch('/api/spotify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'audioFeatures',
        token,
        trackIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audio features');
    }

    const data = await response.json();
    console.log('Audio Features Response:', data); // Added console.log
    return data.audio_features || [];
  } catch (error) {
    console.error('Error fetching audio features:', error);
    return [];
  }
}

export default function Dashboard() {
  const [recentTracks, setRecentTracks] = useState<TrackItem[]>([]);
  const [topTracks, setTopTracks] = useState<TrackItem[]>([]);
  const [recommendations, setRecommendations] = useState<TrackItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSpotifyData = async (type: string, token: string) => {
    try {
      const response = await fetch("/api/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, token }),
      });

      const data: RecentlyPlayedItem[] | TopTrackItem[] = await response.json();

      const normalizedData = data.map((item) => {
        const track = (item as RecentlyPlayedItem).track || (item as TopTrackItem);
        return {
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          url: `https://open.spotify.com/track/${track.id}`,
          danceability: 0,
          energy: 0,
          valence: 0,
          tempo: 0,
          instrumentalness: 0,
        };
      });

      return normalizedData;
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
      setError("Failed to fetch data.");
      return [];
    }
  };

  const fetchRecommendations = async () => {
    try {
        // Calculate average features from top tracks
        const avgFeatures = topTracks.reduce((acc, track) => {
            acc.danceability += track.danceability || 0;
            acc.energy += track.energy || 0;
            acc.tempo += track.tempo || 0;
            acc.valence += track.valence || 0;
            acc.instrumentalness += track.instrumentalness || 0;
            return acc;
        }, {
            danceability: 0,
            energy: 0,
            tempo: 0,
            valence: 0,
            instrumentalness: 0
        });

        // Calculate averages
        const numTracks = topTracks.length;
        (Object.keys(avgFeatures) as Array<keyof typeof avgFeatures>).forEach(key => {
            avgFeatures[key] /= numTracks;
        });

        const response = await fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(avgFeatures),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("spotifyToken");
        if (!token) {
          setError("No access token found");
          return;
        }

        // Fetch top tracks
        const topTracksData = await fetchSpotifyData("topTracks", token);
        console.log("Top Tracks Raw Data:", topTracksData); // Added log

        if (topTracksData.length) {
          const audioFeatures = await fetchAudioFeatures(topTracksData, token);
          console.log("Audio Features:", audioFeatures); // Added log
          
          // Merge audio features with track data
          const tracksWithFeatures = topTracksData.map((track, index) => {
            const merged = {
              ...track,
              ...audioFeatures[index]
            };
            console.log("Merged Track Data:", merged); // Added log
            return merged;
          });

          setTopTracks(tracksWithFeatures);
        }

        // Fetch recently played
        const recentlyPlayedData = await fetchSpotifyData("recentlyPlayed", token);
        setRecentTracks(recentlyPlayedData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    window.location.href = "/";
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
    );
  }

  return (
      <div className="p-8 min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <div className="max-w-5xl mx-auto w-full flex-grow">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "var(--highlight-text)" }}>Dashboard</h1>
            <button
                onClick={handleLogout}
                className="px-4 py-3 bg-foreground text-background font-semibold rounded-full hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors flex items-center gap-2"
            >
              <span className="ml-1">Log Out</span>
              <svg
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16px"
                  height="16px"
                  viewBox="0 0 52 52"
                  className="ml-1"
              >
                <path d="M21,48.5v-3c0-0.8-0.7-1.5-1.5-1.5h-10C8.7,44,8,43.3,8,42.5v-33C8,8.7,8.7,8,9.5,8h10 C20.3,8,21,7.3,21,6.5v-3C21,2.7,20.3,2,19.5,2H6C3.8,2,2,3.8,2,6v40c0,2.2,1.8,4,4,4h13.5C20.3,50,21,49.3,21,48.5z" />
                <path d="M49.6,27c0.6-0.6,0.6-1.5,0-2.1L36.1,11.4c-0.6-0.6-1.5-0.6-2.1,0l-2.1,2.1c-0.6,0.6-0.6,1.5,0,2.1l5.6,5.6 c0.6,0.6,0.2,1.7-0.7,1.7H15.5c-0.8,0-1.5,0.6-1.5,1.4v3c0,0.8,0.7,1.6,1.5,1.6h21.2c0.9,0,1.3,1.1,0.7,1.7l-5.6,5.6 c-0.6,0.6-0.6,1.5,0,2.1l2.1,2.1c0.6,0.6,1.5,0.6,2.1,0L49.6,27z" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <TrackSection title="Top Tracks" subtitle="in the last 6 months" tracks={topTracks} />
            <TrackSection title="Recently Played Tracks" tracks={recentTracks} />
          </div>

          <DataVisualizations tracks={[...topTracks, ...recentTracks]} />

          {recommendations.length > 0 && (
            <div className="mt-8">
              <TrackSection title="Recommended Tracks" subtitle="based on your music taste" tracks={recommendations} />
            </div>
          )}
        </div>
        
        <footer className="mt-12 mb-4 text-center text-sm opacity-70">
          All music data and artwork provided by <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer" className="underline opacity-100 hover:opacity-70">Spotify</a>. Spotify® is a registered trademark of Spotify AB.
        </footer>
      </div>
  );
}
