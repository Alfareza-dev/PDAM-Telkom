"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Search, Wallet, Loader2, Trash2, Eye, CheckCircle, X,
  Image as ImageIcon, ChevronLeft, ChevronRight, Inbox,
  Calendar, User, DollarSign, Clock, AlertCircle,
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

// ─── Types (100% sesuai struktur API nyata) ───────────────────────────────────
type Payment = {
  id: number;
  bill_id: number;
  payment_date: string;
  verified: boolean;          // ← field asli API (bukan "status")
  total_amount: number;       // ← field asli API
  payment_proof: string;      // ← field asli API (bukan "file")
  createdAt?: string;
  bill?: {
    id: number;
    month: number;
    year: number;
    usage_value: number;
    price: number;
    amount: number;
    paid: boolean;
    customer?: {
      name: string;
      customer_number: string;
    };
    service?: {
      name: string;
      price: number;
    };
  };
};

const MONTHS = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return dateStr; }
};

// Status badge berdasarkan field verified (boolean)
const getStatusBadge = (verified: boolean) => {
  if (verified) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <CheckCircle size={11} /> LUNAS
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <Clock size={11} /> MENUNGGU VERIFIKASI
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"none" | "detail">("none");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [deletePayment, setDeletePayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?page=${page}&quantity=10&search=${search}`);
      const payload = res.data;
      const rows = payload?.data?.data ?? payload?.data ?? payload?.rows ?? [];
      const count = payload?.data?.total ?? payload?.count ?? (Array.isArray(rows) ? rows.length : 0);
      setPayments(Array.isArray(rows) ? rows : []);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10) || 1);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, search]);

  const openDetail = (payment: Payment) => { setSelected(payment); setModal("detail"); };
  const closeModal = () => { setModal("none"); setSelected(null); };

  const handleVerify = async (paymentId: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/payments/${paymentId}`);
      toast.success("Pembayaran berhasil dikonfirmasi!");
      // Update local state — ubah verified menjadi true
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, verified: true } : p));
      if (selected && selected.id === paymentId) {
        setSelected(prev => prev ? { ...prev, verified: true } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengkonfirmasi pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePayment || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/payments/${deletePayment.id}`);
      toast.success("Pembayaran berhasil dihapus.");
      fetchPayments();
      setDeletePayment(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="text-cyan-400 shrink-0" size={32} />
            Manajemen <span className="text-cyan-400">Pembayaran</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Konfirmasi bukti transfer dan kelola pembayaran pelanggan.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Cari data pembayaran..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-slate-500 text-xs tracking-wider border-b border-white/5">
                <th className="px-6 pb-4 pt-5 font-medium">ID</th>
                <th className="px-6 pb-4 pt-5 font-medium">Pelanggan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Periode Tagihan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Total Bayar</th>
                <th className="px-6 pb-4 pt-5 font-medium">Status</th>
                <th className="px-4 pb-4 pt-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-cyan-500" size={36} />
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Memuat Data...</p>
                  </div>
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-50">
                    <Inbox size={40} className="text-slate-600" />
                    <p className="text-slate-500 font-bold">Tidak ada data pembayaran ditemukan.</p>
                  </div>
                </td></tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-cyan-400 font-bold">#{payment.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{payment.bill?.customer?.name || "N/A"}</span>
                        <span className="text-xs text-slate-500 font-mono">{payment.bill?.customer?.customer_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-bold">
                      {payment.bill ? `${MONTHS[payment.bill.month]} ${payment.bill.year}` : `BILL-${payment.bill_id}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {fmt(payment.total_amount ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.verified)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!payment.verified && (
                          <button
                            onClick={() => handleVerify(payment.id)}
                            title="Konfirmasi Pembayaran"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/40"
                          >
                            <CheckCircle size={14} /> Konfirmasi
                          </button>
                        )}
                        <button onClick={() => openDetail(payment)} title="Lihat Detail" className="p-2.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/20">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => setDeletePayment(payment)} title="Hapus" className="p-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
          <span className="text-slate-700 ml-2 normal-case tracking-normal">({totalCount} data)</span>
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 btn-secondary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed text-sm">
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="px-3 py-2 text-sm font-bold text-slate-400 bg-slate-900/50 border border-white/5 rounded-xl">{page}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1.5 btn-primary px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed text-sm">
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ══════════ MODAL DETAIL ══════════ */}
      {modal === "detail" && selected && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-5 md:p-6 border-b border-slate-800">
              <div>
                <h2 className="text-3xl font-black text-white">Detail Pembayaran</h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">#{selected.id} — Konfirmasi keabsahan bukti transfer.</p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
              {/* Status Banner */}
              <div className="flex justify-center">
                {selected.verified ? (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full">
                    <CheckCircle size={14} /> Pembayaran Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-full">
                    <Clock size={14} /> Menunggu Konfirmasi Admin
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: "Pelanggan", val: selected.bill?.customer?.name || "N/A" },
                  { icon: User, label: "No. Pelanggan", val: selected.bill?.customer?.customer_number || "N/A" },
                  { icon: Calendar, label: "Periode Tagihan", val: selected.bill ? `${MONTHS[selected.bill.month]} ${selected.bill.year}` : `BILL-${selected.bill_id}` },
                  { icon: Calendar, label: "Tanggal Bayar", val: formatDate(selected.payment_date) },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-slate-900/60 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={11} className="text-slate-500" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                    </div>
                    <p className="text-slate-100 font-bold text-sm">{val}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Total Pembayaran</p>
                <p className="text-3xl font-black text-cyan-400">
                  {fmt(selected.total_amount ?? (selected.bill?.amount ?? 0))}
                </p>
              </div>

              {/* Bukti Transfer */}
              <div>
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Bukti Transfer
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-52 flex items-center justify-center">
                  {selected.payment_proof ? (
                    <img
                      src={`${BASE_URL}/payment-proof/${selected.payment_proof}`}
                      alt="Bukti Transfer"
                      className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500"
                      onClick={() => window.open(`${BASE_URL}/payment-proof/${selected.payment_proof}`, "_blank")}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-slate-600 flex flex-col items-center gap-3 py-12"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="opacity-20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="text-sm font-medium">Gambar gagal dimuat</p></div>`;
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
                {selected.payment_proof && (
                  <p className="text-xs text-slate-500 mt-2 text-center">Klik gambar untuk membuka di tab baru.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex justify-end p-5 md:p-6 border-t border-slate-800 gap-3">
              <button type="button" onClick={closeModal} className="btn-secondary px-6">Tutup</button>
              {!selected.verified && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleVerify(selected.id)}
                  className="btn-primary px-6 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL DELETE ══════════ */}
      <DeleteConfirmModal
        isOpen={!!deletePayment}
        onClose={() => setDeletePayment(null)}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
        description={
          <>
            Apakah Anda yakin ingin menghapus data Pembayaran <span className="text-white font-bold">#{deletePayment?.id}</span> dari{" "}
            <span className="text-white font-bold">{deletePayment?.bill?.customer?.name || `BILL-${deletePayment?.bill_id}`}</span>? Tindakan ini tidak dapat dibatalkan.
          </>
        }
      />
    </div>
  );
}
