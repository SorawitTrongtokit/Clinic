'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrintLabelsPage() {
    const { id } = useParams();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                const { data: visit, error } = await supabase
                    .from('visits')
                    .select(`
                        *,
                        patients (*),
                        prescriptions (
                            qty,
                            medicines (name, unit, instruction)
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (visit) {
                    setPatient(visit.patients);
                    setPrescriptions(visit.prescriptions);
                }
                if (error) console.error(error);
            };
            fetchData();
        }
    }, [id]);

    if (!prescriptions.length || !patient) return <div className="p-10">กำลังโหลดข้อมูลฉลากยา...</div>;

    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans print:font-sarabun print:bg-white print:p-0">
            <div className="mb-8 flex justify-end print:hidden max-w-4xl mx-auto">
                <Button onClick={() => window.print()} className="gap-2 shadow-lg">
                    <Printer className="h-4 w-4" /> พิมพ์สติ๊กเกอร์
                </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center print:block print:gap-0">
                {prescriptions.map((item: any, idx: number) => (
                    <div
                        key={idx}
                        className="bg-white p-2 border border-slate-300 w-[8cm] h-[5cm] relative shadow-sm print:shadow-none print:border-0 print:mb-0 break-inside-avoid page-break-after-always overflow-hidden"
                        style={{
                            pageBreakAfter: idx < prescriptions.length - 1 ? 'always' : 'auto'
                        }}
                    >
                        {/* 8cm x 5cm Container */}
                        <div className="h-full flex flex-col justify-between text-black font-sarabun leading-tight">
                            <div className="text-center border-b border-black pb-1">
                                <h1 className="text-sm font-bold">ไผ่ขอน้ำคลินิกการพยาบาลและการผดุงครรภ์</h1>
                                <p className="text-[10px]">โทร. 081-234-5678</p>
                            </div>

                            <div className="flex-1 py-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-bold">วันที่: {today}</span>
                                    <span className="font-bold">HN: {patient.hn}</span>
                                </div>
                                <div className="text-xs mb-1">
                                    <span className="font-bold">ชื่อ:</span> {patient.prefix} {patient.first_name} {patient.last_name}
                                </div>
                                <div className="text-sm font-bold truncate mt-1">
                                    {item.medicines?.name}
                                </div>
                                <div className="text-xs mt-1 border border-black p-1 rounded min-h-[30px]">
                                    <span className="font-bold underline">วิธีใช้:</span> {item.medicines?.instruction || '-'}
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-black pt-1 text-[10px]">
                                <div>จำนวน: <span className="text-sm font-bold">{item.qty}</span> {item.medicines?.unit}</div>
                                <div>ผู้จัด: ....................</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: 8cm 5cm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .page-break-after-always {
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}
