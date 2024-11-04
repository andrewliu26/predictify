"use client";

import React from "react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [savedTracks, setSavedTracks] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSpotifyData = async (type: string) => {
    const token = localStorage.getItem("spotifyToken");

    if (!token) {
      setError("No Spotify access token found.");
      return;
    }

    try {
      const response = await fetch("/api/spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, token }),
      });
      const data = await response.json();
      if (type === "recentlyPlayed") {
        setRecentTracks(data);
      } else if (type === "savedTracks") {
        setSavedTracks(data);
      }
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
      setError("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchSpotifyData("recentlyPlayed").then();
    fetchSpotifyData("savedTracks").then();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spotifyToken");
    window.location.href = "/"; // Redirect to the landing page
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <button onClick={handleLogout} className="mb-4 p-2 bg-red-500 text-white rounded">
        Log Out
      </button>
      <h1 className="text-2xl font-bold mb-4">Recently Played Tracks</h1>
      <ul>
        {recentTracks.map((item: any, index: number) => (
          <li key={index}>
            <strong>{item.track.name}</strong> by {item.track.artists.map((a: any) => a.name).join(", ")}
          </li>
        ))}
      </ul>
      <h1 className="text-2xl font-bold mt-8 mb-4">Saved Tracks</h1>
      <ul>
        {Array.isArray(savedTracks) ? (
          savedTracks.map((item: any, index: number) => (
            <li key={index}>
              <strong>{item.track.name}</strong> by {item.track.artists.map((a: any) => a.name).join(", ")}
            </li>
          ))
        ) : (
          <li>No saved tracks available.</li>
        )}
      </ul>
    </div>
  );
}
