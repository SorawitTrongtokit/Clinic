'use client';

import { AlertTriangle, Pill } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Medicine } from '@/types';

interface LowStockAlertProps {
    medicines: Medicine[];
    loading?: boolean;
}

export default function LowStockAlert({ medicines, loading }: LowStockAlertProps) {
    if (loading) return null;

    const lowStockMedicines = medicines.filter(m => m.stock_qty < 10);

    if (lowStockMedicines.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-amber-800 mb-2">
                        ⚠️ ยาใกล้หมด ({lowStockMedicines.length} รายการ)
                    </h3>
                    <ul className="space-y-1">
                        {lowStockMedicines.slice(0, 5).map(med => (
                            <li key={med.id} className="flex items-center gap-2 text-sm text-amber-700">
                                <Pill className="h-4 w-4" />
                                <span className="font-medium">{med.name}</span>
                                <span className="text-amber-600">— คงเหลือ {med.stock_qty} {med.unit}</span>
                            </li>
                        ))}
                        {lowStockMedicines.length > 5 && (
                            <li className="text-sm text-amber-600 italic">
                                และอีก {lowStockMedicines.length - 5} รายการ...
                            </li>
                        )}
                    </ul>
                    <Link
                        href="/stock"
                        className="inline-block mt-3 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                    >
                        จัดการคลังยา →
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
