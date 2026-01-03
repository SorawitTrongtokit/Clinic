'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Banknote, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Expense {
    id: string;
    date: string;
    title: string;
    amount: number;
    category: string;
    remark?: string;
}

export default function AccountingPage() {
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [incomeData, setIncomeData] = useState<any[]>([]);

    // Summary States
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    // Filter
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        title: '',
        amount: '',
        category: 'ค่าใช้จ่ายทั่วไป',
        remark: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Expenses for selected month
            let startDate = `${selectedMonth}-01`;
            let endDate = `${selectedMonth}-31`; // Approx

            const { data: expData, error: expError } = await supabase
                .from('expenses')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (expError) throw expError;
            setExpenses(expData || []);

            // Fetch Income (Visits) for selected month
            // We need to query visits where created_at is in the month
            const { data: visitData, error: visitError } = await supabase
                .from('visits')
                .select('total_cost, created_at')
                .gte('created_at', `${startDate}T00:00:00`)
                .lte('created_at', `${endDate}T23:59:59`);

            if (visitError) throw visitError;
            setIncomeData(visitData || []);

            // Calculate Totals
            const calcExp = (expData || []).reduce((sum, item) => sum + Number(item.amount), 0);
            const calcInc = (visitData || []).reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

            setTotalExpense(calcExp);
            setTotalIncome(calcInc);

        } catch (err) {
            console.error(err);
            // Don't show toast on first load if table doesn't exist yet, to avoid annoyance
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('expenses').insert([{
                date: form.date,
                title: form.title,
                amount: parseFloat(form.amount),
                category: form.category,
                remark: form.remark
            }]);

            if (error) throw error;
            showToast('บันทึกค่าใช้จ่ายแล้ว', 'success');
            setShowForm(false);
            setForm({ ...form, title: '', amount: '', remark: '' });
            fetchData();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error saving expense';
            showToast(message, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบรายการนี้?')) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Banknote className="h-8 w-8 text-teal-600" />
                            บัญชี / รายรับ-รายจ่าย
                        </h1>
                        <p className="text-slate-500 mt-1">ภาพรวมสถานะทางการเงินของคลินิก</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium"
                            aria-label="เลือกเดือน"
                        />
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Income */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 translate-x-16 group-hover:bg-green-100 transition-colors" />
                        <div className="relative">
                            <p className="text-sm font-medium text-slate-500 mb-1">รายรับเดือนนี้</p>
                            <h3 className="text-3xl font-bold text-green-600 flex items-center gap-2">
                                {totalIncome.toLocaleString()}
                                <span className="text-sm text-green-400 font-normal">บาท</span>
                            </h3>
                            <div className="flex items-center gap-1 mt-4 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                <TrendingUp className="h-3 w-3" />
                                {incomeData.length} รายการ
                            </div>
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-16 translate-x-16 group-hover:bg-red-100 transition-colors" />
                        <div className="relative">
                            <p className="text-sm font-medium text-slate-500 mb-1">รายจ่ายเดือนนี้</p>
                            <h3 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                                {totalExpense.toLocaleString()}
                                <span className="text-sm text-red-400 font-normal">บาท</span>
                            </h3>
                            <div className="flex items-center gap-1 mt-4 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                <TrendingDown className="h-3 w-3" />
                                {expenses.length} รายการ
                            </div>
                        </div>
                    </div>

                    {/* Net */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 transition-colors ${totalIncome - totalExpense >= 0 ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-orange-50 group-hover:bg-orange-100'}`} />
                        <div className="relative">
                            <p className="text-sm font-medium text-slate-500 mb-1">กำไรสุทธิ</p>
                            <h3 className={`text-3xl font-bold flex items-center gap-2 ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {(totalIncome - totalExpense).toLocaleString()}
                                <span className={`text-sm font-normal ${totalIncome - totalExpense >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>บาท</span>
                            </h3>
                            <div className={`flex items-center gap-1 mt-4 text-xs font-medium px-2 py-1 rounded-full w-fit ${totalIncome - totalExpense >= 0 ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50'}`}>
                                <DollarSign className="h-3 w-3" />
                                {((totalIncome - totalExpense) / (totalIncome || 1) * 100).toFixed(1)}% margin
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expense List Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">รายการค่าใช้จ่าย</h2>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            variant="primary"
                            className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200"
                        >
                            <Plus className="h-4 w-4 mr-2" /> บันทึกรายจ่าย
                        </Button>
                    </div>

                    {/* Expense Form */}
                    {showForm && (
                        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top duration-300">
                            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">วันที่</label>
                                    <Input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">รายการ</label>
                                    <Input
                                        type="text"
                                        placeholder="เช่น ค่าไฟ, ซื้อยา, เงินเดือน"
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนเงิน</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="mb-[2px]">บันทึก</Button>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium">วันที่</th>
                                    <th className="px-6 py-4 text-left font-medium">รายการ</th>
                                    <th className="px-6 py-4 text-left font-medium">หมวดหมู่</th>
                                    <th className="px-6 py-4 text-right font-medium">จำนวนเงิน</th>
                                    <th className="px-6 py-4 text-center font-medium">ลบ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
                                ) : expenses.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">ไม่มีรายการค่าใช้จ่ายในเดือนนี้</td></tr>
                                ) : expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-600">{new Date(exp.date).toLocaleDateString('th-TH')}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{exp.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">
                                            -{Number(exp.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(exp.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                aria-label="ลบรายการ"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
