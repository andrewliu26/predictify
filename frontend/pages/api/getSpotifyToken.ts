import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.body;
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify token exchange error:", errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.status(200).json(data); // Return the access token and refresh token
  } catch (error) {
    console.error("Error in token exchange:", error);
    res.status(500).json({ error: "Failed to fetch token from Spotify" });
  }
}
