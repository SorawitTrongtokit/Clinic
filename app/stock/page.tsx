'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pill, Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react';
import { Medicine } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function StockPage() {
    const { showToast } = useToast();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form Modal State
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Quick Add Modal State
    const [quickAddMed, setQuickAddMed] = useState<Medicine | null>(null);
    const [quickAddQty, setQuickAddQty] = useState('');

    // Filter medicines based on search term
    const filteredMedicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.instruction || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [form, setForm] = useState({
        name: '',
        price_per_unit: '',
        unit: 'เม็ด',
        stock_qty: '',
        instruction: ''
    });

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('medicines').select('*').order('name');
            if (error) throw error;
            if (data) setMedicines(data as Medicine[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
            showToast(message, 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const resetForm = () => {
        setForm({ name: '', price_per_unit: '', unit: 'เม็ด', stock_qty: '', instruction: '' });
        setIsEditing(false);
        setEditId(null);
        setShowFormModal(false);
    };

    const handleAddNew = () => {
        resetForm();
        setIsEditing(false);
        setShowFormModal(true);
    };

    const handleEdit = (med: Medicine) => {
        setForm({
            name: med.name,
            price_per_unit: String(med.price_per_unit),
            unit: med.unit,
            stock_qty: String(med.stock_qty),
            instruction: med.instruction || ''
        });
        setEditId(med.id);
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันการลบยานี้?')) return;
        try {
            const { error } = await supabase.from('medicines').delete().eq('id', id);
            if (error) throw error;
            showToast('ลบรายการยาเรียบร้อยแล้ว', 'success');
            fetchMedicines();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ';
            showToast(message, 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            price_per_unit: parseFloat(form.price_per_unit),
            unit: form.unit,
            stock_qty: parseInt(form.stock_qty),
            instruction: form.instruction
        };

        try {
            if (editId) {
                const { error } = await supabase.from('medicines').update(payload).eq('id', editId);
                if (error) throw error;
                showToast('บันทึกการแก้ไขเรียบร้อยแล้ว', 'success');
            } else {
                const { error } = await supabase.from('medicines').insert([payload]);
                if (error) throw error;
                showToast('เพิ่มรายการยาเรียบร้อยแล้ว', 'success');
            }
            fetchMedicines();
            resetForm();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก';
            showToast(message, 'error');
        }
    };

    const handleQuickAddClick = (med: Medicine) => {
        setQuickAddMed(med);
        setQuickAddQty('');
    };

    const submitQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAddMed) return;

        const addQty = parseInt(quickAddQty);
        if (isNaN(addQty) || addQty <= 0) {
            showToast('กรุณาระบุจำนวนที่ถูกต้อง (ตัวเลขมากกว่า 0)', 'error');
            return;
        }

        try {
            const newQty = quickAddMed.stock_qty + addQty;
            const { error } = await supabase
                .from('medicines')
                .update({ stock_qty: newQty })
                .eq('id', quickAddMed.id);

            if (error) throw error;
            showToast(`เพิ่มสต็อก ${addQty} หน่วยเรียบร้อย (รวม: ${newQty})`, 'success');
            fetchMedicines();
            setQuickAddMed(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก';
            showToast(message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-transparent font-sans">
            <main className="container mx-auto py-12 px-4 max-w-6xl relative">
                {/* Background Decor */}
                <div className="absolute top-10 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl -z-10" />

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                            <Pill className="h-6 w-6" />
                        </div>
                        คลังยาและเวชภัณฑ์
                    </h1>
                    <Button onClick={handleAddNew} variant="primary" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200">
                        <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการยา
                    </Button>
                </div>

                {/* Table Section */}
                <div className="">
                    {/* Search Bar */}
                    <div className="mb-6 relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหายา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm shadow-sm"
                        />
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold text-slate-700">ชื่อยา / วิธีใช้</th>
                                    <th className="px-6 py-4 text-right font-bold text-slate-700">ราคา</th>
                                    <th className="px-6 py-4 text-right font-bold text-slate-700">คงเหลือ</th>
                                    <th className="px-6 py-4 text-center font-bold text-slate-700">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">กำลังโหลด...</td></tr>
                                ) : filteredMedicines.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">{searchTerm ? 'ไม่พบยาที่ค้นหา' : 'ไม่พบรายการยา'}</td></tr>
                                ) : filteredMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-base">{med.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{med.instruction || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600">฿{med.price_per_unit}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${med.stock_qty < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {med.stock_qty} {med.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleQuickAddClick(med)}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    aria-label="เพิ่มสต็อกด่วน"
                                                    title="เติมสต็อก"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(med)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    aria-label="แก้ไขข้อมูลยา"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(med.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    aria-label="ลบข้อมูลยา"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Form Modal (Add/Edit) */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'แก้ไขรายการยา' : 'เพิ่มยาใหม่'}</h3>
                                <p className="text-sm text-slate-500">กรอกข้อมูลยาและเวชภัณฑ์</p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
                                aria-label="ปิด"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">ชื่อยา</label>
                                <Input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="เช่น Paracetamol 500mg"
                                    className="bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">ราคา/หน่วย</label>
                                    <Input
                                        required type="number" step="0.01"
                                        value={form.price_per_unit}
                                        onChange={e => setForm({ ...form, price_per_unit: e.target.value })}
                                        placeholder="0.00"
                                        className="bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">หน่วยนับ</label>
                                    <Input
                                        required
                                        value={form.unit}
                                        onChange={e => setForm({ ...form, unit: e.target.value })}
                                        placeholder="เม็ด/ขวด"
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">จำนวนคงเหลือ</label>
                                <Input
                                    required type="number"
                                    value={form.stock_qty}
                                    onChange={e => setForm({ ...form, stock_qty: e.target.value })}
                                    placeholder="0"
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">วิธีใช้ (Instruction)</label>
                                <Input
                                    value={form.instruction}
                                    onChange={e => setForm({ ...form, instruction: e.target.value })}
                                    placeholder="เช่น ทานครั้งละ 1 เม็ด หลังอาหารเช้า"
                                    className="bg-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" variant={isEditing ? 'secondary' : 'primary'} className="flex-1 shadow-lg">
                                    {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการยา'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add Modal */}
            {
                quickAddMed && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">เพิ่มสต็อกด่วน</h3>
                                    <p className="text-sm text-slate-500">{quickAddMed.name}</p>
                                </div>
                                <button
                                    onClick={() => setQuickAddMed(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
                                    aria-label="ปิดหน้าต่าง"
                                    title="ปิด"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={submitQuickAdd}>
                                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">คงเหลือปัจจุบัน:</span>
                                        <span className="font-bold text-slate-900">{quickAddMed.stock_qty} {quickAddMed.unit}</span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            autoFocus
                                            type="number"
                                            min="1"
                                            placeholder="ระบุจำนวนที่เติม..."
                                            value={quickAddQty}
                                            onChange={(e) => setQuickAddQty(e.target.value)}
                                            className="bg-white text-center text-lg font-bold h-12"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                                            {quickAddMed.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setQuickAddMed(null)}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                                        disabled={!quickAddQty || parseInt(quickAddQty) <= 0}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> ยืนยันเพิ่ม
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
