"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";

interface SearchBarProps {
    onSelect: (symbol: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/search?query=${query}`);
                setResults(response.data);
                setIsOpen(true);
            } catch (error) {
                console.error("Search failed", error);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-blue h-4 w-4" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search stocks (e.g., RELIANCE, AAPL)..."
                    className="w-full pl-10 pr-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue text-white placeholder-gray-400 transition-all shadow-lg shadow-neon-blue/5"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[#111928] border border-gray-700 rounded-xl shadow-xl backdrop-blur-md max-h-60 overflow-y-auto">
                    {results.map((item) => (
                        <div
                            key={item.symbol}
                            onClick={() => {
                                onSelect(item.symbol);
                                setQuery("");
                                setIsOpen(false);
                            }}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-800 last:border-0"
                        >
                            <div className="font-medium text-white">{item.symbol}</div>
                            <div className="text-sm text-gray-400">{item.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
