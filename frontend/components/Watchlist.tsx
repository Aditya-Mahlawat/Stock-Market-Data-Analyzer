"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface WatchlistProps {
    onSelect: (symbol: string) => void;
}

const DEFAULT_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];

export function Watchlist({ onSelect }: WatchlistProps) {
    const [prices, setPrices] = useState<Record<string, number>>({});

    // Mock fetching prices for now or implement real fetch
    useEffect(() => {
        const fetchPrices = async () => {
            // In a real app, we'd fetch these from our backend
            // For now, let's just use static or random data for demo if backend isn't ready with batch endpoint
            // Or we can fetch one by one
        };
        fetchPrices();
    }, []);

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
            <div className="space-y-2">
                {DEFAULT_SYMBOLS.map((symbol) => (
                    <div
                        key={symbol}
                        onClick={() => onSelect(symbol)}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                        <span className="font-medium">{symbol}</span>
                        <span className="text-gray-600">Loading...</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
