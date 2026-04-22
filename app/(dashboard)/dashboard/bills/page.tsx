"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Search, Plus, Eye, Edit2, Trash2, Loader2,
  Receipt, X, Calendar, User, Activity,
  Gauge, DollarSign, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Save, Inbox, Printer, Clock, AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";

const PDFActionButtons = dynamic(() => import("@/app/components/PDFActionButtons"), { 
  ssr: false,
  loading: () => <div className="text-sm text-slate-500 animate-pulse">Menyiapkan tombol...</div>
});

// ─── Types ────────────────────────────────────────────────────────────────────
type BillPayment = {
  id: number;
  bill_id: number;
  payment_date: string;
  verified: boolean;           // ← field asli dari API (bukan "status")
  total_amount: number;        // ← field asli dari API
  payment_proof: string;       // ← field asli dari API (bukan "file")
};

type Bill = {
  id: number;
  customer_id: number;
  admin_id: number;
  month: number;
  year: number;
  measurement_number: string;
  usage_value: number;
  price: number;
  service_id: number;
  paid: boolean;
  amount: number;
  service?: { name: string; price: number };
  customer?: { name: string; customer_number: string; phone: string };
  admin?: { name: string };
  payments: BillPayment | null;  // ← null = belum bayar sama sekali
};
type Service = { id: number; name: string };
type Customer = { id: number; name: string; customer_number: string };

const MONTHS = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

// ─── Status Logic (pakem utama dari user) ────────────────────────────────────
const getBillStatus = (bill: Bill): "BELUM BAYAR" | "MENUNGGU VERIFIKASI" | "LUNAS" => {
  if (!bill.payments) return "BELUM BAYAR";
  if (!bill.payments.verified) return "MENUNGGU VERIFIKASI";
  return "LUNAS";
};

const StatusBadge = ({ status }: { status: ReturnType<typeof getBillStatus> }) => {
  if (status === "LUNAS") return (
    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 font-bold whitespace-nowrap">
      <CheckCircle size={11} /> Lunas
    </span>
  );
  if (status === "MENUNGGU VERIFIKASI") return (
    <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 font-bold whitespace-nowrap">
      <Clock size={11} /> Menunggu Verif.
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20 font-bold whitespace-nowrap">
      <AlertCircle size={11} /> Belum Bayar
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  type ModalMode = "none" | "add" | "edit" | "detail" | "delete";
  const [modal, setModal] = useState<ModalMode>("none");
  const [selected, setSelected] = useState<Bill | null>(null);
  const [detailData, setDetailData] = useState<Bill | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";

  const emptyAdd = {
    customer_id: "", service_id: "", month: "",
    year: String(new Date().getFullYear()), measurement_number: "", usage_value: "",
  };
  const [addForm, setAddForm] = useState(emptyAdd);

  const emptyEdit = {
    customer_id: "", service_id: "", month: "", year: "",
    measurement_number: "", usage_value: "",
  };
  const [editForm, setEditForm] = useState(emptyEdit);

  // ─── Fetchers ──────────────────────────────────────────────────────────────
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bills", { params: { page, quantity: 10, search } });
      const payload = res.data;
      const rows = payload?.data?.data ?? payload?.data ?? payload?.rows ?? [];
      const count = payload?.data?.total ?? payload?.count ?? (Array.isArray(rows) ? rows.length : 0);
      setBills(Array.isArray(rows) ? rows : []);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10) || 1);
    } catch { toast.error("Gagal memuat data tagihan."); }
    finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    try {
      const [s, c] = await Promise.all([
        api.get("/services", { params: { page: 1, quantity: 100 } }),
        api.get("/customers", { params: { page: 1, quantity: 100 } }),
      ]);
      setServices(s.data.data || []);
      setCustomers(c.data.data || []);
    } catch { /* silent */ }
  };

  const fetchDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/bills/${id}`);
      setDetailData(res.data.data ?? res.data);
    } catch { toast.error("Gagal memuat detail."); }
    finally { setLoadingDetail(false); }
  };

  useEffect(() => { fetchMeta(); setIsMounted(true); }, []);
  useEffect(() => {
    const t = setTimeout(fetchBills, 400);
    return () => clearTimeout(t);
  }, [search, page]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openAdd = () => { setAddForm(emptyAdd); setModal("add"); };
  const openDetail = (b: Bill) => { setSelected(b); setDetailData(null); setModal("detail"); fetchDetail(b.id); };
  const openEdit = (b: Bill) => {
    setSelected(b);
    setEditForm({
      customer_id: String(b.customer_id),
      service_id: String(b.service_id),
      month: String(b.month),
      year: String(b.year),
      measurement_number: b.measurement_number,
      usage_value: String(b.usage_value),
    });
    setModal("edit");
  };
  const openDelete = (b: Bill) => { setSelected(b); setModal("delete"); };
  const closeModal = () => setModal("none");



  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post("/bills", {
        customer_id: Number(addForm.customer_id),
        service_id: Number(addForm.service_id),
        month: Number(addForm.month),
        year: Number(addForm.year),
        measurement_number: addForm.measurement_number,
        usage_value: Number(addForm.usage_value),
      });
      toast.success("Tagihan berhasil dibuat!");
      closeModal(); fetchBills();
    } catch (err: any) { toast.error(err.response?.data?.message || "Gagal."); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {};
      if (editForm.usage_value) payload.usage_value = Number(editForm.usage_value);
      if (editForm.measurement_number) payload.measurement_number = editForm.measurement_number;
      await api.patch(`/bills/${selected.id}`, payload);
      toast.success("Tagihan berhasil diperbarui!");
      closeModal(); fetchBills();
    } catch (err: any) { toast.error(err.response?.data?.message || "Gagal."); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/bills/${selected.id}`);
      toast.success("Tagihan berhasil dihapus.");
      closeModal(); fetchBills();
    } catch (err: any) { toast.error(err.response?.data?.message || "Gagal."); }
    finally { setIsSubmitting(false); }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Receipt className="text-cyan-400 shrink-0" size={32} />
            Manajemen <span className="text-cyan-400">Tagihan</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Kelola tagihan pemakaian air pelanggan PDAM.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus size={18} /> Buat Tagihan Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama pelanggan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
        />
      </div>

      {/* Table Card */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-slate-500 text-xs tracking-wider border-b border-white/5">
                <th className="px-6 pb-4 pt-5 font-medium">ID / Periode</th>
                <th className="px-6 pb-4 pt-5 font-medium">Pelanggan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Layanan</th>
                <th className="px-6 pb-4 pt-5 font-medium">No. Meter</th>
                <th className="px-6 pb-4 pt-5 font-medium">Pemakaian</th>
                <th className="px-6 pb-4 pt-5 font-medium">Total</th>
                <th className="px-6 pb-4 pt-5 font-medium">Status</th>
                <th className="px-4 pb-4 pt-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-cyan-500" size={36} />
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Memuat Data...</p>
                  </div>
                </td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Inbox size={36} className="text-slate-600" />
                    <p className="text-slate-500 font-bold text-sm">Tidak ada tagihan ditemukan.</p>
                  </div>
                </td></tr>
              ) : bills.map((b, i) => {
                const avatarColors = ["bg-cyan-400/10 text-cyan-400","bg-indigo-400/10 text-indigo-400","bg-amber-400/10 text-amber-400","bg-emerald-400/10 text-emerald-400","bg-rose-400/10 text-rose-400"];
                const col = avatarColors[i % avatarColors.length];
                const status = getBillStatus(b);
                return (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-cyan-400 text-xs bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10 w-fit">#{b.id}</span>
                        <span className="text-slate-300 text-sm font-bold">{MONTHS[b.month]} {b.year}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-xs uppercase ${col}`}>
                          {(b.customer?.name ?? "?").charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm font-bold group-hover:text-cyan-400 transition-colors">{b.customer?.name ?? `ID: ${b.customer_id}`}</p>
                          <p className="text-slate-600 text-xs">{b.customer?.customer_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{b.service?.name ?? `ID: ${b.service_id}`}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-sm">{b.measurement_number}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-200 font-bold">{b.usage_value}</span>
                      <span className="text-slate-500 text-xs ml-1">m³</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-bold text-sm">
                      {fmt(b.amount ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {[
                          { fn: () => openDetail(b), icon: Eye, hov: "hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/20", title: "Detail" },
                          { fn: () => openEdit(b), icon: Edit2, hov: "hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20", title: "Edit" },
                          { fn: () => openDelete(b), icon: Trash2, hov: "hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20", title: "Hapus" },
                        ].map(({ fn, icon: Icon, hov, title }) => (
                          <button key={title} onClick={fn} title={title}
                            className={`p-2.5 bg-slate-800/50 text-slate-500 rounded-xl transition-all border border-transparent ${hov}`}>
                            <Icon size={15} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* ══════════ MODALS ══════════ */}
      {modal !== "none" && modal !== "delete" && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-300 print:absolute print:inset-0 print:bg-white"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >

          {/* DETAIL */}
          {modal === "detail" && (
            <div className="w-full max-w-2xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden print:max-w-full print:shadow-none print:border-none print:bg-white">
              <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-white">Detail Tagihan</h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">#{selected?.id}</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  {detailData && (
                    <PDFActionButtons billData={detailData} status={getBillStatus(detailData)} />
                  )}
                  <button onClick={closeModal} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition ml-2">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 print:overflow-visible">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-cyan-500" size={36} />
                  </div>
                ) : detailData ? (
                  <>
                    {/* Status Badge Detail */}
                    <div className="flex justify-center">
                      {(() => {
                        const s = getBillStatus(detailData);
                        if (s === "LUNAS") return (
                          <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full">
                            <CheckCircle size={14} /> Tagihan Lunas
                          </span>
                        );
                        if (s === "MENUNGGU VERIFIKASI") return (
                          <span className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-full">
                            <Clock size={14} /> Menunggu Verifikasi Admin
                          </span>
                        );
                        return (
                          <span className="inline-flex items-center gap-2 px-5 py-2 bg-rose-400/10 border border-rose-400/30 text-rose-400 font-black text-xs uppercase tracking-widest rounded-full">
                            <XCircle size={14} /> Belum Dibayar
                          </span>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Calendar, label: "Periode", val: `${MONTHS[detailData.month]} ${detailData.year}` },
                        { icon: User, label: "Pelanggan", val: detailData.customer?.name ?? `ID: ${detailData.customer_id}` },
                        { icon: Activity, label: "Layanan", val: detailData.service?.name ?? `ID: ${detailData.service_id}` },
                        { icon: Gauge, label: "No. Meter", val: detailData.measurement_number },
                        { icon: Activity, label: "Pemakaian", val: `${detailData.usage_value} m³` },
                        { icon: DollarSign, label: "Harga/m³", val: fmt(detailData.price ?? detailData.service?.price ?? 0) },
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
                    {/* Total Tagihan */}
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 text-center print:border-cyan-500 print:bg-transparent">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Total Tagihan</p>
                      <p className="text-3xl font-black text-cyan-400 print:text-black">
                        {fmt(detailData.amount ?? (detailData.usage_value && detailData.service?.price ? detailData.usage_value * detailData.service.price : 0))}
                      </p>
                    </div>

                    {/* Info Pembayaran (jika ada) */}
                    {detailData.payments && (
                      <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Info Pembayaran</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-600 text-xs mb-0.5">Tanggal Bayar</p>
                            <p className="text-slate-200 font-bold">
                              {new Date(detailData.payments.payment_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 text-xs mb-0.5">Jumlah Dibayar</p>
                            <p className="text-emerald-400 font-bold">{fmt(detailData.payments.total_amount ?? 0)}</p>
                          </div>
                        </div>
                        {/* Bukti Transfer */}
                        {detailData.payments.payment_proof && (
                          <div>
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">Bukti Transfer</p>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                              <img
                                src={`${BASE_URL}/payment-proof/${detailData.payments.payment_proof}`}
                                alt="Bukti Transfer"
                                className="w-full object-contain max-h-[280px] cursor-zoom-in hover:scale-105 transition-transform duration-500"
                                onClick={() => window.open(`${BASE_URL}/payment-proof/${detailData.payments?.payment_proof}`, "_blank")}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <p className="text-xs text-slate-600 mt-1 text-center">Klik gambar untuk perbesar.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* ADD */}
          {modal === "add" && (
            <div className="w-full max-w-2xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-white">Buat Tagihan Baru</h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Isi seluruh data tagihan pemakaian air.</p>
                </div>
                <button onClick={closeModal} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col min-h-0 flex-1">
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pelanggan</label>
                    <select required value={addForm.customer_id} onChange={(e) => setAddForm({ ...addForm, customer_id: e.target.value })} className="input-premium appearance-none">
                      <option value="" disabled className="bg-slate-900">Pilih Pelanggan...</option>
                      {customers.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.customer_number})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Layanan</label>
                    <select required value={addForm.service_id} onChange={(e) => setAddForm({ ...addForm, service_id: e.target.value })} className="input-premium appearance-none">
                      <option value="" disabled className="bg-slate-900">Pilih Layanan...</option>
                      {services.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bulan</label>
                    <select required value={addForm.month} onChange={(e) => setAddForm({ ...addForm, month: e.target.value })} className="input-premium appearance-none">
                      <option value="" disabled className="bg-slate-900">Pilih Bulan...</option>
                      {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1} className="bg-slate-900">{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tahun</label>
                    <input type="number" required min={2020} max={2099} value={addForm.year} onChange={(e) => setAddForm({ ...addForm, year: e.target.value })} className="input-premium" placeholder="Tahun" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. Meter</label>
                    <input type="text" required value={addForm.measurement_number} onChange={(e) => setAddForm({ ...addForm, measurement_number: e.target.value })} className="input-premium" placeholder="Nomor Meter" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pemakaian (m³)</label>
                    <input type="number" required min={0} value={addForm.usage_value} onChange={(e) => setAddForm({ ...addForm, usage_value: e.target.value })} className="input-premium" placeholder="Volume (m³)" />
                  </div>
                  </div>
                </div>
                <div className="p-6 md:p-8 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={closeModal} className="btn-secondary px-6">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-6 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    {isSubmitting ? "Menyimpan..." : "Simpan Tagihan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDIT */}
          {modal === "edit" && selected && (
            <div className="w-full max-w-2xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-3xl font-black text-white">Edit Tagihan</h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">#{selected.id} · {MONTHS[selected.month]} {selected.year} · Kosongkan field yang tidak diubah.</p>
                </div>
                <button onClick={closeModal} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleEdit} className="flex flex-col min-h-0 flex-1">
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pelanggan (opsional)</label>
                    <select value={editForm.customer_id} onChange={(e) => setEditForm({ ...editForm, customer_id: e.target.value })} className="input-premium appearance-none">
                      <option value="" className="bg-slate-900">— Tidak diubah —</option>
                      {customers.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.customer_number})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Layanan (opsional)</label>
                    <select value={editForm.service_id} onChange={(e) => setEditForm({ ...editForm, service_id: e.target.value })} className="input-premium appearance-none">
                      <option value="" className="bg-slate-900">— Tidak diubah —</option>
                      {services.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bulan (opsional)</label>
                    <select value={editForm.month} onChange={(e) => setEditForm({ ...editForm, month: e.target.value })} className="input-premium appearance-none">
                      <option value="" className="bg-slate-900">— Tidak diubah —</option>
                      {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1} className="bg-slate-900">{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tahun (opsional)</label>
                    <input type="number" min={2020} max={2099} value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className="input-premium" placeholder="Tahun" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No. Meter (opsional)</label>
                    <input type="text" value={editForm.measurement_number} onChange={(e) => setEditForm({ ...editForm, measurement_number: e.target.value })} className="input-premium" placeholder={selected.measurement_number} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pemakaian m³ (opsional)</label>
                    <input type="number" min={0} value={editForm.usage_value} onChange={(e) => setEditForm({ ...editForm, usage_value: e.target.value })} className="input-premium" placeholder={String(selected.usage_value)} />
                  </div>
                  </div>
                </div>
                <div className="p-6 md:p-8 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={closeModal} className="btn-secondary px-6">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-6 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSubmitting ? "Menyimpan..." : "Perbarui Tagihan"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={modal === "delete" && !!selected}
        onClose={closeModal}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
        description={
          <>
            Tagihan <span className="text-white font-bold">#{selected?.id}</span> milik{" "}
            <span className="text-white font-bold">{selected?.customer?.name ?? `ID: ${selected?.customer_id}`}</span>{" "}
            periode <span className="text-white font-bold">{selected?.month ? MONTHS[selected.month] : ""} {selected?.year}</span> akan dihapus permanen.
          </>
        }
      />
    </div>
  );
}
