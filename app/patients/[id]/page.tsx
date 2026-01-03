'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { formatAddress } from '@/lib/utils';
import RegistrationForm from '@/components/patients/RegistrationForm';
import VisitTimeline from '@/components/patients/VisitTimeline';
import VitalSignsChart from '@/components/patients/VitalSignsChart';
import PatientNotes from '@/components/patients/PatientNotes';
import { User, FileText, Printer, Clock, ArrowLeft, AlertCircle, Phone, MapPin, Edit, Activity, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import { Patient, Visit } from '@/types';

type TabType = 'overview' | 'timeline' | 'vitals';


export default function PatientRecordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Patient
            const { data: p, error: pError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (pError) throw pError;
            setPatient(p);

            // Fetch Visits with prescriptions
            const { data: v, error: vError } = await supabase
                .from('visits')
                .select(`
                    *,
                    prescriptions (
                        qty,
                        medicines (name, unit)
                    )
                `)
                .eq('patient_id', id)
                .order('created_at', { ascending: false });

            if (vError) throw vError;
            setVisits(v || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartVisit = async () => {
        if (!patient) return;
        try {
            const { data, error } = await supabase
                .from('visits')
                .insert([{ patient_id: patient.id, examiner: 'น.ส.ภัทรภร พวงอุบล' }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                router.push(`/visit/${data.id}`);
            }
        } catch (err) {
            console.error(err);
            alert('Cannot start visit');
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    if (!patient) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Patient not found</div>;

    const age = new Date().getFullYear() - new Date(patient.birthdate).getFullYear();

    return (
        <div className="min-h-screen bg-transparent font-sans">
            <main className="container mx-auto py-8 px-4 max-w-6xl relative">
                {/* Background Decor */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />

                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-800">ระเบียนประวัติผู้ป่วย (EMR)</h1>
                </div>

                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
                        >
                            <RegistrationForm
                                initialData={patient}
                                onSuccess={(updatedPatient) => {
                                    setPatient(updatedPatient);
                                    setIsEditing(false);
                                }}
                                onCancel={() => setIsEditing(false)}
                            />
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Patient Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden sticky top-6"
                        >
                            <div className="bg-gradient-to-tr from-slate-700 to-slate-800 p-6 text-white text-center">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full mx-auto flex items-center justify-center mb-4 ring-4 ring-white/10">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-xl font-bold">{patient.prefix} {patient.first_name} {patient.last_name}</h2>
                                <p className="text-slate-300 text-sm mt-1">HN: {patient.hn}</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                                    title="แก้ไขข้อมูล"
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">เลขบัตรประชาชน</p>
                                    <p className="text-slate-900 font-medium">{patient.id_card}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">อายุ</p>
                                        <p className="text-slate-900 font-medium">{age} ปี</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">เพศ</p>
                                        <p className="text-slate-900 font-medium">{patient.gender === 'male' ? 'ชาย' : 'หญิง'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">สิทธิการรักษา</p>
                                    <p className="text-slate-900 font-medium">{patient.treatment_right}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> ที่อยู่
                                    </p>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {formatAddress(patient.address)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> เบอร์โทรศัพท์
                                    </p>
                                    <p className="text-slate-900 font-medium">{patient.phone || '-'}</p>
                                </div>

                                <div className={`p-4 rounded-xl ${patient.drug_allergy ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                    <h3 className={`font-bold flex items-center gap-2 ${patient.drug_allergy ? 'text-red-700' : 'text-green-700'}`}>
                                        <AlertCircle className="h-5 w-5" />
                                        {patient.drug_allergy ? 'ประวัติแพ้ยา' : 'ไม่พบประวัติแพ้ยา'}
                                    </h3>
                                    {patient.drug_allergy && (
                                        <p className="text-red-600 mt-1 pl-7 font-medium">{patient.drug_allergy}</p>
                                    )}
                                </div>

                                <Button onClick={handleStartVisit} className="w-full shadow-lg shadow-blue-200" size="lg">
                                    <FileText className="mr-2 h-4 w-4" /> เริ่มการรักษาครั้งใหม่
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content: Tabbed View */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Notes - Always visible at top */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-slate-200 p-5"
                        >
                            <PatientNotes patientId={patient.id} initialNotes={patient.notes || ''} />
                        </motion.div>

                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/80 backdrop-blur rounded-3xl shadow-lg border border-slate-200 overflow-hidden min-h-[500px]"
                        >
                            {/* Tab Navigation */}
                            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'overview'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <LayoutList className="h-4 w-4" />
                                    ภาพรวม ({visits.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'timeline'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <Clock className="h-4 w-4" />
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setActiveTab('vitals')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === 'vitals'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <Activity className="h-4 w-4" />
                                    กราฟ Vital Signs
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Overview Tab - Original table-like view */}
                                {activeTab === 'overview' && (
                                    <>
                                        {visits.length === 0 ? (
                                            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p>ยังไม่มีประวัติการรักษา</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 -mt-2">
                                                {visits.map((visit) => (
                                                    <div key={visit.id} className="py-4 hover:bg-slate-50/50 transition-colors group rounded-lg px-2 -mx-2">
                                                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-blue-700">
                                                                        {visit.created_at && new Date(visit.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                                        {visit.created_at && new Date(visit.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-slate-600">
                                                                    <span className="font-bold text-slate-700">DX:</span> {visit.diagnosis || '-'}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-slate-900">฿{visit.total_cost?.toLocaleString() || '0'}</div>
                                                                <div className="text-xs text-slate-500">{visit.examiner}</div>
                                                            </div>
                                                        </div>

                                                        {/* Quick vitals */}
                                                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                                                            {visit.weight && <span className="bg-slate-100 px-2 py-0.5 rounded">Wt: {visit.weight}</span>}
                                                            {visit.bp_sys && <span className="bg-slate-100 px-2 py-0.5 rounded">BP: {visit.bp_sys}/{visit.bp_dia}</span>}
                                                            {visit.temp && <span className="bg-slate-100 px-2 py-0.5 rounded">T: {visit.temp}</span>}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                            <a href={`/print/visit/${visit.id}`} target="_blank">
                                                                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                                                                    <Printer className="w-3 h-3" /> ใบรับรอง
                                                                </Button>
                                                            </a>
                                                            <a href={`/print/labels/${visit.id}`} target="_blank">
                                                                <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                                                                    <Printer className="w-3 h-3" /> สติ๊กเกอร์ยา
                                                                </Button>
                                                            </a>
                                                            <Button variant="secondary" size="sm" className="gap-1 h-7 text-xs" onClick={() => router.push(`/visit/${visit.id}?mode=view`)}>
                                                                ดูรายละเอียด
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Timeline Tab */}
                                {activeTab === 'timeline' && (
                                    <VisitTimeline visits={visits} />
                                )}

                                {/* Vital Signs Chart Tab */}
                                {activeTab === 'vitals' && (
                                    <VitalSignsChart visits={visits} />
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
