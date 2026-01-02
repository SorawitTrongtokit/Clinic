import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Easy Clinic - ไผ่ขอน้ำคลินิก",
  description: "ระบบบริหารจัดการคลินิก Easy Clinic",
};

import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} ${sarabun.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        <Sidebar />
        <div className="pl-64 min-h-screen print:pl-0">
          {children}
        </div>
      </body>
    </html>
  );
}
