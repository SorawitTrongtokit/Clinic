'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded-lg ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
        >
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full" />
        </motion.div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200"
                    >
                        <Skeleton className="h-4 w-20 mb-3" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <TableRowSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PatientDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-700 p-6 text-center">
                        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4 bg-slate-600" />
                        <Skeleton className="h-5 w-40 mx-auto mb-2 bg-slate-600" />
                        <Skeleton className="h-4 w-24 mx-auto bg-slate-600" />
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <TableRowSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
