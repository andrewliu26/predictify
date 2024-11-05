"use client";

import React, { useEffect, useState } from "react";
import TrackSection from "@/app/components/TrackSection";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Artist {
  name: string;
}

interface Album {
  images: { url: string }[];
}

interface TrackItem {
  name: string;
  artists: Artist[];
  album: Album;
  id: string;
}

interface RecentlyPlayedItem {
  track: TrackItem;
}

interface TopTrackItem {
  name: string;
  artists: Artist[];
  album: Album;
  id: string;
}

interface AudioFeature {
  danceability: number;
  energy: number;
  tempo: number;
  valence: number;
  name: string;
}

export default function Dashboard() {
  const [recentTracks, setRecentTracks] = useState<TrackItem[]>([]);
  const [topTracks, setTopTracks] = useState<TrackItem[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSpotifyData = async (type: string) => {
    const token = localStorage.getItem("spotifyToken");

    if (!token) {
      setError("No Spotify access token found.");
      return;
    }

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
          name: track.name,
          artists: track.artists,
          album: track.album,
          id: track.id,
        };
      });

      if (type === "recentlyPlayed") {
        setRecentTracks(normalizedData);
      } else if (type === "topTracks") {
        setTopTracks(normalizedData);
      }
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioFeatures = async (trackIds: string[]) => {
    const token = localStorage.getItem("spotifyToken");

    if (!token) {
      setError("No Spotify access token found.");
      return;
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/audio-features?ids=" + trackIds.join(","), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      const features: AudioFeature[] = data.audio_features.map((feature: any) => ({
        danceability: feature.danceability,
        energy: feature.energy,
        tempo: feature.tempo,
        valence: feature.valence,
        name: feature.name,
      }));

      setAudioFeatures(features);
    } catch (error) {
      console.error("Error fetching audio features:", error);
      setError("Failed to fetch audio features.");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSpotifyData("recentlyPlayed"), fetchSpotifyData("topTracks")]).then(() => {
      const trackIds = topTracks.map(track => track.id);
      if (trackIds.length) {
        fetchAudioFeatures(trackIds);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    window.location.href = "/";
  };

  const chartData = {
    labels: audioFeatures.map((feature) => feature.name),
    datasets: [
      {
        label: "Danceability",
        data: audioFeatures.map((feature) => feature.danceability),
        borderColor: "#4bc0c0",
        fill: false,
      },
      {
        label: "Energy",
        data: audioFeatures.map((feature) => feature.energy),
        borderColor: "#36a2eb",
        fill: false,
      },
      {
        label: "Tempo",
        data: audioFeatures.map((feature) => feature.tempo),
        borderColor: "#ffcd56",
        fill: false,
      },
      {
        label: "Valence",
        data: audioFeatures.map((feature) => feature.valence),
        borderColor: "#ff6384",
        fill: false,
      },
    ],
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
      <div className="p-8 min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "var(--highlight-text)" }}>Dashboard</h1>
            <button
                onClick={handleLogout}
                className="px-4 py-3 bg-foreground text-background font-semibold rounded-full hover:bg-[#383838] transition-colors flex items-center gap-2"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TrackSection title="Top Tracks" subtitle="past 6 months" tracks={topTracks} />
            <TrackSection title="Recently Played Tracks" tracks={recentTracks} />
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--highlight-text)" }}>Audio Features</h2>
            <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Audio Features of Top Tracks' } } }} />
          </div>
        </div>
      </div>
  );
}
