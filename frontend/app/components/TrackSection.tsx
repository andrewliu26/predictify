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
    url: string;
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
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md flex items-center w-full hover:scale-[1.02] transition-transform group"
                        >
                            {title === "Top Tracks" && <span className="text-lg font-bold mr-5">{index + 1}</span>}
                            <Image
                                src={item.album.images[0].url}
                                alt={`${item.name} album cover`}
                                width={48}
                                height={48}
                                className="rounded-[2px] md:rounded-[4px] mr-4"
                            />
                            <div className="flex-grow overflow-hidden">
                                <strong className="block text-lg truncate pr-4">{item.name ?? "Unknown Track"}</strong>
                                <span className="block truncate pr-4" style={{ color: "var(--primary-text)" }}>
                                    {item.artists.map((a: Artist) => a.name).join(", ") || "Unknown Artist"}
                                </span>
                            </div>
                            <svg
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 14a1 1 0 0 0-1 1v3.077c0 .459-.022.57-.082.684a.363.363 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.571-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684L4.999 5.5a.5.5 0 0 1 .5-.5l3.5.005a1 1 0 1 0 .002-2L5.501 3a2.5 2.5 0 0 0-2.502 2.5v12.577c0 .76.083 1.185.32 1.627.223.419.558.753.977.977.442.237.866.319 1.627.319h12.154c.76 0 1.185-.082 1.627-.319.419-.224.753-.558.977-.977.237-.442.319-.866.319-1.627V15a1 1 0 0 0-1-1zm-2-9.055v-.291l-.39.09A10 10 0 0 1 15.36 5H14a1 1 0 1 1 0-2l5.5.003a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 1 1-2 0V8.639c0-.757.086-1.511.256-2.249l.09-.39h-.295a10 10 0 0 1-1.411 1.775l-5.933 5.932a1 1 0 0 1-1.414-1.414l5.944-5.944A10 10 0 0 1 18 4.945z"
                                    fill="currentColor"
                                />
                            </svg>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackSection;
