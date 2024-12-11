import { Song } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SongDetailsProps {
    song: Song | null;
}
export function SongDetails({ song }: SongDetailsProps) {
    const getFeatureData = (song: Song) => {
        const features = {
            danceability: song.audio_features?.danceability ?? song.danceability ?? 0,
            energy: song.audio_features?.energy ?? song.energy ?? 0,
            valence: song.audio_features?.valence ?? song.valence ?? 0,
            acousticness: song.audio_features?.acousticness ?? song.acousticness ?? 0,
            instrumentalness: song.audio_features?.instrumentalness ?? song.instrumentalness ?? 0,
            liveness: song.audio_features?.liveness ?? song.liveness ?? 0,
        };
    
        return [
            { name: "Danceability", value: features.danceability * 100 },
            { name: "Energy", value: features.energy * 100 },
            { name: "Valence", value: features.valence * 100 },
            { name: "Acousticness", value: features.acousticness * 100 },
            { name: "Instrumentalness", value: features.instrumentalness * 100 },
            { name: "Liveness", value: features.liveness * 100 },
        ];
    };    

    return (
        <div>
            {song ? (
                <>
                    <h3 className="text-xl font-bold mb-2">{song.track_name}</h3>
                    <p className="text-gray-600 mb-1">{song.artists}</p>
                    <p className="text-gray-500 mb-4 text-sm">
                        {song.album_name} • {song.track_genre}
                    </p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getFeatureData(song)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip formatter={(value) => `${Math.round(Number(value))}%`} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500">
                    Search and select a song to see its details
                </div>
            )}
        </div>
    );
}