"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Wallet, Search, Loader2, X, Eye,
  ChevronLeft, ChevronRight, Inbox,
  CheckCircle, Clock, Image as ImageIcon, Calendar, DollarSign,
} from "lucide-react";

// ─── Types (100% sesuai struktur API nyata) ───────────────────────────────────
type Payment = {
  id: number;
  bill_id: number;
  payment_date: string;
  verified: boolean;          // ← field asli dari API (bukan status string)
  total_amount: number;       // ← field asli dari API
  payment_proof: string;      // ← field asli dari API (bukan "file")
  createdAt?: string;
  updatedAt?: string;
  bill?: {
    month: number;
    year: number;
    amount: number;
    usage_value?: number;
    service?: { name: string; price: number };
  };
};

const MONTHS = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return dateStr; }
};

// Status badge berdasarkan verified (boolean) — sumber kebenaran tunggal
const getStatusBadge = (verified: boolean) => {
  if (verified) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <CheckCircle size={12} /> LUNAS
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <Clock size={12} className="animate-pulse" /> MENUNGGU VERIFIKASI
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments/me", { params: { page, quantity: 10, search } });
      const payload = res.data;
      const rows = payload?.data?.data ?? payload?.data ?? payload?.rows ?? [];
      const count = payload?.data?.total ?? payload?.count ?? (Array.isArray(rows) ? rows.length : 0);
      setPayments(Array.isArray(rows) ? rows : []);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10) || 1);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat riwayat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, search]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Wallet className="text-cyan-400 shrink-0" size={32} />
          Riwayat <span className="text-cyan-400">Pembayaran</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Pantau seluruh riwayat pembayaran dan status verifikasi Anda.</p>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Cari riwayat pembayaran..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="text-slate-500 text-xs tracking-wider border-b border-white/5">
                <th className="px-6 pb-4 pt-5 font-medium">ID Pembayaran</th>
                <th className="px-6 pb-4 pt-5 font-medium">Periode Tagihan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Tanggal Upload</th>
                <th className="px-6 pb-4 pt-5 font-medium">Total Bayar</th>
                <th className="px-6 pb-4 pt-5 font-medium">Status</th>
                <th className="px-4 pb-4 pt-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-cyan-500" size={36} />
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Memuat Data...</p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <Inbox size={40} className="text-slate-600" />
                      <p className="text-slate-500 font-bold">Belum ada riwayat pembayaran.</p>
                      <p className="text-slate-600 text-sm">Lakukan pembayaran pertama Anda dari menu Tagihan Saya.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">#{payment.id}</td>
                    <td className="px-6 py-4 text-slate-300 font-bold">
                      {payment.bill
                        ? `${MONTHS[payment.bill.month]} ${payment.bill.year}`
                        : `Tagihan #${payment.bill_id}`}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {formatDate(payment.payment_date || payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {fmt(payment.total_amount ?? payment.bill?.amount ?? 0)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.verified)}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setDetailPayment(payment)}
                        title="Lihat Detail & Bukti Transfer"
                        className="p-2.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">
          Halaman <span className="text-white">{page}</span> dari <span className="text-white">{totalPages}</span>
          <span className="text-slate-700 ml-2 normal-case tracking-normal">({totalCount} transaksi)</span>
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="px-3 py-2 text-sm font-bold text-slate-400 bg-slate-900/50 border border-white/5 rounded-xl">{page}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-sm font-black transition disabled:opacity-30 disabled:cursor-not-allowed">
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ══════════ MODAL DETAIL PEMBAYARAN ══════════ */}
      {detailPayment && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailPayment(null); }}
        >
          <div className="w-full max-w-xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white">Detail Pembayaran</h2>
                <p className="text-slate-500 text-sm mt-1">ID #{detailPayment.id}</p>
              </div>
              <button onClick={() => setDetailPayment(null)}
                className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Status Banner */}
              <div className="flex justify-center">
                {detailPayment.verified ? (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full">
                    <CheckCircle size={14} /> Pembayaran Terverifikasi / Lunas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-full">
                    <Clock size={14} className="animate-pulse" /> Menunggu Konfirmasi Admin
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="bg-slate-900/60 rounded-xl border border-white/5 p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold flex items-center gap-1.5">
                    <Calendar size={11} /> Periode
                  </p>
                  <p className="text-white font-bold">
                    {detailPayment.bill
                      ? `${MONTHS[detailPayment.bill.month]} ${detailPayment.bill.year}`
                      : `Tagihan #${detailPayment.bill_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold">Tanggal Upload</p>
                  <p className="text-white">{formatDate(detailPayment.payment_date || detailPayment.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold flex items-center gap-1.5">
                    <DollarSign size={11} /> Total Pembayaran
                  </p>
                  <p className="text-emerald-400 font-bold text-xl">
                    {fmt(detailPayment.total_amount ?? detailPayment.bill?.amount ?? 0)}
                  </p>
                </div>
              </div>

              {/* Bukti Transfer */}
              <div>
                <p className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Foto Bukti Transfer
                </p>
                {/* Wrapper tinggi fixed agar gambar tidak mendorong footer keluar */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-52 flex items-center justify-center">
                  {detailPayment.payment_proof ? (
                    <img
                      src={`${BASE_URL}/payment-proof/${detailPayment.payment_proof}`}
                      alt="Bukti Transfer"
                      className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500"
                      onClick={() => window.open(`${BASE_URL}/payment-proof/${detailPayment.payment_proof}`, "_blank")}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-slate-600 flex flex-col items-center gap-3 py-12"><p class="text-sm font-medium opacity-50">Gambar tidak dapat dimuat</p></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-3 py-12">
                      <ImageIcon size={40} className="opacity-20" />
                      <p className="text-sm font-medium">Tidak ada bukti transfer</p>
                    </div>
                  )}
                </div>
                {detailPayment.payment_proof && (
                  <p className="text-xs text-slate-500 mt-2 text-center">Klik gambar untuk membuka di tab baru.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex justify-end p-6 border-t border-slate-800 gap-3">
              <button onClick={() => setDetailPayment(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
