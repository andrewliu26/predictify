import type { NextApiRequest, NextApiResponse } from "next";

async function fetchSpotifyData(url: string, token: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Spotify API error:", response.status, errorDetails);
      return { error: `Spotify API error: ${response.statusText}` };
    }

    const data = await response.json();

    // Return either `data.items` if available, or `data` directly if `items` is not present
    return data.items || data;
  } catch (error) {
    console.error("Error in Spotify API handler:", error);
    return { error: "Failed to fetch data from Spotify" };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, token } = req.body;

  let url = "";
  if (type === "recentlyPlayed") {
    url = "https://api.spotify.com/v1/me/player/recently-played";
  } else if (type === "topTracks") {
    url = "https://api.spotify.com/v1/me/top/tracks";
  } else if (type === "topArtists") {
    url = "https://api.spotify.com/v1/me/top/artists";
  } else {
    res.status(400).json({ error: "Invalid type" });
    return;
  }

  const data = await fetchSpotifyData(url, token);

  if (data && !data.error) {
    res.status(200).json(data);
  } else {
    res.status(500).json({ error: data.error || "Failed to fetch data from Spotify" });
  }
}
