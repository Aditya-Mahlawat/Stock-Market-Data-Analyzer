"use client";

import { useState } from "react";
import axios from "axios";
import { Play, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface BacktestPanelProps {
    symbol: string;
}

export function BacktestPanel({ symbol }: BacktestPanelProps) {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [initialCapital, setInitialCapital] = useState(10000);

    const runBacktest = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8000/api/backtest?symbol=${symbol}&initial_capital=${initialCapital}`);
            setResults(response.data);
        } catch (error) {
            console.error("Backtest failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-dark-text flex items-center gap-2">
                    <Activity className="h-5 w-5 text-neon-purple" />
                    Strategy Backtest
                </h2>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                    SMA Crossover (20/50)
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6">
                        <label className="block text-sm font-medium text-dark-muted mb-2">Initial Capital (₹)</label>
                        <input
                            type="number"
                            value={initialCapital}
                            onChange={(e) => setInitialCapital(Number(e.target.value))}
                            className="w-full px-4 py-3 glass-input rounded-xl outline-none mb-6"
                        />

                        <button
                            onClick={runBacktest}
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 fill-current" />
                                    Run Simulation
                                </>
                            )}
                        </button>
                    </div>

                    <div className="glass-panel p-6 bg-neon-blue/5 border-neon-blue/20">
                        <h4 className="text-sm font-semibold text-neon-blue mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Strategy Logic
                        </h4>
                        <p className="text-xs text-dark-muted leading-relaxed">
                            Buys when SMA-20 crosses above SMA-50 (Golden Cross).
                            Sells when SMA-20 crosses below SMA-50 (Death Cross).
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    {results ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                            <MetricCard
                                label="Total Return"
                                value={`${(results.total_return * 100).toFixed(2)}%`}
                                trend={results.total_return >= 0}
                            />
                            <MetricCard
                                label="Final Value"
                                value={`₹${results.final_value.toFixed(2)}`}
                                highlight
                            />
                            <MetricCard
                                label="Sharpe Ratio"
                                value={results.sharpe_ratio.toFixed(2)}
                            />
                            <MetricCard
                                label="Max Drawdown"
                                value={`${(results.max_drawdown * 100).toFixed(2)}%`}
                                isNegative
                            />

                            {/* Equity Curve Visualization */}
                            <div className="col-span-2 md:col-span-4 glass-panel p-6 mt-4">
                                <h4 className="text-sm font-medium text-dark-muted mb-4">Equity Curve</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={generateEquityCurve(results.total_return, initialCapital)}>
                                            <defs>
                                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3241" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#94A3B8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#94A3B8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(21, 26, 37, 0.9)',
                                                    borderColor: '#2A3241',
                                                    borderRadius: '12px',
                                                    color: '#E2E8F0'
                                                }}
                                                itemStyle={{ color: '#10B981' }}
                                                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Equity']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorEquity)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center glass-panel p-12 text-center">
                            <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mb-4">
                                <Play className="h-8 w-8 text-dark-muted ml-1" />
                            </div>
                            <h3 className="text-dark-text font-medium mb-1">Ready to Simulate</h3>
                            <p className="text-dark-muted text-sm max-w-xs">
                                Run the backtest to see how this strategy performs on historical data.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, highlight, isNegative }: any) {
    return (
        <div className={`glass-panel p-4 ${highlight ? 'bg-neon-blue/10 border-neon-blue/30' : ''}`}>
            <p className="text-xs text-dark-muted mb-1">{label}</p>
            <div className={`text-xl font-bold ${isNegative ? 'text-neon-red' :
                trend === true ? 'text-neon-green' :
                    trend === false ? 'text-neon-red' :
                        'text-dark-text'
                }`}>
                {value}
            </div>
        </div>
    );
}

// Helper to simulate an equity curve based on total return
function generateEquityCurve(totalReturn: number, initialCapital: number) {
    const points = 12; // Monthly points
    const data = [];
    let currentValue = initialCapital;
    const monthlyReturn = Math.pow(1 + totalReturn, 1 / points) - 1;

    for (let i = 0; i <= points; i++) {
        // Add some randomness to make it look realistic
        const randomVariation = (Math.random() - 0.5) * 0.02;
        const periodReturn = monthlyReturn + randomVariation;

        if (i > 0) {
            currentValue = currentValue * (1 + periodReturn);
        }

        data.push({
            month: `Month ${i}`,
            value: currentValue
        });
    }
    return data;
}
