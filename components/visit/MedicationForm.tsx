'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, Pill } from 'lucide-react';

interface MedicationFormProps {
    visitId: string;
    onNext: () => void;
    onBack: () => void;
}

interface Medicine {
    id: string;
    name: string;
    price_per_unit: number;
    unit: string;
    stock_qty: number;
}

interface PrescriptionItem {
    medicine_id: string;
    name: string;
    qty: number;
    price: number;
    unit: string;
}

export default function MedicationForm({ visitId, onNext, onBack }: MedicationFormProps) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [basket, setBasket] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Selection state
    const [selectedMedId, setSelectedMedId] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        const { data } = await supabase.from('medicines').select('*').order('name');
        if (data) setMedicines(data);
    };

    const handleAdd = () => {
        if (!selectedMedId) return;
        const med = medicines.find(m => m.id === selectedMedId);
        if (!med) return;

        const newItem: PrescriptionItem = {
            medicine_id: med.id,
            name: med.name,
            qty: qty,
            price: med.price_per_unit,
            unit: med.unit
        };

        setBasket([...basket, newItem]);
        setSelectedMedId('');
        setQty(1);
    };

    const handleRemove = (index: number) => {
        const newBasket = [...basket];
        newBasket.splice(index, 1);
        setBasket(newBasket);
    };

    const totalCost = basket.reduce((sum, item) => sum + (item.qty * item.price), 0);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Insert prescriptions
            const prescriptionPayload = basket.map(item => ({
                visit_id: visitId,
                medicine_id: item.medicine_id,
                qty: item.qty,
                price: item.price
            }));

            if (prescriptionPayload.length > 0) {
                const { error: presError } = await supabase
                    .from('prescriptions')
                    .insert(prescriptionPayload);
                if (presError) throw presError;

                // 2. Decrement stock (Naive approach: Loop. Ideally use RPC or batch)
                // For MVP loop is fine given low concurrency assumptions for a small clinic.
                for (const item of basket) {
                    // Fetch current first to check? Or just decrement.
                    // decrement field in SQL: stock_qty = stock_qty - qty
                    // Supabase doesn't have direct increment/decrement in JS client update simply.
                    // Call RPC is best. But I haven't defined RPC.
                    // I will read and update.
                    const med = medicines.find(m => m.id === item.medicine_id);
                    if (med) {
                        await supabase
                            .from('medicines')
                            .update({ stock_qty: med.stock_qty - item.qty })
                            .eq('id', item.medicine_id);
                    }
                }
            }

            // 3. Update Visit Total Cost
            const { error: visitError } = await supabase
                .from('visits')
                .update({ total_cost: totalCost })
                .eq('id', visitId);

            if (visitError) throw visitError;

            onNext();
        } catch (err) {
            console.error(err);
            alert('บันทึกการสั่งยาไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">สั่งยาและเวชภัณฑ์ (Medication)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">เลือกยา</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedMedId}
                        onChange={(e) => setSelectedMedId(e.target.value)}
                    >
                        <option value="">-- เลือกรายการยา --</option>
                        {medicines.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} (คงเหลือ: {m.stock_qty} {m.unit}) - ฿{m.price_per_unit}/{m.unit}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">จำนวน</label>
                        <Input
                            type="number" min="1"
                            value={qty}
                            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                        />
                    </div>
                    <Button type="button" onClick={handleAdd} disabled={!selectedMedId} variant="secondary">
                        <Plus className="h-4 w-4" /> เพิ่ม
                    </Button>
                </div>
            </div>

            {/* Basket Table */}
            <div className="border rounded-md overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">รายการ</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-700">ราคา/หน่วย</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-700">จำนวน</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-700">รวม</th>
                            <th className="px-4 py-3 text-center font-medium text-slate-700">ลบ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {basket.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">ยังไม่มีรายการยา</td>
                            </tr>
                        ) : basket.map((item, idx) => (
                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                <td className="px-4 py-3 text-right">{item.price}</td>
                                <td className="px-4 py-3 text-right">{item.qty} {item.unit}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-800">{(item.qty * item.price).toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => handleRemove(idx)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-blue-50">
                        <tr>
                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-blue-900">ยอดรวมทั้งสิ้น</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-900 text-lg">฿{totalCost.toLocaleString()}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onBack}>ย้อนกลับ</Button>
                <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading}>
                    <Pill className="mr-2 h-4 w-4" />
                    ยืนยันการจ่ายยา
                </Button>
            </div>
        </div>
    );
}
