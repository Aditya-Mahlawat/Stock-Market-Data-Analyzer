"use client";

import { useState } from "react";
import axios from "axios";

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
        <div className="bg-white p-4 rounded-lg shadow mt-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Backtest Strategy (SMA Cross)</h3>
                <button
                    onClick={runBacktest}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Running..." : "Run Backtest"}
                </button>
            </div>

            {result && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Total Return</div>
                        <div className="text-xl font-bold">{(result.total_return * 100).toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Sharpe Ratio</div>
                        <div className="text-xl font-bold">{result.sharpe_ratio.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Max Drawdown</div>
                        <div className="text-xl font-bold">{(result.max_drawdown * 100).toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500">Final Value</div>
                        <div className="text-xl font-bold">${result.final_value.toFixed(2)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
