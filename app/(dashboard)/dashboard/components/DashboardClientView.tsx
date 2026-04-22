"use client";

import { useState } from "react";
import StatCard from "./StatCard";
import DashboardHeader from "./DashboardHeader";
import { Users, LayoutDashboard, FileText, CreditCard, Phone, MapPin } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  customer_number: string;
  service_id: number;
  service?: { name: string };
};

interface DashboardClientViewProps {
  stats: {
    total_customers: number;
    total_services: number;
    total_bills: number;
    total_payments: number;
    username: string;
    role: string;
    recentCustomers: Customer[];
  };
}

const avatarColors = [
  "bg-cyan-400/10 text-cyan-400",
  "bg-indigo-400/10 text-indigo-400",
  "bg-amber-400/10 text-amber-400",
  "bg-emerald-400/10 text-emerald-400",
  "bg-rose-400/10 text-rose-400",
];

export default function DashboardClientView({ stats }: DashboardClientViewProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = stats.recentCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      <DashboardHeader
        username={stats.username}
        role={stats.role}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pelanggan" value={stats.total_customers} icon={Users} color="cyan" />
        <StatCard title="Total Layanan" value={stats.total_services} icon={LayoutDashboard} color="indigo" />
        <StatCard title="Total Tagihan" value={stats.total_bills} icon={FileText} color="emerald" />
        <StatCard title="Total Pembayaran" value={stats.total_payments} icon={CreditCard} color="amber" />
      </div>

      {/* Recent Customer Records */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <h3 className="text-white font-bold text-lg">Data Pelanggan Terkini</h3>
          <Link href="/dashboard/customers" className="text-cyan-400 text-sm hover:underline">
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs tracking-wider border-b border-white/5">
                <th className="px-6 pb-4 pt-4 font-medium">Nama Pelanggan</th>
                <th className="px-6 pb-4 pt-4 font-medium">No. Pelanggan</th>
                <th className="px-6 pb-4 pt-4 font-medium hidden md:table-cell">Telepon</th>
                <th className="px-6 pb-4 pt-4 font-medium hidden lg:table-cell">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Tidak ada data pelanggan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, i) => {
                  const initials = customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={customer.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                            {initials}
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors font-medium">
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{customer.customer_number}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <Phone size={12} className="text-slate-600" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <MapPin size={11} className="text-slate-600" />
                          <span className="truncate max-w-[180px]">{customer.address}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-white/5">
          <span className="text-xs text-slate-600">
            Menampilkan {filteredCustomers.length} dari {stats.total_customers} data pelanggan
          </span>
        </div>
      </div>
    </div>
  );
}
