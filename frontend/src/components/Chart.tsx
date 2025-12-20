"use client";

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

interface ChartProps {
    data: any[];
}

export function Chart({ data }: ChartProps) {
    return (
        <div className="h-full w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3241" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
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
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(21, 26, 37, 0.9)',
                            borderColor: '#2A3241',
                            borderRadius: '12px',
                            color: '#E2E8F0',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                        }}
                        itemStyle={{ color: '#E2E8F0' }}
                        labelStyle={{ color: '#94A3B8' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClose)"
                        name="Close Price"
                    />
                    <Line
                        type="monotone"
                        dataKey="SMA_20"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                        name="SMA (20)"
                    />
                    <Line
                        type="monotone"
                        dataKey="SMA_50"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                        name="SMA (50)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
