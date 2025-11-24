"use client";

import { useState, useEffect } from "react";
import { Watchlist } from "@/components/Watchlist";
import { Chart } from "@/components/Chart";
import { BacktestPanel } from "@/components/BacktestPanel";
import axios from "axios";

export default function Home() {
    const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/data/${selectedSymbol}`);
                setChartData(response.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [selectedSymbol]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Stock Market Data Analyzer</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <Watchlist onSelect={setSelectedSymbol} />
                    </div>

                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-2">{selectedSymbol} Analysis</h2>
                            <Chart data={chartData} />
                        </div>

                        <BacktestPanel symbol={selectedSymbol} />
                    </div>
                </div>
            </div>
        </main>
    );
}
