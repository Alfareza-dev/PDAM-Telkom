"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6">
        <h1 className="font-bold text-xl text-cyan-400">PDAM Admin</h1>

        <nav className="mt-8 space-y-3">
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/customers">Customers</a>
          <a href="/dashboard/services">Services</a>
          <a href="/dashboard/bills">Bills</a>
          <a href="/dashboard/payments">Payments</a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
