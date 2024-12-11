"use client";

import { useState, useEffect } from 'react';
import { SearchBar } from '../ui/searchbar';
import { SongDetails } from './details';
import { Song } from '@/lib/types';
import { getRecommendations } from '@/lib/api';
import {Play, Home, Music} from 'lucide-react';

export function Dashboard() {
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [recommendations, setRecommendations] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!selectedSong) return;
    
            setIsLoading(true);
            setError(null);
            try {
                const response = await getRecommendations(selectedSong.track_id);
    
                const uniqueRecommendations = response.songs.map((song: Song) => {
                    const completeSong = {
                        ...song,
                        audio_features: song.audio_features || {
                            danceability: song.danceability ?? 0,
                            energy: song.energy ?? 0,
                            valence: song.valence ?? 0,
                            acousticness: song.acousticness ?? 0,
                            instrumentalness: song.instrumentalness ?? 0,
                            liveness: song.liveness ?? 0,
                        },
                    };
                    console.log('✅ Recommendation data:', completeSong);
                    return completeSong;
                });
    
                setRecommendations(uniqueRecommendations);
            } catch (error: any) {
                setError(error.message || "An error occurred while fetching recommendations.");
                console.error("Error fetching recommendations:", error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchRecommendations().then();
    }, [selectedSong]);    

    const handleReset = () => {
        setSelectedSong(null);
        setRecommendations([]);
    };

    const handleSongSelection = (song: Song) => {
        console.log('🎵 Song selected in Dashboard:', song); // Log the selected song
        setSelectedSong(song);
    };

    return (
        <div>
            {/* Display error message */}
            {error && (
                <div className="text-red-500 text-center p-4">
                    {error}
                </div>
            )}
            <div className="min-h-screen bg-gray-50">
                {/* Home Button */}
                <button
                    onClick={handleReset}
                    className="fixed top-4 left-4 p-3 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow duration-200"
                    aria-label="Reset to home"
                >
                    <Home className="h-5 w-5 text-gray-600" />
                </button>

                <div className="p-4 max-w-6xl mx-auto pt-16">
                    <div className="mb-6">
                        <SearchBar onSongSelect={setSelectedSong} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center gap-2 mb-4">
                                <Music className="h-5 w-5 text-gray-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Selected Song</h2>
                            </div>
                            {selectedSong ? (
                                <>
                                    <SongDetails song={selectedSong} />
                                </>
                            ) : (
                                <>
                                    <div>Select a song to see its details</div>
                                </>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center gap-2 mb-4">
                                <Play className="h-5 w-5 text-gray-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Similar Songs</h2>
                            </div>
                            {selectedSong ? (
                                isLoading ? (
                                    <div className="text-center text-gray-500 py-8">Loading recommendations...</div>
                                ) : (
                                    <div className="space-y-2">
                                        {recommendations.map((song, index) => (
                                            <button
                                                key={`${song.track_id}-${index}`}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                onClick={() => {
                                                    handleSongSelection(song);
                                                }}
                                            >
                                                <div className="text-left">
                                                    <h4 className="font-medium text-gray-900">{song.track_name}</h4>
                                                    <p className="text-sm text-gray-600">{song.artists}</p>
                                                </div>
                                                <div className="text-sm text-gray-500 ml-4">
                                                    {song.track_genre}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    Select a song to see recommendations
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}