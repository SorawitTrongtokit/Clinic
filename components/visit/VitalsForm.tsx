'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

interface VitalsFormProps {
    visitId: string;
    initialData?: any;
    onNext: () => void;
}

export default function VitalsForm({ visitId, initialData, onNext }: VitalsFormProps) {
    const [loading, setLoading] = useState(false);
    const [vitals, setVitals] = useState({
        temp: '',
        pulse: '',
        resp_rate: '',
        bp_sys: '',
        bp_dia: '',
        weight: '',
        height: '',
        bmi: '',
    });

    const [screening, setScreening] = useState({
        urgency: 'ไม่ฉุกเฉิน',
        alcohol: false,
        smoking: false,
    });

    useEffect(() => {
        if (initialData) {
            // if we have saved data, load it. todo.
        }
    }, [initialData]);

    // Auto Calc BMI
    useEffect(() => {
        const w = parseFloat(vitals.weight);
        const h = parseFloat(vitals.height);
        if (w > 0 && h > 0) {
            const bmi = w / ((h / 100) * (h / 100));
            setVitals(prev => ({ ...prev, bmi: bmi.toFixed(2) }));
        }
    }, [vitals.weight, vitals.height]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                temp: vitals.temp ? parseFloat(vitals.temp) : null,
                pulse: vitals.pulse ? parseInt(vitals.pulse) : null,
                resp_rate: vitals.resp_rate ? parseInt(vitals.resp_rate) : null,
                bp_sys: vitals.bp_sys ? parseInt(vitals.bp_sys) : null,
                bp_dia: vitals.bp_dia ? parseInt(vitals.bp_dia) : null,
                weight: vitals.weight ? parseFloat(vitals.weight) : null,
                height: vitals.height ? parseFloat(vitals.height) : null,
                bmi: vitals.bmi ? parseFloat(vitals.bmi) : null,
                urgency: screening.urgency,
                alcohol: screening.alcohol,
                smoking: screening.smoking,
            };

            const { error } = await supabase
                .from('visits')
                .update(payload)
                .eq('id', visitId);

            if (error) throw error;
            onNext();
        } catch (error) {
            console.error('Error saving vitals:', error);
            alert('บันทึกข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">ซักประวัติและวัดสัญญาณชีพ</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">อุณหภูมิ (T)</label>
                        <div className="relative">
                            <Input
                                type="number" step="0.1"
                                value={vitals.temp}
                                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">°C</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ชีพจร (P)</label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={vitals.pulse}
                                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">/min</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">การหายใจ (RR)</label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={vitals.resp_rate}
                                onChange={(e) => setVitals({ ...vitals, resp_rate: e.target.value })}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">/min</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ความดัน (BP)</label>
                        <div className="flex items-center gap-1">
                            <Input
                                className="text-center"
                                placeholder="Sys"
                                value={vitals.bp_sys}
                                onChange={(e) => setVitals({ ...vitals, bp_sys: e.target.value })}
                            />
                            <span className="text-slate-400">/</span>
                            <Input
                                className="text-center"
                                placeholder="Dia"
                                value={vitals.bp_dia}
                                onChange={(e) => setVitals({ ...vitals, bp_dia: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">น้ำหนัก (kg)</label>
                        <Input
                            type="number" step="0.1"
                            value={vitals.weight}
                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ส่วนสูง (cm)</label>
                        <Input
                            type="number"
                            value={vitals.height}
                            onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">BMI</label>
                        <Input
                            disabled
                            value={vitals.bmi}
                            className="bg-slate-100 font-bold text-slate-900"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4">การคัดกรองเบื้องต้น</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ระดับความเร่งด่วน</label>
                            <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-600"
                                        name="urgency"
                                        value="ไม่ฉุกเฉิน"
                                        checked={screening.urgency === 'ไม่ฉุกเฉิน'}
                                        onChange={() => setScreening({ ...screening, urgency: 'ไม่ฉุกเฉิน' })}
                                    />
                                    <span className="ml-2">ไม่ฉุกเฉิน (สีเขียว)</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-red-600"
                                        name="urgency"
                                        value="ฉุกเฉิน"
                                        checked={screening.urgency === 'ฉุกเฉิน'}
                                        onChange={() => setScreening({ ...screening, urgency: 'ฉุกเฉิน' })}
                                    />
                                    <span className="ml-2 font-medium text-red-600">ฉุกเฉิน (สีแดง)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ประวัติพฤติกรรม</label>
                            <div className="flex gap-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-blue-600 rounded"
                                        checked={screening.alcohol}
                                        onChange={(e) => setScreening({ ...screening, alcohol: e.target.checked })}
                                    />
                                    <span className="ml-2">ดื่มสุรา</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-blue-600 rounded"
                                        checked={screening.smoking}
                                        onChange={(e) => setScreening({ ...screening, smoking: e.target.checked })}
                                    />
                                    <span className="ml-2">สูบบุหรี่</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button type="submit" size="lg" disabled={loading} variant="primary">
                        ถัดไป: ตรวจรักษา
                    </Button>
                </div>
            </form>
        </div>
    );
}
