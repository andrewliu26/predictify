"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Callback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      setError("Spotify authentication failed");
      setLoading(false);
      return;
    }

    if (!code) {
      console.error("No authorization code in URL");
      setError("No authorization code received");
      setLoading(false);
      return;
    }

    fetch("/api/getSpotifyToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch token");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.access_token) {
          throw new Error("No access token in response");
        }
        localStorage.setItem("spotifyToken", data.access_token);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.error("Error fetching access token:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="loader mb-4"></div>
          <p className="text-primary-text">Authenticating with Spotify...</p>
        </div>
      ) : (
        <p className="text-lg text-red-500">Failed to retrieve access token. Please try again.</p>
      )}
    </div>
  );
}
