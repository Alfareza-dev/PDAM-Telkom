"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";
import { useState } from "react";

const menus = [
  {
    label: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tagihan Saya",
    href: "/customer/bills",
    icon: Receipt,
  },
  {
    label: "Riwayat Pembayaran",
    href: "/customer/payments",
    icon: Wallet,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    // hapus cookie auth
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.replace("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-slate-950/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center px-4">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <span className="ml-4 text-lg font-black text-white italic">PORTAL<span className="text-cyan-400">PELANGGAN</span></span>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 min-h-[100dvh] bg-slate-950 border-r border-white/5 flex flex-col fixed md:sticky top-0 z-50 transform transition-transform duration-300 py-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* BRAND */}
        <div className="px-8 mb-10 relative">
          {/* Tombol X HANYA tampil saat sidebar terbuka di mobile */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-0 right-2 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4cd7f6] to-[#06b6d4] flex items-center justify-center">
              <User size={20} className="text-[#003640]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">PDAM SMART</h1>
              <p className="font-manrope uppercase tracking-widest text-[10px] font-bold text-slate-500">PELANGGAN</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  active
                    ? "text-cyan-400 border-r-2 border-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon size={20} />
                <span className="font-manrope uppercase tracking-widest text-xs font-bold">{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT & EXTERNAL */}
        <div className="px-4 mt-auto border-t border-white/5 pt-4 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut size={20} />
            <span className="font-manrope uppercase tracking-widest text-xs font-bold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
