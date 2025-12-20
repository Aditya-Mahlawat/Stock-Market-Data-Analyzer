"use client";

import { useState, useEffect } from "react";
import { Chart } from "@/components/Chart";
import { BacktestPanel } from "@/components/BacktestPanel";
import { SearchBar } from "@/components/SearchBar";
import axios from "axios";
import { Activity, RefreshCw, BarChart2, Zap, Sun, Moon } from "lucide-react";

export default function Home() {
    const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
    const [chartData, setChartData] = useState<any[]>([]);
    const [period, setPeriod] = useState("1y");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("dark");

    const periods = [
        { label: '1D', value: '1d' },
        { label: '1W', value: '5d' },
        { label: '1M', value: '1mo' },
        { label: '1Y', value: '1y' },
        { label: 'ALL', value: 'max' }
    ];

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        if (newTheme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    };

    const fetchData = async () => {
        if (!selectedSymbol) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/data/${selectedSymbol}?period=${period}`);
            setChartData(response.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedSymbol, period]);

    // Extract latest data point for Indicator Snapshot
    const latestData = chartData.length > 0 ? chartData[chartData.length - 1] : null;

    return (
        <main className="min-h-screen p-4 md:p-8 font-sans text-dark-text selection:bg-neon-blue/30 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- Top Row: Header & Controls --- */}
                <div className="glass-panel p-4 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-4 z-40">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="p-2.5 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-neon-blue">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-dark-text">
                                Market<span className="text-neon-blue">Analyst</span>
                            </h1>
                            <p className="text-xs text-dark-muted">Advanced Market Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto flex-1 justify-end">
                        <div className="w-full md:w-80">
                            <SearchBar onSelect={setSelectedSymbol} />
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 text-dark-muted hover:text-neon-yellow hover:bg-white/5 rounded-xl transition-all duration-300 active:scale-95"
                            title="Toggle Theme"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={fetchData}
                            className="p-3 text-dark-muted hover:text-neon-blue hover:bg-white/5 rounded-xl transition-all duration-300 active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* --- Main Chart Module (Span 2) --- */}
                    <div className="md:col-span-2 glass-panel p-6 flex flex-col min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-dark-text flex items-center gap-2">
                                    {selectedSymbol} <span className="text-dark-muted font-normal text-sm">Price Action</span>
                                </h2>
                            </div>
                            <div className="flex gap-1 bg-dark-bg/50 p-1 rounded-lg border border-dark-border/50">
                                {periods.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setPeriod(p.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${period === p.value
                                            ? 'bg-dark-card text-neon-blue shadow-sm border border-dark-border'
                                            : 'text-dark-muted hover:text-dark-text hover:bg-white/5'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <Chart data={chartData} />
                        </div>
                    </div>

                    {/* --- Indicator Snapshot Module (Span 1) --- */}
                    <div className="md:col-span-1 glass-panel p-6 flex flex-col">
                        <h3 className="text-lg font-semibold text-dark-text mb-6 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-neon-yellow text-yellow-400" />
                            Market Snapshot
                        </h3>

                        {latestData ? (
                            <div className="space-y-6 flex-1">
                                <div className="text-center py-6 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
                                    <p className="text-sm text-dark-muted mb-1">Current Price</p>
                                    <div className="text-4xl font-bold text-dark-text tracking-tight">
                                        ₹{latestData.close?.toFixed(2)}
                                    </div>
                                    <div className={`text-sm font-medium mt-2 flex items-center justify-center gap-1 ${latestData.close > latestData.open ? 'text-neon-green' : 'text-neon-red'}`}>
                                        {latestData.close > latestData.open ? '+' : ''}
                                        {((latestData.close - latestData.open) / latestData.open * 100).toFixed(2)}%
                                        <span className="text-xs opacity-70">Today</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <IndicatorRow
                                        label="RSI (14)"
                                        value={latestData.RSI?.toFixed(2)}
                                        status={latestData.RSI > 70 ? 'Overbought' : latestData.RSI < 30 ? 'Oversold' : 'Neutral'}
                                        color={latestData.RSI > 70 ? 'text-neon-red' : latestData.RSI < 30 ? 'text-neon-green' : 'text-neon-blue'}
                                    />
                                    <IndicatorRow
                                        label="SMA (20)"
                                        value={latestData.SMA_20?.toFixed(2)}
                                        status="Trend"
                                        color="text-orange-400"
                                    />
                                    <IndicatorRow
                                        label="SMA (50)"
                                        value={latestData.SMA_50?.toFixed(2)}
                                        status="Trend"
                                        color="text-purple-400"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-dark-muted">
                                <BarChart2 className="h-12 w-12 mb-4 opacity-20" />
                                <p>No Data Available</p>
                            </div>
                        )}
                    </div>

                    {/* --- Backtest Sandbox Module (Span 3) --- */}
                    <div className="md:col-span-3 glass-panel p-6">
                        <BacktestPanel symbol={selectedSymbol} />
                    </div>

                </div>
            </div>
        </main>
    );
}

function IndicatorRow({ label, value, status, color }: any) {
    return (
        <div className="flex justify-between items-center p-4 bg-dark-bg/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex flex-col">
                <span className="text-sm font-medium text-dark-muted">{label}</span>
                <span className="text-xs text-dark-muted/60">{status}</span>
            </div>
            <span className={`text-lg font-bold ${color}`}>
                {value || 'N/A'}
            </span>
        </div>
    );
}
