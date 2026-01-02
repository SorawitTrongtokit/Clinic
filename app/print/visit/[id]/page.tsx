'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrintVisitPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);

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
                    price,
                    total_price,
                    medicines (name, unit)
                )
            `)
                    .eq('id', id)
                    .single();

                if (visit) setData(visit);
                if (error) console.error(error);
            };
            fetchData();
        }
    }, [id]);

    if (!data) return <div className="p-10">กำลังเตรียมเอกสาร...</div>;

    const { patients: p, prescriptions } = data;

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans print:font-sarabun print:bg-white print:p-0 print:text-black">
            <div className="max-w-[21cm] mx-auto bg-white shadow-lg p-10 print:shadow-none print:max-w-none">
                {/* No-print controls */}
                <div className="mb-8 flex justify-end print:hidden">
                    <Button onClick={() => window.print()} className="gap-2">
                        <Printer className="h-4 w-4" /> พิมพ์เอกสาร
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">ไผ่ขอน้ำคลินิกการพยาบาลและการผดุงครรภ์</h1>
                    <p className="text-slate-600">เวชระเบียนผู้ป่วยนอก (OPD Card)</p>
                    <p className="text-sm text-slate-500 mt-1">วันที่ตรวจ: {new Date(data.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="font-bold">ชื่อ-สกุล:</span> {p.prefix} {p.first_name} {p.last_name}</div>
                    <div><span className="font-bold">HN:</span> {p.hn}</div>
                    <div><span className="font-bold">อายุ:</span> {new Date().getFullYear() - new Date(p.birthdate).getFullYear()} ปี</div>
                    <div><span className="font-bold">สิทธิ:</span> {p.treatment_right}</div>
                    <div><span className="font-bold">ที่อยู่:</span> {typeof p.address === 'object' ? p.address.full_address : p.address}</div>
                    <div className="text-red-600"><span className="font-bold text-slate-900">แพ้ยา:</span> {p.drug_allergy || '-'}</div>
                </div>

                {/* Vitals */}
                <div className="border border-slate-300 rounded p-4 mb-6 text-sm">
                    <h3 className="font-bold mb-2 underline">สัญญาณชีพ (Vital Signs)</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <div>T: {data.temp || '-'} °C</div>
                        <div>P: {data.pulse || '-'} /min</div>
                        <div>BP: {data.bp_sys}/{data.bp_dia} mmHg</div>
                        <div>RR: {data.resp_rate || '-'} /min</div>
                        <div>Wt: {data.weight || '-'} kg</div>
                        <div>Ht: {data.height || '-'} cm</div>
                        <div>BMI: {data.bmi || '-'}</div>
                    </div>
                    <div className="mt-2 flex gap-4">
                        <div>ดื่มสุรา: {data.alcohol ? 'ใช่' : 'ไม่'}</div>
                        <div>สูบบุหรี่: {data.smoking ? 'ใช่' : 'ไม่'}</div>
                    </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-6">
                    <h3 className="font-bold border-b border-slate-300 mb-2">การตรวจรักษา</h3>
                    <div className="grid grid-cols-1 gap-1 text-sm">
                        <p><span className="font-bold">CC:</span> {data.cc || '-'}</p>
                        <p><span className="font-bold">PE:</span> {data.pe || '-'}</p>
                        <p><span className="font-bold">Diagnosis:</span> {data.diagnosis || '-'}</p>
                        <p><span className="font-bold">ICD-10:</span> {data.icd10_code || '-'}</p>
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="mb-8">
                    <h3 className="font-bold border-b border-slate-300 mb-2">รายการยาและเวชภัณฑ์</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left">
                                <th className="py-2">รายการ</th>
                                <th className="py-2 text-right">จำนวน</th>
                                <th className="py-2 text-right">ราคา</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions && prescriptions.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-2">{item.medicines?.name}</td>
                                    <td className="py-2 text-right">{item.qty} {item.medicines?.unit}</td>
                                    <td className="py-2 text-right">{item.total_price?.toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!prescriptions || prescriptions.length === 0) && (
                                <tr><td colSpan={3} className="py-4 text-center text-slate-400">ไม่มีการสั่งยา</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold text-lg">
                                <td colSpan={2} className="py-2 text-right pt-4">ยอดสุทธิ</td>
                                <td className="py-2 text-right pt-4 text-slate-900 border-b-4 border-double border-slate-800">
                                    {data.total_cost?.toLocaleString()} บาท
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Signatures */}
                <div className="grid grid-cols-2 gap-10 mt-20 text-center text-sm break-inside-avoid">
                    <div>
                        <div className="border-b border-dotted border-slate-400 mb-2 w-3/4 mx-auto"></div>
                        <p>ลงชื่อผู้ป่วย (ยินยอมการรักษา)</p>
                    </div>
                    <div>
                        <div className="border-b border-dotted border-slate-400 mb-2 w-3/4 mx-auto"></div>
                        <p>ลงชื่อผู้ตรวจ ({data.examiner})</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
