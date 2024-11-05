import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.scdn.co', // Allow images from Spotify's CDN
                port: '',
                pathname: '/**',
            },
        ],
    },
    /* other config options here */
};

export default nextConfig;
