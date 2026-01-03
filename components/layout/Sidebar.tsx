'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Stethoscope, Users, Pill, FileText, ClipboardList, Home, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { href: '/', label: 'หน้าแรก', icon: Home },
        { href: '/patients', label: 'ตรวจคัดกรอง', icon: Users },
        { href: '/records', label: 'ทะเบียนผู้ป่วย', icon: FileText },
        { href: '/stock', label: 'คลังยา', icon: Pill },
        { href: '/accounting', label: 'บัญชี / การเงิน', icon: ClipboardList },
    ];

    const closeSidebar = () => setIsOpen(false);

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        desktop: { x: 0 }
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-xl shadow-lg border border-slate-200 print:hidden"
                aria-label="เปิดเมนู"
            >
                <Menu className="h-6 w-6 text-slate-700" />
            </motion.button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden print:hidden"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                variants={{
                    open: { x: 0 },
                    closed: { x: '-100%' }
                }}
                className={`
                    fixed left-0 top-0 z-50 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 
                    md:translate-x-0 md:!transform-none
                    print:hidden
                `}
                style={{
                    // Reset transform on desktop to avoid conflict with standard layout
                    // Note: We use Tailwind's md:translate-x-0 but Framer Motion handles the mobile state
                }}
            >
                {/* On desktop, we want it always visible, so we override the animation style via class or ensure variants handle 'desktop' if we used a media query hook. 
                    However, simpler approach for hybrid: Use a drag/animation only on mobile or just rely on the class for desktop visibility.
                    Here we rely on the `md:translate-x-0` class from Tailwind to force visibility on desktop, 
                    BUT Framer Motion inline styles might override it.
                    Safe fix: Use a specific motion variant logic or just conditionally apply motion props.
                */}
                <motion.div
                    className="h-full flex flex-col"
                    animate={isOpen ? "open" : "closed"}
                    variants={{
                        open: { x: 0 },
                        closed: { x: 0 } // On mobile the parent moves. On desktop this inner content doesn't need to move.
                    }}
                >
                    <div className="h-full px-4 py-6 overflow-y-auto flex flex-col">
                        {/* Close Button (Mobile) */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={closeSidebar}
                            className="absolute top-4 right-4 p-1 md:hidden hover:bg-slate-100 rounded-lg"
                            aria-label="ปิดเมนู"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </motion.button>

                        {/* Logo Area */}
                        <div className="flex items-center gap-3 mb-10 px-2 pt-2">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative h-12 w-12 shrink-0"
                            >
                                <Image
                                    src="/logo.png"
                                    alt="Clinic Logo"
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent leading-none">
                                    ไผ่ขอน้ำ
                                </h1>
                                <p className="text-xs text-slate-400 font-medium">คลินิกเวชกรรม</p>
                            </motion.div>
                        </div>

                        {/* Navigation Links */}
                        <ul className="space-y-2 flex-1">
                            {navItems.map((item, index) => {
                                const active = isActive(item.href);
                                return (
                                    <motion.li
                                        key={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + (index * 0.05) }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={clsx(
                                                'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden',
                                                active ? 'text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                            )}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                                                    initial={false}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}

                                            <div className="relative z-10 flex items-center gap-3">
                                                <item.icon className={clsx("h-5 w-5 transition-colors", active ? "text-white" : "group-hover:text-blue-600")} />
                                                <span className="font-medium">{item.label}</span>
                                            </div>

                                            {/* Active Indicator Dot */}
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-sm z-10"
                                                />
                                            )}
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>
                        {/* Footer / User Profile Stub */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-auto pt-6 border-t border-slate-100 px-2"
                        >
                            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                    <span className="font-bold">A</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors">พยาบาลวิชาชีพชำนาญการ</p>
                                    <p className="text-xs text-slate-400 truncate">น.ส.ภัทรภร พวงอุบล</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.aside>
        </>
    );
}

