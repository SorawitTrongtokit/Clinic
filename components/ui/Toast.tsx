'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-white/95 border-l-emerald-500 ring-1 ring-black/5';
            case 'error':
                return 'bg-white/95 border-l-rose-500 ring-1 ring-black/5';
            default:
                return 'bg-white/95 border-l-blue-500 ring-1 ring-black/5';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 print:hidden">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            layout
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-xl backdrop-blur-md min-w-[300px] max-w-[420px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform ${getStyles(toast.type)}`}
                            onClick={() => dismissToast(toast.id)}
                        >
                            <div className="shrink-0">
                                {getIcon(toast.type)}
                            </div>
                            <p className="flex-1 text-sm font-semibold tracking-wide">{toast.message}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dismissToast(toast.id);
                                }}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors shrink-0"
                                aria-label="ปิด"
                            >
                                <X className="h-4 w-4 opacity-60" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
