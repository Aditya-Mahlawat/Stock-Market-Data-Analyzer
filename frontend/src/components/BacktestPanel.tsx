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
        <div className="glass-panel p-6 rounded-2xl shadow-2xl mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Strategy Backtest</h3>
                    <p className="text-sm text-gray-400">SMA Crossover (50/200) on <span className="text-neon-blue">{symbol}</span></p>
                </div>
                <button
                    onClick={runBacktest}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-neon-blue hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
                        color={result.total_return >= 0 ? "text-neon-green" : "text-red-400"}
                    />
                    <MetricCard
                        label="Sharpe Ratio"
                        value={result.sharpe_ratio.toFixed(2)}
                        icon={Activity}
                        color="text-neon-blue"
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
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
                <Icon className={`h-4 w-4 ${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className={`text-2xl font-bold ${color} drop-shadow-sm`}>{value}</div>
        </div>
    );
}
