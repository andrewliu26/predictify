"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Callback() {
  const router = useRouter();

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
        });
    } else {
      console.error("No authorization code in URL");
    }
  }, [router]);

  return <div>Loading...</div>;
}
