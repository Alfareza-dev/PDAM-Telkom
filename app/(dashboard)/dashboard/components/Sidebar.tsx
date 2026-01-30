"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Wallet,
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
    label: "Bills",
    href: "/dashboard/bills",
    icon: Wallet,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: Wallet,
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
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-white/10 flex flex-col">
      {/* BRAND */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold text-cyan-400">PDAM SMART</h1>
        <p className="text-xs text-slate-400">Management System</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon size={18} />
              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
