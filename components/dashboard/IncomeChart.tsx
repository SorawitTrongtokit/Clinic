'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DailyIncome {
    date: string;
    dayName: string;
    income: number;
}

interface IncomeChartProps {
    data: DailyIncome[];
    loading?: boolean;
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#60A5FA', '#3B82F6', '#2563EB'];

export default function IncomeChart({ data, loading }: IncomeChartProps) {
    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                ไม่มีข้อมูลรายได้
            </div>
        );
    }

    const today = new Date().toLocaleDateString('th-TH', { weekday: 'short' });

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                        dataKey="dayName"
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `฿${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'รายได้']}
                        labelFormatter={(label) => `วัน${label}`}
                    />
                    <Bar dataKey="income" radius={[6, 6, 0, 0]} maxBarSize={50}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.dayName === today ? '#10B981' : COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
