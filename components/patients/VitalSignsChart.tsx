'use client';

import { VisitWithPatient } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Heart } from 'lucide-react';
import { useState } from 'react';

interface VitalSignsChartProps {
    visits: VisitWithPatient[];
}

type ChartType = 'weight' | 'bp' | 'all';

export default function VitalSignsChart({ visits }: VitalSignsChartProps) {
    const [chartType, setChartType] = useState<ChartType>('all');

    // Sort visits by date (oldest first for chart)
    const sortedVisits = [...visits].sort((a, b) =>
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    // Prepare chart data
    const chartData = sortedVisits.map(visit => ({
        date: visit.created_at ? new Date(visit.created_at).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short'
        }) : '',
        weight: visit.weight ? Number(visit.weight) : null,
        bp_sys: visit.bp_sys ? Number(visit.bp_sys) : null,
        bp_dia: visit.bp_dia ? Number(visit.bp_dia) : null,
        pulse: visit.pulse ? Number(visit.pulse) : null,
    })).filter(d => d.weight || d.bp_sys); // Only include if has data

    if (chartData.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-slate-300" />
                </div>
                <p>ยังไม่มีข้อมูล Vital Signs</p>
                <p className="text-sm mt-1">ข้อมูลจะแสดงหลังจากมีการบันทึกการรักษา</p>
            </div>
        );
    }

    const tabs = [
        { id: 'all', label: 'ทั้งหมด', icon: Activity },
        { id: 'weight', label: 'น้ำหนัก', icon: TrendingUp },
        { id: 'bp', label: 'ความดัน', icon: Heart },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Tab buttons */}
            <div className="flex gap-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setChartType(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                                ${chartType === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }
                            `}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />

                        {(chartType === 'all' || chartType === 'weight') && (
                            <Line
                                type="monotone"
                                dataKey="weight"
                                name="น้ำหนัก (kg)"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        )}

                        {(chartType === 'all' || chartType === 'bp') && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="bp_sys"
                                    name="BP Systolic"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bp_dia"
                                    name="BP Diastolic"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chartData.length > 0 && chartData[chartData.length - 1].weight && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">น้ำหนักล่าสุด</p>
                        <p className="text-2xl font-bold text-emerald-700">{chartData[chartData.length - 1].weight} kg</p>
                    </div>
                )}
                {chartData.length > 0 && chartData[chartData.length - 1].bp_sys && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">ความดันล่าสุด</p>
                        <p className="text-2xl font-bold text-red-700">
                            {chartData[chartData.length - 1].bp_sys}/{chartData[chartData.length - 1].bp_dia}
                        </p>
                    </div>
                )}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">จำนวนครั้ง</p>
                    <p className="text-2xl font-bold text-blue-700">{chartData.length} ครั้ง</p>
                </div>
                {visits.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">รักษาล่าสุด</p>
                        <p className="text-sm font-bold text-purple-700">
                            {visits[0].created_at && new Date(visits[0].created_at).toLocaleDateString('th-TH')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
