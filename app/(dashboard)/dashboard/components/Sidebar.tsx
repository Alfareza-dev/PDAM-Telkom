"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  User,
  LogOut,
} from "lucide-react";

const menus = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Admins",
    href: "/dashboard/admins",
    icon: UserCog,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: FileText,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // hapus cookie auth
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "owner_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.replace("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-white/5 flex flex-col sticky top-0">
      {/* BRAND */}
      <div className="px-8 py-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
             <LayoutDashboard size={24} className="text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter italic">PDAM<span className="text-cyan-400">SMART</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-2 space-y-2">
        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group
                ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{menu.label}</span>
              {active && (
                <div className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Logout System
        </button>
      </div>
    </aside>
  );
}
