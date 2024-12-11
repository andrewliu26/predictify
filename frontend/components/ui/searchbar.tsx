import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Song } from '@/lib/types';
import { searchSongs } from '@/lib/api';

interface SearchBarProps {
    onSongSelect: (song: Song) => void;
}

export function SearchBar({ onSongSelect }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Reset suggestions when query changes
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        setShowSuggestions(true);

        const fetchSuggestions = async () => {
            try {
                const response = await searchSongs(query);
                setSuggestions(response.songs);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (song: Song) => {
        onSongSelect(song);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search by song, artist, or album..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                />
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                {query && (
                    <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setQuery('')}
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                )}
            </div>

            {showSuggestions && query.length >= 2 && (
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-50 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2">
                            {suggestions.map((song) => (
                                <button
                                    key={song.track_id}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                    onClick={() => handleSelect(song)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{song.track_name}</span>
                                        <span className="text-sm text-gray-600">{song.artists}</span>
                                        <span className="text-xs text-gray-500">{song.album_name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}