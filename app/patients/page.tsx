'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, UserPlus, FileText, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import RegistrationForm from '@/components/patients/RegistrationForm';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Patient } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function PatientsPage() {
    const { showToast } = useToast();
    const [searchId, setSearchId] = useState('');
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [startingVisit, setStartingVisit] = useState(false);
    const router = useRouter();

    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchId.length >= 3) {
                handleRealtimeSearch(searchId);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchId]);

    const handleRealtimeSearch = async (term: string) => {
        setIsSearching(true);
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .or(`id_card.ilike.${term}%,first_name.ilike.${term}%`)
                .limit(5);

            if (error) throw error;
            if (data) {
                setSearchResults(data as Patient[]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการค้นหา';
            showToast(message, 'error');
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleStartVisit = async () => {
        if (!patient) return;
        setStartingVisit(true);
        // Navigate to /visit/new with patient_id query param
        // We defer creation until the end of the wizard
        router.push(`/visit/new?patient_id=${patient.id}`);
        setStartingVisit(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
        if (val.length <= 13) {
            setSearchId(val);
            // If user clears input or it's short, reset everything
            if (val.length === 0) {
                setPatient(null);
                setSearched(false);
                setSearchResults([]);
            } else if (val.length === 13) {
                // If 13 digits - check exact match auto selection could be nice, 
                // but let's just let the search run. 
                // We'll set 'searched' to true to show the form if NOT found.
                // But logic is tricky: wait for search results.
                // Let's rely on the user clicking or the "Register New" appearing if 0 results
            }
        }
    };

    const selectPatient = (p: Patient) => {
        setPatient(p);
        setSearchId(p.id_card);
        setSearchResults([]);
        setSearched(true);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patient && searchId.length > 0) {
            setSearched(true);
        }
    };

    return (
        <div className="min-h-screen bg-transparent font-sans">
            <main className="container mx-auto py-12 px-4 max-w-5xl relative">
                {/* Background Decor */}
                <div className="absolute top-10 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-10 left-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <Search className="h-6 w-6" />
                        </div>
                        ค้นหา / ลงทะเบียนผู้ป่วย
                    </h1>
                    <p className="text-slate-500">กรอกเลขบัตรประชาชนเพื่อค้นหาประวัติ (ระบบค้นหาอัตโนมัติ)</p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/50 mb-10 ring-1 ring-slate-100 max-w-4xl mx-auto relative z-20"
                >
                    <form onSubmit={handleManualSubmit} className="relative">
                        <div className="w-full relative">
                            <label htmlFor="id_card" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                                เลขบัตรประชาชน (13 หลัก)
                            </label>
                            <Input
                                id="id_card"
                                placeholder="เลขบัตรประชาชน... (กรอกได้เฉพาะตัวเลข)"
                                value={searchId}
                                onChange={handleInputChange}
                                autoFocus
                                className="text-lg h-14 pl-4 bg-white shadow-inner font-mono tracking-wider"
                            />
                            {/* Real-time Spinner */}
                            {isSearching && (
                                <div className="absolute right-4 top-[3.2rem] transform -translate-y-1/2">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && !patient && (
                            <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 mt-2 overflow-hidden z-30">
                                <div className="p-2 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    ผลการค้นหา ({searchResults.length})
                                </div>
                                {searchResults.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => selectPatient(p)}
                                        className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                {p.first_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                    {p.prefix} {p.first_name} {p.last_name}
                                                </p>
                                                <p className="text-xs text-slate-500">HN: {p.hn} | ID: {p.id_card}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                            เลือก
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </motion.div>

                {/* Results */}
                {searched && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {patient ? (
                            <div className="space-y-8">
                                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 flex justify-between items-center text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                                                <User className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">พบข้อมูลผู้ป่วย</h2>
                                                <p className="text-blue-100 opacity-90">ในระบบฐานข้อมูล</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold bg-white/20 backdrop-blur px-4 py-1.5 rounded-full border border-white/30">
                                            HN: {patient.hn}
                                        </span>
                                    </div>
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50">
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">ชื่อ-สกุล</p>
                                            <p className="text-xl font-bold text-slate-800">{patient.prefix} {patient.first_name} {patient.last_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">อายุ</p>
                                            <p className="text-xl font-bold text-slate-800">
                                                {new Date().getFullYear() - new Date(patient.birthdate).getFullYear()} ปี
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">สิทธิการรักษา</p>
                                            <p className="text-xl font-bold text-slate-800">{patient.treatment_right}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">แพ้ยา</p>
                                            <p className={`text-xl font-bold ${patient.drug_allergy ? 'text-red-500' : 'text-green-600'}`}>
                                                {patient.drug_allergy ? `แพ้: ${patient.drug_allergy}` : 'ไม่พบประวัติแพ้ยา'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                                        <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => router.push(`/patients/${patient.id}`)}>
                                            <FileText className="h-5 w-5" /> ดูระเบียนประวัติ
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="gap-2 w-full sm:w-auto shadow-blue-300/50 shadow-lg"
                                            onClick={handleStartVisit}
                                            disabled={startingVisit}
                                            size="lg"
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            {startingVisit ? 'กำลังสร้าง...' : 'เริ่มการรักษา'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
                                <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-8 py-6 flex items-center gap-4 text-white">
                                    <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">ไม่พบข้อมูลผู้ป่วย</h2>
                                        <p className="text-orange-50 font-medium">กรุณากรอกข้อมูลเพื่อลงทะเบียนใหม่</p>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <RegistrationForm initialIdCard={searchId} onSuccess={(p) => setPatient(p)} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
