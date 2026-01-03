'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Save, MapPin } from 'lucide-react';

import { Patient, Address } from '@/types';

interface RegistrationFormProps {
    initialIdCard?: string;
    onSuccess: (patient: Patient) => void;
    initialData?: Patient;
    onCancel?: () => void;
}

export default function RegistrationForm({ initialIdCard, onSuccess, initialData, onCancel }: RegistrationFormProps) {
    const [loading, setLoading] = useState(false);

    // Address parts state
    const [address, setAddress] = useState<Address>({
        houseNo: '',
        moo: '',
        tambon: 'มะตูม',
        amphoe: 'พรหมพิราม',
        province: 'พิษณุโลก',
        zip: ''
    });

    const [formData, setFormData] = useState({
        id_card: initialIdCard || '',
        prefix: 'นาง',
        first_name: '',
        last_name: '',
        birthdate: '',
        phone: '',
        treatment_right: 'บัตรทอง',
        drug_allergy: '',
        underlying_disease: '',
        gender: 'female'
    });

    useEffect(() => {
        if (initialData) {
            // Load basic data
            setFormData({
                id_card: initialData.id_card,
                prefix: initialData.prefix,
                first_name: initialData.first_name,
                last_name: initialData.last_name,
                birthdate: initialData.birthdate,
                phone: initialData.phone,
                treatment_right: initialData.treatment_right,
                drug_allergy: initialData.drug_allergy || '',
                underlying_disease: initialData.underlying_disease || '',
                gender: initialData.gender || 'female'
            });

            // Load Address - Logic simplified to prefer object
            // Use type assertion or check if it matches Address interface if strictness required
            const addr = initialData.address;
            if (addr && typeof addr === 'object') {
                setAddress({
                    houseNo: addr.houseNo ?? addr.full_address ?? '', // Fallback to full_address if specific field missing
                    moo: addr.moo ?? '',
                    tambon: addr.tambon || 'มะตูม',
                    amphoe: addr.amphoe || 'พรหมพิราม',
                    province: addr.province || 'พิษณุโลก',
                    zip: addr.zip ?? ''
                });
            }
            // Removed legacy string parsing to encourage data standardization
            // If data is string, user will have to re-enter or we could add a one-time migration script later
        }
    }, [initialData]);

    // Calculate Age for display
    const age = formData.birthdate
        ? new Date().getFullYear() - new Date(formData.birthdate).getFullYear()
        : 0;

    const validateIdCard = (id: string) => {
        if (id.length !== 13) return false;
        if (!/^\d+$/.test(id)) return false;
        return true;
    };

    const validatePhone = (phone: string) => {
        // Allow empty if not required, but if entered, must be 10 digits
        if (!phone) return true;
        if (phone.length !== 10) return false;
        if (!/^\d+$/.test(phone)) return false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!validateIdCard(formData.id_card)) {
            alert('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
            return;
        }

        setLoading(true);

        try {
            let resultData;

            const payload = {
                ...formData,
                // Default to "ไม่มี" if empty
                underlying_disease: formData.underlying_disease?.trim() || 'ไม่มี',
                drug_allergy: formData.drug_allergy?.trim() || 'ไม่มี',
                // Simplify: Just save the object structure. 
                // Display logic should handle concatenation at view time.
                address: address as any // casting to any to satisfy potential JSONB type mismatch in supabase client definition if generic
            };

            if (initialData) {
                // UPDATE
                const { data, error } = await supabase
                    .from('patients')
                    .update(payload)
                    .eq('id', initialData.id)
                    .select()
                    .single();
                if (error) throw error;
                resultData = data;
            } else {
                // CREATE
                const { data, error } = await supabase
                    .from('patients')
                    .insert([payload])
                    .select()
                    .single();
                if (error) throw error;
                resultData = data;
            }

            if (resultData) {
                onSuccess(resultData as Patient);
            }
        } catch (error) {
            console.error('Registration/Update error:', error);
            alert('เกิดข้อผิดพลาด: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">
                {initialData ? 'แก้ไขข้อมูลผู้ป่วย' : 'ลงทะเบียนผู้ป่วยใหม่'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เลขบัตรประชาชน</label>
                    <Input
                        required
                        readOnly={!!initialData} // Read-only if editing
                        maxLength={13}
                        value={formData.id_card}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, id_card: val })
                        }}
                        className={initialData ? "bg-slate-100 text-slate-500" : "bg-white"}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">คำนำหน้า</label>
                    <select
                        aria-label="เลือกคำนำหน้า"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.prefix}
                        onChange={(e) => {
                            const p = e.target.value;
                            const g = (p === 'นาย' || p === 'เด็กชาย') ? 'male' : 'female';
                            setFormData({ ...formData, prefix: p, gender: g });
                        }}
                    >
                        <option value="เด็กชาย">เด็กชาย</option>
                        <option value="เด็กหญิง">เด็กหญิง</option>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                    <Input
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                    <Input
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันเกิด (อายุ {age > 0 ? age : '-'} ปี)</label>
                    <Input
                        type="date"
                        required
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                    <Input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, phone: val })
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สิทธิการรักษา</label>
                    <select
                        aria-label="เลือกสิทธิการรักษา"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={formData.treatment_right}
                        onChange={(e) => setFormData({ ...formData, treatment_right: e.target.value })}
                    >
                        <option value="บัตรทอง">บัตรทอง</option>
                        <option value="เบิกได้">เบิกได้ (ข้าราชการ/รัฐวิสาหกิจ)</option>
                        <option value="ประกันสังคม">ประกันสังคม</option>
                        <option value="ชำระเงินเอง">ชำระเงินเอง</option>
                    </select>
                </div>
            </div>

            {/* Structured Address Fields */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> ที่อยู่ตามทะเบียนบ้าน
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">บ้านเลขที่ / หมู่บ้าน / ถนน</label>
                        <Input
                            placeholder="เช่น 123/45 หมู่บ้าน..."
                            value={address.houseNo}
                            onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">หมู่ที่</label>
                        <Input
                            placeholder="-"
                            value={address.moo}
                            onChange={(e) => setAddress({ ...address, moo: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">ตำบล/แขวง</label>
                        <Input
                            placeholder="ระบุตำบล"
                            value={address.tambon}
                            onChange={(e) => setAddress({ ...address, tambon: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">อำเภอ/เขต</label>
                        <Input
                            placeholder="ระบุอำเภอ"
                            value={address.amphoe}
                            onChange={(e) => setAddress({ ...address, amphoe: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">จังหวัด</label>
                        <Input
                            placeholder="ระบุจังหวัด"
                            value={address.province}
                            onChange={(e) => setAddress({ ...address, province: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">โรคประจำตัว</label>
                    <Input
                        value={formData.underlying_disease}
                        onChange={(e) => setFormData({ ...formData, underlying_disease: e.target.value })}
                        placeholder="ถ้ามี โปรดระบุ"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-red-600 mb-1">ประวัติแพ้ยา</label>
                    <Input
                        value={formData.drug_allergy}
                        onChange={(e) => setFormData({ ...formData, drug_allergy: e.target.value })}
                        placeholder="ถ้ามี โปรดระบุ (สำคัญ)"
                        className="border-red-200 focus-visible:ring-red-200"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        ยกเลิก
                    </Button>
                )}
                <Button size="lg" type="submit" disabled={loading} className="w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'กำลงบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลและเริ่มการรักษา')}
                </Button>
            </div>
        </form>
    );
}
