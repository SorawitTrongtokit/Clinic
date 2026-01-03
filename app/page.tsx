'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { UserSearch, Pill, Activity, Users, CreditCard, TrendingUp, Calendar, ArrowRight, Clock, ShieldCheck, FileText, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { VisitWithPatient, Medicine } from '@/types';
import { useToast } from '@/components/ui/Toast';
import IncomeChart from '@/components/dashboard/IncomeChart';
import LowStockAlert from '@/components/dashboard/LowStockAlert';

interface DailyIncome {
  date: string;
  dayName: string;
  income: number;
}

export default function Home() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsToday: 0,
    incomeToday: 0,
    monthlyIncome: 0
  });
  const [recentVisits, setRecentVisits] = useState<VisitWithPatient[]>([]);
  const [weeklyIncome, setWeeklyIncome] = useState<DailyIncome[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchWeeklyIncome();
    fetchLowStockMedicines();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);

      // 1. Total Patients
      const { count: patientCount, error: patientError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (patientError) throw patientError;

      // 2. Visits Today & Income
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('total_cost, created_at')
        .gte('created_at', today.toISOString());

      if (visitsError) throw visitsError;

      const todayCount = visits?.length || 0;
      const todayIncome = visits?.reduce((sum, v) => sum + (v.total_cost || 0), 0) || 0;

      // 3. Monthly Income
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: monthlyVisits, error: monthlyError } = await supabase
        .from('visits')
        .select('total_cost')
        .gte('created_at', firstDayOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      const monIncome = monthlyVisits?.reduce((sum, v) => sum + (v.total_cost || 0), 0) || 0;

      // 4. Recent Visits
      const { data: recents, error: recentsError } = await supabase
        .from('visits')
        .select('*, patients(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentsError) throw recentsError;

      setStats({
        totalPatients: patientCount || 0,
        visitsToday: todayCount,
        incomeToday: todayIncome,
        monthlyIncome: monIncome
      });
      if (recents) setRecentVisits(recents as VisitWithPatient[]);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setError(message);
      showToast(message, 'error');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyIncome = async () => {
    try {
      const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

      // Single RPC call instead of 7 separate queries
      const { data, error } = await supabase.rpc('get_weekly_income');

      if (error) {
        console.error('RPC error, falling back to client-side calculation:', error);
        // Fallback: single query with client-side grouping
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: fallbackData } = await supabase
          .from('visits')
          .select('total_cost, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

        // Group by date on client side
        const incomeByDate: Record<string, number> = {};
        fallbackData?.forEach(v => {
          const dateKey = new Date(v.created_at).toDateString();
          incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + (v.total_cost || 0);
        });

        const days: DailyIncome[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          days.push({
            date: date.toLocaleDateString('th-TH'),
            dayName: dayNames[date.getDay()],
            income: incomeByDate[date.toDateString()] || 0
          });
        }
        setWeeklyIncome(days);
        return;
      }

      // Map RPC result to DailyIncome format
      const incomeMap: Record<string, number> = {};
      data?.forEach((row: { visit_date: string; daily_income: number }) => {
        incomeMap[row.visit_date] = Number(row.daily_income) || 0;
      });

      const days: DailyIncome[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        days.push({
          date: date.toLocaleDateString('th-TH'),
          dayName: dayNames[date.getDay()],
          income: incomeMap[dateKey] || 0
        });
      }

      setWeeklyIncome(days);
    } catch (err) {
      console.error('Error fetching weekly income:', err);
    }
  };

  const fetchLowStockMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .lt('stock_qty', 10)
        .order('stock_qty', { ascending: true });

      if (error) throw error;
      if (data) setLowStockMedicines(data as Medicine[]);
    } catch (err) {
      console.error('Error fetching low stock medicines:', err);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans p-6">
      <main className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">แดชบอร์ดภาพรวม</h1>
            <p className="text-slate-500">ยินดีต้อนรับกลับ, ไผ่ขอน้ำคลินิก</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {/* Card 1: Visits Today */}
          <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">ผู้ป่วยวันนี้</p>
              <h3 className="text-3xl font-bold text-slate-800">{loading ? '-' : stats.visitsToday}</h3>
              <p className="text-xs text-green-600 font-medium flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" /> รายวัน
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </motion.div>

          {/* Card 2: Income Today */}
          <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">รายรับวันนี้</p>
              <h3 className="text-3xl font-bold text-slate-800">{loading ? '-' : `฿${stats.incomeToday.toLocaleString()}`}</h3>
              <p className="text-xs text-green-600 font-medium flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" /> ยอดขาย
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </motion.div>

          {/* Card 3: Monthly Income */}
          <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">รายรับเดือนนี้</p>
              <h3 className="text-3xl font-bold text-slate-800">{loading ? '-' : `฿${stats.monthlyIncome.toLocaleString()}`}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                สะสมทั้งเดือน
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Activity className="h-6 w-6" />
            </div>
          </motion.div>

          {/* Card 4: Total Patients */}
          <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">ทะเบียนผู้ป่วยรวม</p>
              <h3 className="text-3xl font-bold text-slate-800">{loading ? '-' : stats.totalPatients.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                คน
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <UserSearch className="h-6 w-6" />
            </div>
          </motion.div>
        </motion.div>

        {/* Low Stock Alert */}
        <LowStockAlert medicines={lowStockMedicines} loading={loading} />

        {/* Weekly Income Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">รายได้ 7 วันย้อนหลัง</h3>
                <p className="text-xs text-slate-400">สรุปยอดรายได้แยกตามวัน</p>
              </div>
            </div>
          </div>
          <IncomeChart data={weeklyIncome} loading={loading} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Visits Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">ผู้ป่วยล่าสุด</h3>
              <Link href="/records" className="text-sm text-blue-600 font-medium hover:underline flex items-center">
                ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">เวลา</th>
                    <th className="px-4 py-3">ชื่อ-สกุล</th>
                    <th className="px-4 py-3">อาการ (CC)</th>
                    <th className="px-4 py-3">วินิจฉัย</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">ค่ารักษา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">กำลังโหลด...</td></tr>
                  ) : recentVisits.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">ไม่มีข้อมูลการตรวจล่าสุด</td></tr>
                  ) : recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-500">
                        {visit.created_at ? new Date(visit.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {visit.patients?.first_name} {visit.patients?.last_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{visit.cc || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{visit.icd10_code ? <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{visit.icd10_code}</span> : '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">฿{visit.total_cost?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
              <h3 className="text-lg font-bold mb-2">ลงทะเบียนใหม่</h3>
              <p className="text-blue-100 text-sm mb-6">เริ่มต้นการตรวจรักษา ค้นหาผู้ป่วย หรือลงทะเบียนใหม่</p>
              <Link href="/patients">
                <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl shadow hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <UserSearch className="h-5 w-5" /> ไปที่จุดต้อนรับ
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">เมนูลัด</h3>
              <div className="space-y-3">
                <Link href="/stock" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">คลังยา</p>
                    <p className="text-xs text-slate-400">จัดการสต็อกยา</p>
                  </div>
                </Link>
                <Link href="/records" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">ค้นหาประวัติ</p>
                    <p className="text-xs text-slate-400">ดูประวัติย้อนหลัง</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
