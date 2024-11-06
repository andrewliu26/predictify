import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, seedTracks, targetFeatures } = await request.json();
    
    // Convert targetFeatures to array format
    const tracksArray = [targetFeatures];

    console.log("Sending to ML model:", {
      tracks: tracksArray
    });

    // First, get recommended features from our ML model
    const mlResponse = await fetch('http://127.0.0.1:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracks: tracksArray
      })
    });

    // Log the raw response
    console.log("ML Response status:", mlResponse.status);
    const responseText = await mlResponse.text();
    console.log("ML Response text:", responseText);

    if (!mlResponse.ok) {
      throw new Error(`ML model recommendation failed (${mlResponse.status}): ${responseText}`);
    }

    // Parse the response text as JSON
    const mlData = JSON.parse(responseText);
    const recommendedFeatures = mlData.recommended_features;
    
    // Use these ML-generated features to query Spotify
    const queryParams = new URLSearchParams({
        seed_tracks: seedTracks.join(','),
        target_danceability: recommendedFeatures.danceability.toString(),
        target_energy: recommendedFeatures.energy.toString(),
        target_tempo: recommendedFeatures.tempo.toString(),
        target_valence: recommendedFeatures.valence.toString(),
        target_instrumentalness: recommendedFeatures.instrumentalness.toString(),
        limit: '20'
    }).toString();

    const response = await fetch(`https://api.spotify.com/v1/recommendations?${queryParams}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.tracks);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}