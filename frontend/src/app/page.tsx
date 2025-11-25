"use client";

import { useState, useEffect } from "react";
import { Watchlist } from "@/components/Watchlist";
import { Chart } from "@/components/Chart";
import { BacktestPanel } from "@/components/BacktestPanel";
import { SearchBar } from "@/components/SearchBar";
import axios from "axios";
import { Activity } from "lucide-react";

export default function Home() {
    const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
    const [watchlist, setWatchlist] = useState<string[]>(["AAPL", "GOOGL", "RELIANCE.NS", "TCS.NS"]);
    const [chartData, setChartData] = useState([]);
    const [period, setPeriod] = useState("1y");

    const periods = [
        { label: '1D', value: '1d' },
        { label: '1W', value: '5d' },
        { label: '1M', value: '1mo' },
        { label: '1Y', value: '1y' },
        { label: 'ALL', value: 'max' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/data/${selectedSymbol}?period=${period}`);
                setChartData(response.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [selectedSymbol, period]);

    const addToWatchlist = (symbol: string) => {
        if (!watchlist.includes(symbol)) {
            setWatchlist([...watchlist, symbol]);
        }
        setSelectedSymbol(symbol);
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlist(watchlist.filter((s) => s !== symbol));
    };

    return (
        <main className="min-h-screen p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Market<span className="text-blue-500">Analyzer</span></h1>
                            <p className="text-gray-400 text-sm">Real-time Indian & Global Stock Analysis</p>
                        </div>
                    </div>
                    <div className="w-full md:w-96">
                        <SearchBar onSelect={addToWatchlist} />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Watchlist */}
                    <div className="lg:col-span-1 space-y-6">
                        <Watchlist
                            watchlist={watchlist}
                            onSelect={setSelectedSymbol}
                            onRemove={removeFromWatchlist}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Chart Section */}
                        <div className="glass-panel p-6 rounded-2xl shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {selectedSymbol} <span className="text-sm font-normal text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/10">{periods.find(p => p.value === period)?.label}</span>
                                </h2>
                                <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                                    {periods.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => setPeriod(p.value)}
                                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${period === p.value
                                                    ? 'bg-neon-blue text-black shadow-lg shadow-neon-blue/20'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Chart data={chartData} />
                        </div>

                        {/* Backtest Section */}
                        <BacktestPanel symbol={selectedSymbol} />
                    </div>
                </div>
            </div>
        </main>
    );
}
