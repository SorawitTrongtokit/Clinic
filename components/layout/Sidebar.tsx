'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Stethoscope, Users, Pill, FileText, ClipboardList, Home, Menu, X } from 'lucide-react';

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
        { href: '/patients', label: 'ต้อนรับ / คัดกรอง', icon: Users },
        { href: '/records', label: 'ทะเบียนผู้ป่วย', icon: FileText },
        { href: '/stock', label: 'คลังยา', icon: Pill },
    ];

    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-xl shadow-lg border border-slate-200 print:hidden"
                aria-label="เปิดเมนู"
            >
                <Menu className="h-6 w-6 text-slate-700" />
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden print:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 z-50 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 
                transition-transform duration-300 print:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="h-full px-4 py-6 overflow-y-auto flex flex-col">
                    {/* Close Button (Mobile) */}
                    <button
                        onClick={closeSidebar}
                        className="absolute top-4 right-4 p-1 md:hidden hover:bg-slate-100 rounded-lg"
                        aria-label="ปิดเมนู"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="relative h-12 w-12 shrink-0">
                            <Image
                                src="/logo.png"
                                alt="Clinic Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent leading-none">
                                ไผ่ขอน้ำ
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">คลินิกเวชกรรม</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <ul className="space-y-2 flex-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                                            ${active
                                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Footer / User Profile Stub */}
                    <div className="mt-auto pt-6 border-t border-slate-100 px-2">
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <span className="font-bold">A</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-700 truncate">พยาบาลวิชาชีพชำนาญการ</p>
                                <p className="text-xs text-slate-400 truncate">น.ส.ภัทรภร พวงอุบล</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

