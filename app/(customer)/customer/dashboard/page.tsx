"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, MapPin, Phone, Hash, Home } from "lucide-react";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get("/customers/me");
        setCustomer(res.data.data);
      } catch (err: any) {
        toast.error("Gagal memuat profil pelanggan.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="font-bold text-xl mb-2">Profil Tidak Ditemukan</p>
          <p>Silakan hubungi administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-8 md:p-12">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-2">Portal Pelanggan</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Selamat Datang, <span className="text-cyan-300">{customer.name}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Kelola tagihan, lacak riwayat pembayaran, dan pantau layanan Anda dengan lebih mudah dan cepat.
          </p>
        </div>
      </div>

      {/* Profil Card */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Home className="text-cyan-400" size={24} />
          Informasi <span className="text-cyan-400">Layanan</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-slate-900/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Hash className="text-cyan-400" size={24} />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Nomor Pelanggan</p>
            <p className="text-xl font-mono text-white font-bold">{customer.customer_number}</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-slate-900/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Phone className="text-indigo-400" size={24} />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Telepon</p>
            <p className="text-xl text-white font-bold">{customer.phone || "-"}</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-slate-900/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <MapPin className="text-emerald-400" size={24} />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Alamat</p>
            <p className="text-md text-white font-medium">{customer.address || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
