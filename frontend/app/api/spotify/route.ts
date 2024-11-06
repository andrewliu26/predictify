import { NextRequest, NextResponse } from "next/server";

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
    return data.items || data;
  } catch (error) {
    console.error("Error in Spotify API handler:", error);
    return { error: "Failed to fetch data from Spotify" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, token, trackIds } = body;

    let url = "";
    if (type === "recentlyPlayed") {
      url = "https://api.spotify.com/v1/me/player/recently-played";
    } else if (type === "topTracks") {
      url = "https://api.spotify.com/v1/me/top/tracks";
    } else if (type === "topArtists") {
      url = "https://api.spotify.com/v1/me/top/artists";
    } else if (type === "audioFeatures" && trackIds) {
      console.log("Requesting audio features for tracks:", trackIds);
      url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const data = await fetchSpotifyData(url, token);
    //console.log("Spotify API Response:", data);

    if (data && !data.error) {
      return NextResponse.json(data);
    } else {
      console.error("Spotify API Error:", data.error);
      return NextResponse.json(
        { error: data.error || "Failed to fetch data from Spotify" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in Spotify API route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
