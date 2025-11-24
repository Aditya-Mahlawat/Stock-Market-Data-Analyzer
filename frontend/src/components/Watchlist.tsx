"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import axios from "axios";

interface WatchlistProps {
    onSelect: (symbol: string) => void;
    watchlist: string[];
    onRemove: (symbol: string) => void;
}

export function Watchlist({ onSelect, watchlist, onRemove }: WatchlistProps) {
    const [prices, setPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchPrices = async () => {
            // In a real app, use a batch endpoint. Here we loop (inefficient but works for demo).
            const newPrices: Record<string, number> = {};
            for (const symbol of watchlist) {
                try {
                    const res = await axios.get(`http://localhost:8000/api/data/${symbol}?period=1d`);
                    if (res.data && res.data.length > 0) {
                        newPrices[symbol] = res.data[res.data.length - 1].close;
                    }
                } catch (e) {
                    console.error(`Failed to fetch price for ${symbol}`);
                }
            }
            setPrices(newPrices);
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [watchlist]);

    return (
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Watchlist
            </h3>
            <div className="space-y-3">
                {watchlist.map((symbol) => (
                    <div
                        key={symbol}
                        onClick={() => onSelect(symbol)}
                        className="group flex justify-between items-center p-4 bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 hover:border-blue-500/50 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div>
                            <div className="font-bold text-white">{symbol}</div>
                            <div className="text-xs text-gray-400">NSE/BSE</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="font-mono text-lg font-semibold text-white">
                                    {prices[symbol] ? `₹${prices[symbol].toFixed(2)}` : "Loading..."}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(symbol);
                                }}
                                className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {watchlist.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        Start by searching for a stock...
                    </div>
                )}
            </div>
        </div>
    );
}
