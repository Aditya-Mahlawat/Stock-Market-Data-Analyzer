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
        <div className="relative w-full z-50">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted group-focus-within:text-neon-blue transition-colors h-4 w-4" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query) {
                            onSelect(query.toUpperCase());
                            setIsOpen(false);
                        }
                    }}
                    placeholder="Search stocks (e.g., RELIANCE, AAPL)..."
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl outline-none"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 glass-panel overflow-hidden animate-fade-in">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {results.map((item) => (
                            <div
                                key={item.symbol}
                                onClick={() => {
                                    onSelect(item.symbol);
                                    setQuery(item.symbol);
                                    setIsOpen(false);
                                }}
                                className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-dark-border/50 last:border-0 flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-medium text-dark-text group-hover:text-neon-blue transition-colors">{item.symbol}</div>
                                    <div className="text-xs text-dark-muted">{item.name}</div>
                                </div>
                                <span className="text-xs text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
