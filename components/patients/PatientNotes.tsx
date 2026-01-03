'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/Textarea';
import { StickyNote, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PatientNotesProps {
    patientId: string;
    initialNotes: string;
}

export default function PatientNotes({ patientId, initialNotes }: PatientNotesProps) {
    const { showToast } = useToast();
    const [notes, setNotes] = useState(initialNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Debounce save
    useEffect(() => {
        if (notes === initialNotes) {
            setIsSaved(true);
            return;
        }

        setIsSaved(false);
        const timer = setTimeout(() => {
            saveNotes();
        }, 1000); // Save after 1 second of no typing

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes]);

    const saveNotes = useCallback(async () => {
        if (notes === initialNotes) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('patients')
                .update({ notes })
                .eq('id', patientId);

            if (error) throw error;

            setIsSaved(true);
            setLastSaved(new Date());
        } catch (err) {
            console.error('Error saving notes:', err);
            showToast('ไม่สามารถบันทึก notes ได้', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [notes, patientId, initialNotes, showToast]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                    <StickyNote className="h-5 w-5 text-amber-500" />
                    <span className="font-bold">บันทึกช่วยจำ (Notes)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {isSaving && (
                        <span className="text-blue-600 flex items-center gap-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            กำลังบันทึก...
                        </span>
                    )}
                    {!isSaving && isSaved && notes && (
                        <span className="text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            บันทึกแล้ว
                            {lastSaved && (
                                <span className="text-slate-400 text-xs">
                                    ({lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})
                                </span>
                            )}
                        </span>
                    )}
                    {!isSaving && !isSaved && (
                        <span className="text-amber-500 text-xs">ยังไม่ได้บันทึก</span>
                    )}
                </div>
            </div>

            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="พิมพ์บันทึกช่วยจำสำหรับผู้ป่วยรายนี้... (บันทึกอัตโนมัติ)"
                rows={4}
                className="bg-amber-50/50 border-amber-200 focus:border-amber-400 focus:ring-amber-100 resize-none"
            />

            <p className="text-xs text-slate-400">
                💡 ใช้สำหรับบันทึกข้อมูลสำคัญ เช่น การนัดหมาย, ข้อสังเกต หรือ memo อื่นๆ
            </p>
        </div>
    );
}
