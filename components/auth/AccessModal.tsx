'use client';

import { useState, useEffect } from 'react';
import { Lock, Delete, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const STAFF_EMAIL = 'staff@clinic.com';

export default function AccessModal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) setIsAuthenticated(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (currentPin: string) => {
        setIsVerifying(true);
        setError(false);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: STAFF_EMAIL,
                password: currentPin
            });

            if (error) {
                // Add a small delay for smoother UX on error
                setTimeout(() => {
                    setError(true);
                    setPin('');
                    setIsVerifying(false);
                }, 400);
            } else if (data.session) {
                setIsSuccess(true);
                setTimeout(() => setIsAuthenticated(true), 800);
            }
        } catch (err) {
            setError(true);
            setPin('');
            setIsVerifying(false);
        }
    };

    const handleNumberClick = (num: string) => {
        if (pin.length < 6 && !isVerifying && !isSuccess) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);
            if (newPin.length === 6) {
                handleLogin(newPin);
            }
        }
    };

    const handleDelete = () => {
        if (!isVerifying && !isSuccess) {
            setPin(prev => prev.slice(0, -1));
            setError(false);
        }
    };

    if (isLoading) return null;

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1], // Custom heavy ease
                staggerChildren: 0.05
            }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const shakeVariants: Variants = {
        idle: { x: 0 },
        error: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.4 }
        }
    };

    return (
        <AnimatePresence>
            {!isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[9999] bg-slate-900/40 flex items-center justify-center p-4"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden ring-1 ring-white/50"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="flex flex-col items-center mb-8 relative z-10">
                            <motion.div
                                variants={itemVariants}
                                className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm transition-colors duration-500
                                    ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'}
                                `}
                            >
                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                        >
                                            <CheckCircle2 className="h-8 w-8" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="lock"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <Lock className="h-7 w-7" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-slate-800">
                                {isSuccess ? 'ยินดีต้อนรับ' : 'เข้าสู่ระบบ'}
                            </motion.h2>
                            <motion.p variants={itemVariants} className="text-slate-500 text-sm mt-1">
                                {isSuccess ? 'กำลังเข้าสู่ระบบ...' : 'กรุณาระบุรหัส PIN 6 หลัก'}
                            </motion.p>
                        </div>

                        {/* PIN Display */}
                        <motion.div
                            variants={itemVariants}
                            className="flex justify-center gap-4 mb-10 h-6"
                        >
                            <motion.div
                                variants={shakeVariants}
                                animate={error ? "error" : "idle"}
                                className="flex gap-4"
                            >
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={{
                                            scale: i < pin.length ? [1, 1.2, 1] : 1,
                                            backgroundColor: i < pin.length
                                                ? (error ? '#EF4444' : (isSuccess ? '#22C55E' : '#3B82F6'))
                                                : 'rgba(203, 213, 225, 0.3)', // slate-300 with opacity
                                            borderColor: i < pin.length
                                                ? 'transparent'
                                                : (error ? '#FCA5A5' : '#E2E8F0')
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="w-3.5 h-3.5 rounded-full border-2 border-slate-200"
                                    />
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Error Handling */}
                        <motion.div className="h-6 mb-4 flex justify-center text-center">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.p
                                        key="error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="text-red-500 text-sm font-bold flex items-center gap-1.5"
                                    >
                                        <AlertCircle className="h-4 w-4" /> รหัสผ่านไม่ถูกต้อง
                                    </motion.p>
                                )}
                                {isVerifying && !isSuccess && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 text-blue-600 text-sm font-medium"
                                    >
                                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังตรวจสอบ...
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Keypad */}
                        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 px-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <NumberButton
                                    key={num}
                                    num={num}
                                    onClick={() => handleNumberClick(num.toString())}
                                    disabled={isVerifying || isSuccess}
                                />
                            ))}
                            <div />
                            <NumberButton
                                num={0}
                                onClick={() => handleNumberClick('0')}
                                disabled={isVerifying || isSuccess}
                            />
                            <button
                                aria-label="ลบ"
                                onClick={handleDelete}
                                disabled={isVerifying || isSuccess}
                                className="h-16 w-full rounded-3xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 active:scale-90 transition-all disabled:opacity-30"
                            >
                                <Delete className="h-6 w-6" />
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-8 text-center">
                            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase opacity-60">
                                Secured by Easy Clinic
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function NumberButton({ num, onClick, disabled }: { num: number, onClick: () => void, disabled: boolean }) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            onClick={onClick}
            disabled={disabled}
            className="h-16 w-full rounded-3xl bg-white/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-white/60 
                     text-2xl font-bold text-slate-700 backdrop-blur-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:shadow-md hover:border-blue-100 transition-shadow"
        >
            {num}
        </motion.button>
    );
}
