"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Receipt, Search, Loader2, X, CreditCard,
  ChevronLeft, ChevronRight, Inbox, Upload,
  Calendar, Activity, CheckCircle, AlertCircle,
  FileImage, CloudUpload, Clock,
} from "lucide-react";

// ─── Types (100% sesuai struktur API nyata) ───────────────────────────────────
type BillPayment = {
  id: number;
  bill_id: number;
  payment_date: string;
  verified: boolean;          // ← field asli dari API
  total_amount: number;       // ← field asli dari API
  payment_proof: string;      // ← field asli dari API
};

type Bill = {
  id: number;
  month: number;
  year: number;
  measurement_number: string;
  usage_value: number;
  amount: number;
  paid: boolean;
  service?: { name: string; price: number };
  payments: BillPayment | null;  // ← null = belum bayar sama sekali
};

const MONTHS = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

// ─── Status Logic (pakem utama) ───────────────────────────────────────────────
const getBillStatus = (bill: Bill): "BELUM BAYAR" | "MENUNGGU VERIFIKASI" | "LUNAS" => {
  if (!bill.payments) return "BELUM BAYAR";
  if (!bill.payments.verified) return "MENUNGGU VERIFIKASI";
  return "LUNAS";
};

const StatusBadge = ({ status }: { status: ReturnType<typeof getBillStatus> }) => {
  if (status === "LUNAS") return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <CheckCircle size={12} /> LUNAS
    </span>
  );
  if (status === "MENUNGGU VERIFIKASI") return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <Clock size={12} className="animate-pulse" /> MENUNGGU VERIFIKASI
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
      <AlertCircle size={12} /> BELUM BAYAR
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Upload Bukti
  const [paymentModal, setPaymentModal] = useState<Bill | null>(null);
  const [payFile, setPayFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bills/me", { params: { page, quantity: 10, search } });
      const payload = res.data;
      const rows = payload?.data?.data ?? payload?.data ?? payload?.rows ?? [];
      const count = payload?.data?.total ?? payload?.count ?? rows.length;
      setBills(Array.isArray(rows) ? rows : []);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / 10) || 1);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat data tagihan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [page, search]);

  // File selection dengan validasi 2MB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 2MB!");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPayFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        return;
      }
      setPayFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPayFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Buka modal bayar — hanya jika status BELUM BAYAR
  const openPayModal = (bill: Bill) => {
    const status = getBillStatus(bill);
    if (status !== "BELUM BAYAR") {
      toast.info("Tagihan ini sudah memiliki pembayaran yang sedang diproses atau sudah lunas.");
      return;
    }
    setPaymentModal(bill);
    setPayFile(null);
    setPreviewUrl(null);
  };

  const closePayModal = () => {
    setPaymentModal(null);
    setPayFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Submit Upload Bukti
  const handleSubmitPayment = async () => {
    if (!paymentModal || !payFile) {
      toast.warn("Pilih file bukti transfer terlebih dahulu.");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bill_id", String(paymentModal.id));
      formData.append("file", payFile);
      await api.post("/payments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
      closePayModal();
      fetchBills();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim bukti pembayaran.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBills = bills.filter(bill => getBillStatus(bill) !== "LUNAS");

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Receipt className="text-cyan-400 shrink-0" size={32} />
          Tagihan <span className="text-cyan-400">Saya</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Kelola dan bayar tagihan air Anda secara mandiri.</p>
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Cari tagihan..."
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
                <th className="px-6 pb-4 pt-5 font-medium">Periode</th>
                <th className="px-6 pb-4 pt-5 font-medium">No. Meter</th>
                <th className="px-6 pb-4 pt-5 font-medium">Pemakaian (m³)</th>
                <th className="px-6 pb-4 pt-5 font-medium">Layanan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Total Tagihan</th>
                <th className="px-6 pb-4 pt-5 font-medium">Status</th>
                <th className="px-4 pb-4 pt-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-cyan-500" size={36} />
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Memuat Tagihan...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <Inbox size={40} className="text-slate-600" />
                      <p className="text-slate-500 font-bold">Tidak ada data tagihan ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const status = getBillStatus(bill);
                  return (
                    <tr key={bill.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-500" />
                          <span className="text-white font-bold">{MONTHS[bill.month]} {bill.year}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{bill.measurement_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-cyan-500" />
                          <span className="text-white font-bold">{bill.usage_value}</span>
                          <span className="text-slate-500 text-xs">m³</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{bill.service?.name || "-"}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">{fmt(bill.amount || 0)}</td>
                      <td className="px-6 py-4"><StatusBadge status={status} /></td>
                      <td className="px-4 py-4 text-right">
                        {/* Tombol bayar HANYA tampil jika status BELUM BAYAR */}
                        {status === "BELUM BAYAR" && (
                          <button
                            onClick={() => openPayModal(bill)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all text-xs font-bold"
                          >
                            <CreditCard size={14} /> Bayar Sekarang
                          </button>
                        )}
                        {/* Jika menunggu verifikasi, tampilkan info */}
                        {status === "MENUNGGU VERIFIKASI" && (
                          <span className="text-xs text-amber-400/70 font-medium">Menunggu admin...</span>
                        )}
                        {/* Jika lunas, tidak perlu tombol */}
                        {status === "LUNAS" && (
                          <span className="text-xs text-emerald-400/70 font-medium">Selesai ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">
          Halaman <span className="text-white">{page}</span> dari <span className="text-white">{totalPages}</span>
          <span className="text-slate-700 ml-2 normal-case tracking-normal">({filteredBills.length} tagihan tertunda di halaman ini)</span>
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="px-3 py-2 text-sm font-bold text-slate-400 bg-slate-900/50 border border-white/5 rounded-xl">{page}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-sm font-bold transition disabled:opacity-30 disabled:cursor-not-allowed">
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ══════════ MODAL UPLOAD BUKTI BAYAR ══════════ */}
      {paymentModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) closePayModal(); }}
        >
          <div className="w-full max-w-xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Unggah Bukti Pembayaran</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Tagihan: <span className="text-cyan-400 font-bold">{MONTHS[paymentModal.month]} {paymentModal.year}</span>
                  {" · "}Total: <span className="text-emerald-400 font-bold">{fmt(paymentModal.amount || 0)}</span>
                </p>
              </div>
              <button onClick={closePayModal} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Info Tagihan */}
              <div className="bg-slate-900/60 rounded-xl border border-white/5 p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold">No. Meter</p>
                  <p className="text-white font-mono">{paymentModal.measurement_number}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold">Pemakaian</p>
                  <p className="text-white font-bold">{paymentModal.usage_value} m³</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold">Layanan</p>
                  <p className="text-white">{paymentModal.service?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5 font-bold">Total Tagihan</p>
                  <p className="text-emerald-400 font-bold">{fmt(paymentModal.amount || 0)}</p>
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileImage size={14} className="text-cyan-400" /> Foto Bukti Transfer
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden
                    ${payFile ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900"}`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview Bukti" className="w-full h-56 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-sm">Klik untuk ganti foto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                        <CloudUpload size={32} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 font-bold text-sm">Klik untuk pilih foto bukti transfer</p>
                        <p className="text-slate-600 text-xs mt-1">JPG, PNG, JPEG — Ukuran maks. 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {payFile && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-400" />
                    {payFile.name} ({(payFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex justify-end p-5 border-t border-slate-800 gap-3">
              <button type="button" onClick={closePayModal}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition">
                Batal
              </button>
              <button
                type="button"
                disabled={!payFile || isSubmitting}
                onClick={handleSubmitPayment}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-sm font-black transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {isSubmitting ? "Mengunggah..." : "Kirim Bukti Bayar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
