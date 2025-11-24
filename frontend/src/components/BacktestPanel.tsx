"use client";

import { useState } from "react";
import axios from "axios";
import { Play, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface BacktestPanelProps {
    symbol: string;
}

export function BacktestPanel({ symbol }: BacktestPanelProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runBacktest = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8000/api/backtest?symbol=${symbol}&initial_capital=10000`);
            setResult(response.data);
        } catch (error) {
            console.error("Backtest failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Strategy Backtest</h3>
                    <p className="text-sm text-gray-400">SMA Crossover (50/200) on {symbol}</p>
                </div>
                <button
                    onClick={runBacktest}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Activity className="animate-spin h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {loading ? "Simulating..." : "Run Simulation"}
                </button>
            </div>

            {result && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MetricCard
                        label="Total Return"
                        value={`${(result.total_return * 100).toFixed(2)}%`}
                        icon={result.total_return >= 0 ? TrendingUp : TrendingDown}
                        color={result.total_return >= 0 ? "text-green-400" : "text-red-400"}
                    />
                    <MetricCard
                        label="Sharpe Ratio"
                        value={result.sharpe_ratio.toFixed(2)}
                        icon={Activity}
                        color="text-blue-400"
                    />
                    <MetricCard
                        label="Max Drawdown"
                        value={`${(result.max_drawdown * 100).toFixed(2)}%`}
                        icon={TrendingDown}
                        color="text-red-400"
                    />
                    <MetricCard
                        label="Final Value"
                        value={`₹${result.final_value.toFixed(2)}`}
                        icon={DollarSign}
                        color="text-yellow-400"
                    />
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    );
}
