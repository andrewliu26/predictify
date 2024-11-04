// pages/api/spotify.ts
import type { NextApiRequest, NextApiResponse } from "next";

async function fetchSpotifyData(url: string, token: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Spotify API error:", response.status, errorDetails);
      throw new Error("Failed to fetch data from Spotify");
    }

    return response.json();
  } catch (error) {
    console.error("Error in Spotify API handler:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, token } = req.body;

  let url = "";
  if (type === "recentlyPlayed") {
    url = "https://api.spotify.com/v1/me/player/recently-played";
  } else if (type === "savedTracks") {
    url = "https://api.spotify.com/v1/me/tracks";
  } else {
    res.status(400).json({ error: "Invalid type" });
    return;
  }

  try {
    const data = await fetchSpotifyData(url, token);
    res.status(200).json(data.items);
  } catch (error) {
    console.error("Error in Spotify API handler:", error);
    res.status(500).json({ error: "Failed to fetch data from Spotify" });
  }
}
