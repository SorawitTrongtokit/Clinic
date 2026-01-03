'use client';

import { Visit } from '@/types';
import { FileText, Pill, Printer, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface VisitTimelineProps {
    visits: Visit[];
}

export default function VisitTimeline({ visits }: VisitTimelineProps) {
    if (visits.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <p>ยังไม่มีประวัติการรักษา</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-slate-200" />

            {visits.map((visit, index) => (
                <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pb-8 last:pb-0"
                >
                    {/* Timeline dot */}
                    <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md" />

                    {/* Content card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden ml-4">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {visit.created_at && new Date(visit.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {visit.created_at && new Date(visit.created_at).toLocaleTimeString('th-TH', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} น. • ผู้ตรวจ: {visit.examiner}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-800">
                                    ฿{visit.total_cost?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            {/* Diagnosis */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    วินิจฉัย (Diagnosis)
                                </p>
                                <div className="flex items-start gap-2">
                                    {visit.icd10_code && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-mono">
                                            {visit.icd10_code}
                                        </span>
                                    )}
                                    <p className="text-slate-700">{visit.diagnosis || '-'}</p>
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            {visit.cc && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        อาการสำคัญ (CC)
                                    </p>
                                    <p className="text-slate-600">{visit.cc}</p>
                                </div>
                            )}

                            {/* Vital Signs Mini */}
                            <div className="flex flex-wrap gap-3 text-sm">
                                {visit.weight && (
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                        <span className="font-bold">Wt:</span> {visit.weight} kg
                                    </span>
                                )}
                                {visit.bp_sys && visit.bp_dia && (
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                        <span className="font-bold">BP:</span> {visit.bp_sys}/{visit.bp_dia}
                                    </span>
                                )}
                                {visit.temp && (
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                        <span className="font-bold">T:</span> {visit.temp}°C
                                    </span>
                                )}
                                {visit.pulse && (
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                                        <span className="font-bold">PR:</span> {visit.pulse} bpm
                                    </span>
                                )}
                            </div>

                            {/* Prescriptions */}
                            {visit.prescriptions && visit.prescriptions.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Pill className="h-3 w-3" /> ยาที่สั่ง
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {visit.prescriptions.map((rx: any, i: number) => (
                                            <span
                                                key={i}
                                                className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-lg border border-teal-100"
                                            >
                                                {rx.medicines?.name} x{rx.qty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <a href={`/print/visit/${visit.id}`} target="_blank">
                                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                                    <Printer className="w-3 h-3" /> ใบรับรองแพทย์
                                </Button>
                            </a>
                            <a href={`/print/labels/${visit.id}`} target="_blank">
                                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                                    <Printer className="w-3 h-3" /> สติ๊กเกอร์ยา
                                </Button>
                            </a>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
