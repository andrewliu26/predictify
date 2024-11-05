"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Callback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch("/api/getSpotifyToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch token");
            }
            return response.json();
          })
          .then((data) => {
            localStorage.setItem("spotifyToken", data.access_token);
            router.push("/dashboard");
          })
          .catch((error) => {
            console.error("Error fetching access token:", error);
            setLoading(false);
          });
    } else {
      console.error("No authorization code in URL");
      setLoading(false);
    }
  }, [router]);

  return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {loading ? (
            <div className="flex flex-col items-center">
              <div className="loader mb-4"></div>
            </div>
        ) : (
            <p className="text-lg text-red-500">Failed to retrieve access token. Please try again.</p>
        )}
      </div>
  );
}
