'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Portal from '@/components/ui/Portal'; // Ensuring default import
import RegistrationForm from '@/components/patients/RegistrationForm';
import { Patient } from '@/types';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (patient: Patient) => void;
    initialIdCard?: string;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess, initialIdCard }: RegistrationModalProps) {
    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-colors"
                            aria-hidden="true"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                            >
                                <div className="sticky top-0 right-0 z-10 flex justify-end p-4 bg-white/80 backdrop-blur border-b border-slate-100">
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                        aria-label="ปิดหน้าต่าง"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="p-6 md:p-8 pt-2">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-slate-800">ลงทะเบียนผู้ป่วยใหม่</h2>
                                        <p className="text-slate-500">กรอกข้อมูลผู้ป่วยเพื่อสร้างระเบียนประวัติใหม่</p>
                                    </div>

                                    <RegistrationForm
                                        initialIdCard={initialIdCard}
                                        onSuccess={(patient) => {
                                            onSuccess(patient);
                                            onClose();
                                        }}
                                        onCancel={onClose}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </Portal>
    );
}
