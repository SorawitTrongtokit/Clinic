'use client';

import Link from 'next/link';
import { UserSearch, Pill, FileText, Activity, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <main className="container mx-auto py-12 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center relative"
        >
          <div className="inline-block p-2 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4 tracking-wide uppercase shadow-sm border border-blue-200">
            ระบบบริหารจัดการคลินิก
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            ยินดีต้อนรับสู่ <span className="text-blue-600">ไผ่ขอน้ำคลินิก</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg md:text-xl font-light max-w-2xl mx-auto">
            ระบบเวชระเบียนและการจัดการคลินิกทันสมัย เพื่อการดูแลผู้ป่วยที่มีประสิทธิภาพ
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* OPD Card */}
          <motion.div variants={item}>
            <Link href="/patients" className="group block h-full">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 flex flex-col items-center text-center cursor-pointer h-full relative overflow-hidden group-hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-20 h-20 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-inner relative z-10">
                  <UserSearch className="h-10 w-10 text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10 group-hover:text-blue-700 transition-colors">ค้นหา/ลงทะเบียน</h2>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10 group-hover:text-slate-600">
                  ค้นหาประวัติผู้ป่วยเดิม ตรวจสอบสิทธิ หรือลงทะเบียนผู้ป่วยใหม่เพื่อเริ่มการรักษา
                </p>

                <div className="mt-auto pt-6 w-full relative z-10">
                  <span className="inline-flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    เข้าสู่ระบบ <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stock Card */}
          <motion.div variants={item}>
            <Link href="/stock" className="group block h-full">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-2 hover:border-teal-300 transition-all duration-300 flex flex-col items-center text-center cursor-pointer h-full relative overflow-hidden group-hover:bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-20 h-20 bg-teal-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300 shadow-inner relative z-10">
                  <Pill className="h-10 w-10 text-teal-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10 group-hover:text-teal-700 transition-colors">คลังยา</h2>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10 group-hover:text-slate-600">
                  บริหารจัดการรายการยา เพิ่มยาใหม่ ปรับปรุงสต็อก และตรวจสอบวันหมดอายุ
                </p>

                <div className="mt-auto pt-6 w-full relative z-10">
                  <span className="inline-flex items-center text-sm font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    จัดการสต็อก <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Reports Card - Placeholder */}
          <motion.div variants={item}>
            <div className="group block h-full opacity-70 hover:opacity-100 transition-opacity">
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden cursor-not-allowed grayscale-[0.8] hover:grayscale-0">
                <div className="w-20 h-20 bg-orange-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10">
                  <Activity className="h-10 w-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">รายงานสรุป</h2>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10">
                  (เร็วๆนี้) ดูสรุปยอดรายรับ-รายจ่าย สถิติผู้ป่วย และรายงานประจำเดือน
                </p>
                <div className="mt-auto pt-6 w-full relative z-10">
                  <span className="inline-flex items-center text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                    Coming Phase 2
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats / Info Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">เวลาเปิดทำการ</p>
              <p className="text-slate-800 font-bold">08:00 - 20:00 น.</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ใบอนุญาตเลขที่</p>
              <p className="text-slate-800 font-bold">1234567890</p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><UserSearch className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ผู้ปฏิบัติงาน</p>
              <p className="text-slate-800 font-bold">พยาบาลวิชาชีพ</p>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
