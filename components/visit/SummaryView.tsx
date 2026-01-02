'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Printer, Home, FileText, Activity, Stethoscope, Pill } from 'lucide-react';

interface SummaryViewProps {
    data: any; // Contains all joined data
    onSave?: () => void;
    isNew?: boolean;
    visitId?: string; // Optional if new
    isSaving?: boolean;
}

export default function SummaryView({ data, onSave, isNew, visitId, isSaving }: SummaryViewProps) {
    if (!data) return <div>Loading Summary...</div>;

    const { patients, patient, basket, total_cost, examiner, weight, height, bp_sys, bp_dia, temp, pulse, resp_rate, cc, pe, alcohol, smoking, urgency, diagnosis } = data;
    const pt = patients || patient; // Handle both structure types
    const items = basket || [];

    // Should we show save button?
    const canSave = isNew && onSave;

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-3">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">สรุปผลการตรวจรักษา</h2>
                <p className="text-slate-500">HN: {pt?.hn} | วันที่: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {isNew && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold ml-2">รอการบันทึก</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Vitals Section */}
                <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" /> ข้อมูลคัดกรอง (Vitals)
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div><span className="text-slate-500">น้ำหนัก:</span> <span className="font-medium">{weight || '-'} kg</span></div>
                        <div><span className="text-slate-500">ส่วนสูง:</span> <span className="font-medium">{height || '-'} cm</span></div>
                        <div><span className="text-slate-500">ความดัน:</span> <span className="font-medium">{bp_sys}/{bp_dia} mmHg</span></div>
                        <div><span className="text-slate-500">อุณหภูมิ:</span> <span className="font-medium">{temp || '-'} °C</span></div>
                        <div><span className="text-slate-500">ชีพจร:</span> <span className="font-medium">{pulse || '-'} bpm</span></div>
                        <div><span className="text-slate-500">การหายใจ:</span> <span className="font-medium">{resp_rate || '-'} /min</span></div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                            <span className="text-slate-500">ความเร่งด่วน:</span> <span className={`font-bold ml-2 ${urgency === 'ฉุกเฉิน' ? 'text-red-600' : 'text-slate-700'}`}>{urgency || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Diagnosis Section */}
                <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-teal-600" /> การวินิจฉัย (Diagnosis)
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold mb-1">อาการสำคัญ (CC)</span>
                            <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-100 shadow-sm min-h-[2rem]">{cc || '-'}</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold mb-1">ตรวจร่างกาย (PE)</span>
                            <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-100 shadow-sm min-h-[2rem]">{pe || '-'}</p>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold mb-1">การวินิจฉัย (ICD-10)</span>
                            <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">{diagnosis || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medication Section */}
            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 mb-8">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-purple-600" /> รายการยาและเวชภัณฑ์
                </h3>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">รายการ</th>
                                <th className="px-4 py-3 text-center">จำนวน</th>
                                <th className="px-4 py-3 text-right">ราคา</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items && items.length > 0 ? (
                                items.map((p: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-medium text-slate-700">{p.name || p.medicines?.name}</td>
                                        <td className="px-4 py-3 text-center">{p.qty || p.quantity} {p.unit || p.medicines?.unit}</td>
                                        <td className="px-4 py-3 text-right">฿{(p.price * (p.qty || p.quantity)).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">ไม่มีรายการยา</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-800">
                            <tr>
                                <td colSpan={2} className="px-4 py-3 text-right">รวมทั้งสิ้น</td>
                                <td className="px-4 py-3 text-right text-blue-700 bg-blue-50/50 border-t border-blue-100">
                                    ฿{(total_cost || 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t border-slate-100">
                {canSave ? (
                    <Button onClick={onSave} variant="primary" size="lg" className="w-full sm:w-auto gap-2 shadow-blue-300 shadow-lg animate-pulse">
                        <FileText className="w-5 h-5" />
                        ยืนยันและบันทึกข้อมูล
                    </Button>
                ) : (
                    <>
                        {visitId && (
                            <>
                                <Link href={`/print/visit/${visitId}`} target="_blank">
                                    <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 shadow-blue-300 shadow-lg">
                                        <Printer className="w-5 h-5" />
                                        พิมพ์ใบรับรอง/ใบเสร็จ
                                    </Button>
                                </Link>
                                <Link href={`/print/labels/${visitId}`} target="_blank">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2 shadow-teal-300 shadow-lg">
                                        <Printer className="w-5 h-5" />
                                        พิมพ์สติ๊กเกอร์ยา
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Link href="/records">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                                <Home className="w-5 h-5" />
                                กลับหน้าทะเบียน
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
