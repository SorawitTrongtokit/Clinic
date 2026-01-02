'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Search } from 'lucide-react';

interface DiagnosisFormProps {
    visitId: string;
    onNext: () => void;
    onBack: () => void;
}

export default function DiagnosisForm({ visitId, onNext, onBack }: DiagnosisFormProps) {
    const [formData, setFormData] = useState({
        cc: '',
        pe: '',
        diagnosis: '',
        icd10_code: ''
    });
    const [icd10Query, setIcd10Query] = useState('');
    const [icd10Results, setIcd10Results] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (icd10Query.length < 2) {
                setIcd10Results([]);
                return;
            }
            const { data } = await supabase
                .from('icd10_codes')
                .select('*')
                .or(`code.ilike.%${icd10Query}%,description_th.ilike.%${icd10Query}%,description_en.ilike.%${icd10Query}%`)
                .limit(10);
            if (data) setIcd10Results(data);
        }, 500);
        return () => clearTimeout(timer);
    }, [icd10Query]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('visits')
                .update(formData)
                .eq('id', visitId);
            if (error) throw error;
            onNext();
        } catch (err) {
            console.error(err);
            alert('Error saving diagnosis');
        } finally {
            setLoading(false);
        }
    };

    const favorites = [
        { code: 'J00', name: 'Acute nasopharyngitis (ไข้หวัด)', desc: 'ไข้หวัด' },
        { code: 'M79.1', name: 'Myalgia (ปวดกล้ามเนื้อ)', desc: 'ปวดกล้ามเนื้อ' },
        { code: 'K29.7', name: 'Gastritis (โรคกระเพาะ)', desc: 'โรคกระเพาะอาหาร' },
        { code: 'A09', name: 'Gastroenteritis (ลำไส้อักเสบ)', desc: 'ท้องร่วง/ลำไส้อักเสบ' },
        { code: 'T14.1', name: 'Open wound (แผลเปิด)', desc: 'ทำแผล/ล้างแผล' },
    ];

    const applyDiagnosis = (code: string, desc: string) => {
        setFormData(prev => ({ ...prev, diagnosis: desc, icd10_code: code }));
        setIcd10Query(code); // Update search box to show selected code
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">การตรวจรักษา (Diagnosis)</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">อาการสำคัญ (Chief Complaint)</label>
                    <Textarea
                        rows={2}
                        value={formData.cc}
                        onChange={e => setFormData({ ...formData, cc: e.target.value })}
                        placeholder="คนไข้มาด้วยอาการอะไร..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ผลการตรวจร่างกาย (Physical Exam)</label>
                    <Textarea
                        rows={3}
                        value={formData.pe}
                        onChange={e => setFormData({ ...formData, pe: e.target.value })}
                        placeholder="ผลการตรวจ..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">โรคที่พบบ่อย (เลือกด่วน)</label>
                        <div className="flex flex-wrap gap-2">
                            {favorites.map(fav => (
                                <button
                                    type="button"
                                    key={fav.code}
                                    onClick={() => applyDiagnosis(fav.code, fav.desc)}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200"
                                >
                                    {fav.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัส ICD-10 (ค้นหา)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                className="pl-9"
                                value={icd10Query}
                                onChange={e => setIcd10Query(e.target.value)}
                                placeholder="พิมพ์รหัส หรือชื่อโรค (ไทย/Eng)..."
                            />
                            {icd10Results.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {icd10Results.map(res => (
                                        <div
                                            key={res.code}
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                                            onClick={() => {
                                                applyDiagnosis(res.code, res.description_th || res.description_en);
                                                setIcd10Results([]);
                                            }}
                                        >
                                            <span className="font-bold text-blue-600 w-16 inline-block">{res.code}</span>
                                            <span>{res.description_th || res.description_en}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">คำวินิจฉัย (Diagnosis)</label>
                        <Input
                            value={formData.diagnosis}
                            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onBack}>ย้อนกลับ</Button>
                    <Button type="submit" variant="primary" disabled={loading}>ถัดไป: สั่งยา</Button>
                </div>
            </form>
        </div>
    );
}
