'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter to fix potential router issues
import { supabase } from '@/lib/supabase';
import VitalsForm from '@/components/visit/VitalsForm';
import { Button } from '@/components/ui/Button';
import { ChevronRight, Check } from 'lucide-react';
import DiagnosisForm from '@/components/visit/DiagnosisForm';
import MedicationForm from '@/components/visit/MedicationForm';
import SummaryView from '@/components/visit/SummaryView';

export default function VisitPage() {
    const { id } = useParams();
    const router = useRouter();
    const [visit, setVisit] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    // Determine if we should start in view mode (Step 4)
    // We can check query param or if the visit is "completed" (has total_cost/diagnosis)

    useEffect(() => {
        if (visit) {
            // Logic to auto-jump to summary if detailed data exists usually implies a past visit
            // OR if a query param ?mode=view is present (we can add this to the router push)
            const isCompleted = visit.total_cost || visit.diagnosis; // Simple heuristic
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('mode') === 'view' || isCompleted) {
                setStep(4);
            }
        }
    }, [visit]);

    const fetchVisit = useCallback(async () => {
        if (!id) return; // Ensure id is available before fetching
        try {
            const { data, error } = await supabase
                .from('visits')
                .select('*, patients(*), prescriptions(*, medicines(*))') // Fetch prescriptions and meds
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setVisit(data);
            }
        } catch (err) {
            console.error(err);
            alert('ไม่พบข้อมูลการตรวจ');
            router.push('/patients');
        } finally {
            setLoading(false);
        }
    }, [id, router]); // Dependencies for useCallback

    useEffect(() => {
        if (id) {
            fetchVisit();
        }
    }, [id, fetchVisit]); // fetchVisit is now a dependency

    // Refresh data when entering Summary step
    useEffect(() => {
        if (step === 4 && id) {
            fetchVisit();
        }
    }, [step, id, fetchVisit]); // fetchVisit is now a dependency

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    if (!visit) return null;

    const steps = [
        { num: 1, label: 'คัดกรอง' },
        { num: 2, label: 'ตรวจรักษา' },
        { num: 3, label: 'สั่งยา' },
        { num: 4, label: 'สรุป/พิมพ์' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header: Patient Info */}
            <div className="bg-white border-b border-slate-200 py-4 px-3 sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            {visit.patients.prefix} {visit.patients.first_name} {visit.patients.last_name}
                        </h1>
                        <div className="flex gap-3 text-sm text-slate-500 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">HN: {visit.patients.hn}</span>
                            <span>อายุ: {new Date().getFullYear() - new Date(visit.patients.birthdate).getFullYear()} ปี</span>
                            <span>สิทธิ: {visit.patients.treatment_right}</span>
                            {visit.patients.drug_allergy && (
                                <span className="text-red-600 font-bold bg-red-50 px-2 rounded">แพ้วยา: {visit.patients.drug_allergy}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">ผู้ตรวจ: {visit.examiner}</span>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center mb-8">
                    {steps.map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step === s.num ? 'bg-blue-600 text-white' : step > s.num ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${step === s.num ? 'text-blue-800' : 'text-slate-500'} hidden md:inline`}>
                                {s.label}
                            </span>
                            {idx < steps.length - 1 && (
                                <div className={`w-8 h-0.5 mx-2 md:mx-4 ${step > s.num ? 'bg-green-500' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    {step === 1 && (
                        <VitalsForm visitId={id as string} onNext={() => setStep(2)} />
                    )}
                    {step === 2 && (
                        <DiagnosisForm
                            visitId={id as string}
                            onNext={() => setStep(3)}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <MedicationForm
                            visitId={id as string}
                            onNext={() => setStep(4)}
                            onBack={() => setStep(2)}
                        />
                    )}
                    {step === 4 && (
                        <SummaryView visitId={id as string} visitData={visit} />
                    )}
                </div>
            </div>
        </div>
    );
}
