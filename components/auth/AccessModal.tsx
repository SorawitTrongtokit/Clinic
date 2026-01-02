'use client';

import { useState, useEffect } from 'react';
import { Lock, KeyRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const STAFF_EMAIL = 'staff@clinic.com';

export default function AccessModal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };
        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) setIsAuthenticated(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: STAFF_EMAIL,
                password: inputValue
            });

            if (error) {
                console.error('Login failed:', error.message);
                setError(true);
                setInputValue('');
            } else if (data.session) {
                setIsAuthenticated(true);
            }
        } catch (err) {
            setError(true);
        }
    };

    if (isLoading) return null; // Prevent flash

    return (
        <AnimatePresence>
            {!isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20"
                    >
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">ยืนยันสิทธิ์การใช้งาน</h2>
                            <p className="text-slate-500 text-sm mt-2">
                                กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบบริหารจัดการคลินิก
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        setError(false);
                                    }}
                                    placeholder="รหัสผ่าน (Access Key)"
                                    className={`
                                        w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 font-medium transition-all outline-none
                                        ${error
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50 text-red-900 placeholder:text-red-300'
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-800'
                                        }
                                    `}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-sm font-medium text-center"
                                >
                                    รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                เข้าสู่ระบบ <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-400">
                                Protected by Easy Clinic Security
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
