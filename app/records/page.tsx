'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, User, ArrowRight, Phone, FileText } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Patient } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function RecordsPage() {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setPatients((data as Patient[]) || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
            showToast(message, 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.hn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.id_card || '').includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-transparent font-sans">
            <main className="container mx-auto py-12 px-4 max-w-6xl relative">
                {/* Background Decor */}
                <div className="absolute top-10 left-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-10 right-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10" />

                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                                <Users className="h-8 w-8" />
                            </div>
                            ทะเบียนผู้ป่วย
                        </h1>
                        <p className="text-slate-500 mt-1 ml-1">รายชื่อผู้ป่วยทั้งหมดในระบบ ({patients.length})</p>
                    </div>
                </div>

                {/* Search & Toolbar */}
                <div className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-white/50 mb-8 ring-1 ring-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            placeholder="ค้นหา: ชื่อ, นามสกุล, HN, หรือ เลขบัตรประชาชน"
                            className="pl-12 h-12 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link href="/patients">
                        <Button className="h-12 px-6 bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
                            + ลงทะเบียนใหม่
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-5">HN</th>
                                    <th className="px-6 py-5">ชื่อ-นามสกุล</th>
                                    <th className="px-6 py-5">เบอร์โทรศัพท์</th>
                                    <th className="px-6 py-5">อายุ</th>
                                    <th className="px-6 py-5 text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">ไม่พบรายชื่อผู้ป่วย</td></tr>
                                ) : (
                                    filteredPatients.map((patient) => {
                                        const age = new Date().getFullYear() - new Date(patient.birthdate).getFullYear();
                                        return (
                                            <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-medium text-slate-500">
                                                    {patient.hn}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                                                            {patient.first_name[0]}
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-lg">
                                                            {patient.prefix} {patient.first_name} {patient.last_name}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 ml-11 flex items-center gap-1">
                                                        บัตรปชช: {patient.id_card}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {patient.phone ? (
                                                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                                                            <Phone className="h-4 w-4 text-slate-400" /> {patient.phone}
                                                        </div>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {age} ปี
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/patients/${patient.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                            ดูประวัติ <ArrowRight className="ml-1 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
