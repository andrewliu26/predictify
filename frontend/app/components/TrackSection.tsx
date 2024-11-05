import React from "react";
import Image from "next/image";

interface Artist {
    name: string;
}

interface Album {
    images: { url: string }[];
}

interface TrackItem {
    name: string;
    artists: Artist[];
    album: Album;
}

interface TrackSectionProps {
    title: string;
    subtitle?: string;
    tracks: TrackItem[];
}

const TrackSection: React.FC<TrackSectionProps> = ({ title, subtitle, tracks }) => {
    return (
        <div className="rounded-lg p-6 shadow-md" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: "var(--highlight-text)" }}>{title}</h2>
                {subtitle && <span className="text-sm" style={{ color: "var(--primary-text)" }}>{subtitle}</span>}
            </div>
            <ul className="space-y-3">
                {tracks.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0"
                        style={{ borderColor: "var(--card-border)" }}
                    >
                        {title === "Top Tracks" && <span className="text-lg font-bold mr-4">{index + 1}</span>}
                        <Image
                            src={item.album.images[0].url}
                            alt={`${item.name} album cover`}
                            width={48}
                            height={48}
                            className="rounded mr-4"
                        />
                        <div className="flex-grow">
                            <strong className="block text-lg">{item.name ?? "Unknown Track"}</strong>
                            <span style={{ color: "var(--primary-text)" }}>
                                {item.artists.map((a: Artist) => a.name).join(", ") || "Unknown Artist"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackSection;
