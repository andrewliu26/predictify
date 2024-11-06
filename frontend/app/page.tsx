"use client";

export default function LandingPage() {
    const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = "http://localhost:3000/callback";
    const SCOPES = [
        "user-read-recently-played",
        "user-top-read",
        "user-read-currently-playing",
    ].join("%20");

    const loginUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&show_dialog=true`;

    const handleLogin = () => {
        if (!SPOTIFY_CLIENT_ID) {
            console.error("Spotify Client ID is missing.");
            return;
        }
        window.location.href = loginUrl;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
            <h1 className="text-4xl font-bold">Predictify</h1>
            <p className="text-lg text-center max-w-md">
                Find your next favorite song
            </p>
            <button
                onClick={handleLogin}
                className="rounded-full bg-foreground text-background px-6 py-3 text-lg hover:bg-[#ccc] transition-colors flex items-center gap-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-1"
                >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Get Started
            </button>
        </div>
    );
}
