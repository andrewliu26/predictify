"use client";

import React, { useEffect, useState } from "react";
import TrackSection from "@/app/components/TrackSection";
import DataVisualizations from "@/app/components/DataVisualizations";
import { useRouter } from "next/navigation";

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
  loudness: number;
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

export default function Dashboard() {
  const router = useRouter();
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

      // Get track IDs for audio features
      const trackIds = data.map((item) => {
        const track = (item as RecentlyPlayedItem).track || (item as TopTrackItem);
        return track.id;
      });

      // Fetch audio features
      const audioFeaturesResponse = await fetch("/api/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "audioFeatures", 
          token,
          trackIds 
        }),
      });

      const audioFeatures = await audioFeaturesResponse.json();
      console.log("Audio features response:", audioFeatures); // Debug log

      // Map the audio features to tracks
      const normalizedData = data.map((item, index) => {
        const track = (item as RecentlyPlayedItem).track || (item as TopTrackItem);
        const features = audioFeatures.audio_features?.[index] || {};
        
        return {
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          url: `https://open.spotify.com/track/${track.id}`,
          danceability: features.danceability || 0,
          energy: features.energy || 0,
          valence: features.valence || 0,
          loudness: features.loudness ? (features.loudness + 60) / 60 : 0,
          instrumentalness: features.instrumentalness || 0
        };
      });

      return normalizedData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const fetchRecommendations = async () => {
    try {
        console.log("Fetching recommendations...");
        const token = localStorage.getItem("spotifyToken");
        if (!token) return;

        // Get seed tracks (up to 5 track IDs from top tracks)
        const seedTracks = topTracks.slice(0, 5).map(track => track.id);
        
        // Calculate average features from top tracks
        const avgFeatures = topTracks.reduce((acc, track) => {
            acc.danceability += track.danceability || 0;
            acc.energy += track.energy || 0;
            acc.loudness += track.loudness || 0;
            acc.valence += track.valence || 0;
            acc.instrumentalness += track.instrumentalness || 0;
            return acc;
        }, {
            danceability: 0,
            energy: 0,
            loudness: 0,
            valence: 0,
            instrumentalness: 0
        });

        // Calculate averages
        const numTracks = topTracks.length;
        Object.keys(avgFeatures).forEach(key => {
            avgFeatures[key as keyof typeof avgFeatures] /= numTracks;
        });

        const response = await fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                seedTracks,
                targetFeatures: avgFeatures
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setRecommendations(data);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("spotifyToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [topTracksData, recentlyPlayedData] = await Promise.all([
          fetchSpotifyData("topTracks", token),
          fetchSpotifyData("recentlyPlayed", token)
        ]);

        setTopTracks(topTracksData);
        setRecentTracks(recentlyPlayedData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separate useEffect for fetching recommendations after topTracks are set
  useEffect(() => {
    if (topTracks.length > 0) {
      console.log("Top tracks updated, fetching recommendations");
      fetchRecommendations();
    }
  }, [topTracks]);

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    window.location.href = "/";
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
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

          {recommendations && recommendations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--highlight-text)" }}>Recommended Tracks</h2>
              <div className="rounded-lg p-6 shadow-md" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((track, index) => (
                    <a 
                      key={index}
                      href={`https://open.spotify.com/track/${track.id}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="p-4 rounded-md hover:scale-[1.02] transition-transform flex items-center gap-4 group"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                    >
                      <img 
                        src={track.album.images[0]?.url} 
                        alt={`${track.name} album art`}
                        className="w-16 h-16 rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{track.name}</h3>
                        <p style={{ color: "var(--primary-text)" }} className="truncate">
                          {track.artists.map(a => a.name).join(", ")}
                        </p>
                      </div>
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M20 14a1 1 0 0 0-1 1v3.077c0 .459-.022.57-.082.684a.363.363 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.571-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684L4.999 5.5a.5.5 0 0 1 .5-.5l3.5.005a1 1 0 1 0 .002-2L5.501 3a2.5 2.5 0 0 0-2.502 2.5v12.577c0 .76.083 1.185.32 1.627.223.419.558.753.977.977.442.237.866.319 1.627.319h12.154c.76 0 1.185-.082 1.627-.319.419-.224.753-.558.977-.977.237-.442.319-.866.319-1.627V15a1 1 0 0 0-1-1zm-2-9.055v-.291l-.39.09A10 10 0 0 1 15.36 5H14a1 1 0 1 1 0-2l5.5.003a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 1 1-2 0V8.639c0-.757.086-1.511.256-2.249l.09-.39h-.295a10 10 0 0 1-1.411 1.775l-5.933 5.932a1 1 0 0 1-1.414-1.414l5.944-5.944A10 10 0 0 1 18 4.945z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-12 mb-4 text-center text-sm opacity-70">
          All music data and artwork provided by <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer" className="underline opacity-100 hover:opacity-70">Spotify</a>. Spotify® is a registered trademark of Spotify AB.
        </footer>
      </div>
  );
}
