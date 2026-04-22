import { Search } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader({
  username,
  role,
  search,
  onSearchChange,
}: {
  username?: string;
  role?: string;
  search?: string;
  onSearchChange?: (val: string) => void;
}) {
  const displayRole = role === "ADMIN" ? "Administrator" : role ?? null;

  return (
    <header className="mb-10 w-full h-16 rounded-2xl bg-slate-900/60 backdrop-blur-xl flex justify-between items-center px-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-white/5">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
          />
          <input
            className="w-full bg-[#0a0e18] border border-transparent rounded-xl py-2 pl-10 pr-4 text-[#dfe2f1] placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm outline-none"
            placeholder="Cari data pelanggan, tagihan, atau layanan..."
            type="text"
            value={search || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-6 ml-4">
        <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 cursor-pointer group hover:bg-white/5 transition-colors rounded-xl">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              {username || "Admin"}
            </p>
            {displayRole && (
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {displayRole}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white/5 group-hover:border-cyan-400 bg-slate-900 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm transition-all">
            <img
              alt="Admin Avatar"
              className="w-full h-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(username || "Admin")}&background=0f131d&color=4cd7f6`}
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
