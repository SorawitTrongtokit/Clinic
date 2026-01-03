'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, Pill, Search, X } from 'lucide-react';
import { Medicine, PrescriptionItem } from '@/types';

interface MedicationFormProps {
    initialData?: { basket?: PrescriptionItem[] };
    onNext: (data: { basket: PrescriptionItem[]; total_cost: number }) => void;
    onBack: () => void;
}

export default function MedicationForm({ initialData, onNext, onBack }: MedicationFormProps) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [basket, setBasket] = useState<PrescriptionItem[]>(initialData?.basket || []);
    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [qty, setQty] = useState<string>('1');
    const [showDropdown, setShowDropdown] = useState(false);
    const [serviceFee, setServiceFee] = useState<string>('0');

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        const { data } = await supabase.from('medicines').select('*').order('name');
        if (data) setMedicines(data as Medicine[]);
    };

    // Filter medicines based on search query
    const filteredMedicines = useMemo(() => {
        if (!searchQuery.trim()) return medicines;
        const query = searchQuery.toLowerCase();
        return medicines.filter(m =>
            m.name.toLowerCase().includes(query)
        );
    }, [medicines, searchQuery]);

    const handleSelectMedicine = (med: Medicine) => {
        setSelectedMed(med);
        setSearchQuery(med.name);
        setShowDropdown(false);
    };

    const handleClearSelection = () => {
        setSelectedMed(null);
        setSearchQuery('');
    };

    const handleAdd = () => {
        const numQty = parseInt(qty) || 0;
        if (!selectedMed || numQty < 1) return;

        const newItem: PrescriptionItem = {
            medicine_id: selectedMed.id,
            name: selectedMed.name,
            qty: numQty,
            price: selectedMed.price_per_unit,
            unit: selectedMed.unit
        };

        setBasket([...basket, newItem]);
        setSelectedMed(null);
        setSearchQuery('');
        setQty('1');
    };

    const handleRemove = (index: number) => {
        const newBasket = [...basket];
        newBasket.splice(index, 1);
        setBasket(newBasket);
    };

    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string or valid numbers
        if (value === '' || /^\d+$/.test(value)) {
            setQty(value);
        }
    };

    const numQty = parseInt(qty) || 0;
    const maxStock = selectedMed?.stock_qty || 0;
    const isOverStock = selectedMed && numQty > maxStock;
    const canAdd = selectedMed && numQty >= 1 && numQty <= maxStock;
    const numServiceFee = parseInt(serviceFee) || 0;
    const medicationCost = basket.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const totalCost = medicationCost + numServiceFee;

    const handleSubmit = () => {
        onNext({
            basket: basket,
            total_cost: totalCost
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">สั่งยาและเวชภัณฑ์ (Medication)</h2>

            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
                {/* Searchable Medicine Input */}
                <div className="flex-1 relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Search className="inline h-4 w-4 mr-1" />
                        ค้นหา/เลือกยา
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="พิมพ์ชื่อยาเพื่อค้นหา..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                                if (selectedMed && e.target.value !== selectedMed.name) {
                                    setSelectedMed(null);
                                }
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className={`h-10 ${selectedMed ? 'pr-8 bg-green-50 border-green-300' : ''}`}
                        />
                        {selectedMed && (
                            <button
                                onClick={handleClearSelection}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                type="button"
                                title="ล้างการเลือกยา"
                                aria-label="ล้างการเลือกยา"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Results */}
                    {showDropdown && !selectedMed && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredMedicines.length === 0 ? (
                                <div className="px-4 py-3 text-slate-500 text-sm">
                                    ไม่พบยาที่ค้นหา
                                </div>
                            ) : (
                                filteredMedicines.slice(0, 20).map(m => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleSelectMedicine(m)}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-800">{m.name}</span>
                                            <span className="text-xs text-slate-500 ml-2">
                                                (คงเหลือ: {m.stock_qty} {m.unit})
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            ฿{m.price_per_unit}/{m.unit}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Selected Medicine Info */}
                    {selectedMed && (
                        <p className="text-xs text-green-600 mt-1">
                            ✓ เลือกแล้ว: {selectedMed.name} - ฿{selectedMed.price_per_unit}/{selectedMed.unit} (คงเหลือ: {selectedMed.stock_qty})
                        </p>
                    )}
                </div>

                {/* Quantity and Add Button */}
                <div className="flex items-end gap-2 shrink-0">
                    <div className="w-20">
                        <label className="block text-sm font-medium text-slate-700 mb-1">จำนวน</label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={qty}
                            onChange={handleQtyChange}
                            onBlur={() => {
                                if (!qty || parseInt(qty) < 1) {
                                    setQty('1');
                                }
                                if (selectedMed && parseInt(qty) > selectedMed.stock_qty) {
                                    setQty(String(selectedMed.stock_qty));
                                }
                            }}
                            className={`h-10 text-center ${isOverStock ? 'border-red-500 bg-red-50' : ''}`}
                        />
                        {isOverStock && (
                            <p className="text-xs text-red-500 mt-1 absolute">สูงสุด {maxStock}</p>
                        )}
                    </div>
                    <Button
                        type="button"
                        onClick={handleAdd}
                        disabled={!canAdd}
                        variant="secondary"
                        title={!selectedMed ? 'เลือกยาก่อน' : isOverStock ? `สูงสุด ${maxStock}` : numQty < 1 ? 'ใส่จำนวนก่อน' : 'เพิ่มยา'}
                        className="h-10 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" /> เพิ่ม
                    </Button>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && !selectedMed && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}

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
                                    <button
                                        onClick={() => handleRemove(idx)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        aria-label="ลบรายการ"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-blue-50">
                        <tr className="border-b border-blue-100">
                            <td colSpan={3} className="px-4 py-2 text-right text-slate-600">ค่ายา</td>
                            <td className="px-4 py-2 text-right text-slate-600">฿{medicationCost.toLocaleString()}</td>
                            <td></td>
                        </tr>
                        <tr className="border-b border-blue-100">
                            <td colSpan={3} className="px-4 py-2 text-right text-slate-600">
                                <div className="flex items-center justify-end gap-2">
                                    <span>ค่าบริการ</span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={serviceFee}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || /^\d+$/.test(val)) {
                                                setServiceFee(val);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (!serviceFee) setServiceFee('0');
                                        }}
                                        className="w-24 h-8 text-center text-sm"
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-2 text-right text-slate-600">฿{numServiceFee.toLocaleString()}</td>
                            <td></td>
                        </tr>
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
                <Button type="button" variant="primary" onClick={handleSubmit}>
                    <Pill className="mr-2 h-4 w-4" />
                    ยืนยันการจ่ายยา
                </Button>
            </div>
        </div>
    );
}

