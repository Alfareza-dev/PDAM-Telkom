"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, Shield, CheckCircle, Info } from "lucide-react";

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Ambil username dari cookie tanpa hit API
    const storedUsername = Cookies.get("username") || "Admin";
    setUsername(storedUsername);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 py-10 px-4 md:px-0">
      {/* Centered Profile Card */}
      <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center text-center group">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -mt-48 transition-all duration-1000 group-hover:bg-cyan-500/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mb-32" />

        {/* Big Avatar Icon */}
        <div className="relative mb-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 ring-8 ring-white/5 group-hover:scale-105 transition-all duration-500">
             <User size={80} className="text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-950 p-3 rounded-2xl border border-white/10 shadow-2xl">
            <Shield size={24} className="text-cyan-400" />
          </div>
        </div>

        {/* Identity Section */}
        <div className="space-y-4 relative z-10">
          <h1 className="text-5xl font-black text-white tracking-tight italic">
            Admin <span className="text-cyan-400">PDAM</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] rounded-full">
               Administrator System
            </span>
          </div>
          
          <div className="pt-6">
            <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Welcome back, <span className="text-white font-bold">@{username}</span>. Anda memiliki akses penuh untuk mengelola seluruh data operasional sistem PDAM.
            </p>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="mt-12 flex items-center gap-2 px-6 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
           <CheckCircle size={16} className="text-emerald-400" />
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Session Secure & Active</span>
        </div>
      </div>

      {/* Simplified Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 flex items-start gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
               <Info size={20} className="text-cyan-500" />
            </div>
            <div>
               <h4 className="text-white font-bold text-sm">System Access</h4>
               <p className="text-slate-500 text-xs mt-1 leading-relaxed">Seluruh perubahan data akan tercatat secara otomatis pada audit trail sistem untuk keamanan.</p>
            </div>
         </div>
         <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 flex items-start gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
               <Shield size={20} className="text-indigo-500" />
            </div>
            <div>
               <h4 className="text-white font-bold text-sm">Data Privacy</h4>
               <p className="text-slate-500 text-xs mt-1 leading-relaxed">Integritas data pelanggan dijaga menggunakan enkripsi JWT pada lapisan transmisi API.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
