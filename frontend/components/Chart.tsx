"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface ChartProps {
    data: any[];
}

export function Chart({ data }: ChartProps) {
    return (
        <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Price History</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
