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
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);

    // Consolidated State for New Visit
    const [formData, setFormData] = useState({
        patient_id: '',
        patient: null as any, // Patient details
        ...initialVitals,
        ...initialDiagnosis,
        basket: [] as any[], // prescriptions
        total_cost: 0,
        examiner: 'น.ส.ภัทรภร พวงอุบล'
    });

    const isNew = id === 'new';

    useEffect(() => {
        if (isNew) {
            const params = new URLSearchParams(window.location.search);
            const pid = params.get('patient_id');
            if (pid) {
                fetchPatient(pid);
            } else {
                router.push('/patients');
            }
        } else {
            fetchExistingVisit();
        }
    }, [id]);

    const fetchPatient = async (pid: string) => {
        const { data, error } = await supabase.from('patients').select('*').eq('id', pid).single();
        if (data) {
            setFormData(prev => ({ ...prev, patient_id: pid, patient: data }));
            setLoading(false);
        } else {
            alert('Patient not found');
            router.push('/patients');
        }
    };

    const fetchExistingVisit = async () => {
        if (!id) return;
        const { data, error } = await supabase
            .from('visits')
            .select('*, patients(*), prescriptions(*, medicines(*))')
            .eq('id', id)
            .single();

        if (data) {
            // Map existing data to formData structure for viewing/editing if needed
            // For now, we mainly use it for viewing.
            setFormData({
                ...data, // naive spread, might need explicit mapping
                patient: data.patients,
                basket: data.prescriptions?.map((p: any) => ({
                    medicine_id: p.medicine_id,
                    name: p.medicines?.name,
                    qty: p.qty,
                    price: p.price,
                    unit: p.medicines?.unit
                })) || []
            });
            setLoading(false);

            // Check if completed to auto-switch to summary
            const isCompleted = data.total_cost || data.diagnosis;
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('mode') === 'view' || isCompleted) {
                setStep(4);
            }
        } else {
            alert('Visit not found');
            router.push('/patients');
        }
    };

    const updateFormData = (updates: any) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleFinalSave = async () => {
        if (isSaving) return; // Prevent double submit
        setIsSaving(true);
        try {
            console.log('Submitting Visit Data (RPC):', formData);

            // 1. Prepare Visit Data (JSON for RPC)
            const visitData = {
                temp: formData.temp ? parseFloat(formData.temp) : null,
                pulse: formData.pulse ? parseInt(formData.pulse) : null,
                resp_rate: formData.resp_rate ? parseInt(formData.resp_rate) : null,
                bp_sys: formData.bp_sys ? parseInt(formData.bp_sys) : null,
                bp_dia: formData.bp_dia ? parseInt(formData.bp_dia) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                height: formData.height ? parseFloat(formData.height) : null,
                bmi: formData.bmi ? parseFloat(formData.bmi) : null,
                urgency: formData.urgency,
                alcohol: formData.alcohol,
                smoking: formData.smoking,
                cc: formData.cc,
                pe: formData.pe,
                diagnosis: formData.diagnosis,
                icd10_code: formData.icd10_code || null,
                total_cost: formData.total_cost
            };

            // 2. Prepare Prescriptions (Array for RPC)
            const prescriptions = formData.basket.map((item: any) => ({
                medicine_id: item.medicine_id,
                qty: item.qty,
                price: item.price
            }));

            // 3. Call RPC Transaction
            const { data, error } = await supabase.rpc('save_visit_transaction', {
                p_patient_id: formData.patient_id,
                p_examiner: formData.examiner,
                p_visit_data: visitData,
                p_prescriptions: prescriptions
            });

            if (error) {
                console.error('RPC Save Error:', error);
                throw new Error('บันทึกข้อมูลไม่สำเร็จ: ' + error.message);
            }

            console.log('Transaction Success:', data);

            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
            router.push('/patients/' + formData.patient_id); // Go back to patient history

        } catch (error: any) {
            console.error('Final Save Error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || JSON.stringify(error)));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    if (!formData.patient) return null;

    const patientInfo = formData.patient;

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
                            {patientInfo.prefix} {patientInfo.first_name} {patientInfo.last_name}
                        </h1>
                        <div className="flex gap-3 text-sm text-slate-500 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">HN: {patientInfo.hn}</span>
                            <span>อายุ: {new Date().getFullYear() - new Date(patientInfo.birthdate).getFullYear()} ปี</span>
                            <span>สิทธิ: {patientInfo.treatment_right}</span>
                            {patientInfo.drug_allergy && (
                                <span className="text-red-600 font-bold bg-red-50 px-2 rounded">แพ้ยา: {patientInfo.drug_allergy}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">ผู้ตรวจ: {formData.examiner}</span>
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
                        <VitalsForm
                            initialData={formData}
                            onNext={(data) => {
                                updateFormData(data);
                                setStep(2);
                            }}
                        />
                    )}
                    {step === 2 && (
                        <DiagnosisForm
                            initialData={formData}
                            onNext={(data) => {
                                updateFormData(data);
                                setStep(3);
                            }}
                            onBack={() => setStep(1)}
                        />
                    )}
                    {step === 3 && (
                        <MedicationForm
                            initialData={formData}
                            onNext={(data) => {
                                updateFormData(data);
                                setStep(4);
                            }}
                            onBack={() => setStep(2)}
                        />
                    )}
                    {step === 4 && (
                        <SummaryView
                            data={formData}
                            onSave={isNew ? handleFinalSave : undefined}
                            isNew={isNew}
                            isSaving={isSaving}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const initialVitals = {
    temp: '', pulse: '', resp_rate: '', bp_sys: '', bp_dia: '', weight: '', height: '', bmi: '',
    urgency: 'ไม่ฉุกเฉิน', alcohol: false, smoking: false
};
const initialDiagnosis = {
    cc: '', pe: '', diagnosis: '', icd10_code: ''
};
