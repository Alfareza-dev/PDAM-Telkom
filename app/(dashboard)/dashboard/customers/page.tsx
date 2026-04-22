"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Plus, Edit2, Trash2, Key, Loader2, Users, MapPin, Phone, Hash, X } from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

type Service = {
  id: number;
  name: string;
};

type Customer = {
  id: number;
  username?: string;
  user?: { username: string };
  name: string;
  phone: string;
  customer_number: string;
  address: string;
  service_id: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "reset">("add");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    customer_number: "",
    address: "",
    service_id: "",
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers`, {
        params: { page, quantity: 5, search }
      });
      setCustomers(res.data.data || []);
      const total = res.data.count || 0;
      setTotalPages(Math.ceil(total / 5) || 1);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data pelanggan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get(`/services`, { params: { page: 1, quantity: 100 } });
      setServices(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/customers/${deleteCustomer.id}`);
      toast.success("Pelanggan berhasil dihapus.");
      fetchCustomers();
      setDeleteCustomer(null);
    } catch (error) {
      toast.error("Gagal menghapus pelanggan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      username: "",
      password: "",
      name: "",
      phone: "",
      customer_number: "",
      address: "",
      service_id: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setFormData({
      username: customer.username,
      password: "",
      name: customer.name,
      phone: customer.phone,
      customer_number: customer.customer_number,
      address: customer.address,
      service_id: String(customer.service_id),
    });
    setIsModalOpen(true);
  };

  const openResetPasswordModal = (customer: Customer) => {
    setModalMode("reset");
    setSelectedCustomer(customer);
    setFormData({
      username: "",
      password: "",
      name: "",
      phone: "",
      customer_number: "",
      address: "",
      service_id: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!formData.service_id && modalMode !== "reset") {
        toast.warn("Silakan pilih kategori layanan.");
        setIsSubmitting(false);
        return;
      }
      const payload: any = { ...formData, service_id: Number(formData.service_id) };
      if (modalMode === "add") {
        await api.post("/customers", payload);
      } else if (modalMode === "edit" && selectedCustomer) {
        const updatePayload: any = { 
          name: formData.name, 
          phone: formData.phone,
          customer_number: formData.customer_number,
          address: formData.address,
          service_id: Number(formData.service_id)
        };
        if (formData.password) updatePayload.password = formData.password;
        await api.patch(`/customers/${selectedCustomer.id}`, updatePayload);
      } else if (modalMode === "reset" && selectedCustomer) {
        await api.patch(`/customers/${selectedCustomer.id}`, { password: formData.password });
      }
      setIsModalOpen(false);
      toast.success("Berhasil disimpan.");
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="text-cyan-400" size={32} />
            Daftar <span className="text-cyan-400">Pelanggan</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Kelola informasi pelanggan dan kategori layanan mereka.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={18} />
          Register Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari berdasarkan NIK, nama, atau username..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
        />
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-slate-500 text-xs tracking-wider border-b border-white/5">
                <th className="px-6 pb-4 pt-5 font-medium">No. Pelanggan (NIK)</th>
                <th className="px-6 pb-4 pt-5 font-medium">Nama Lengkap</th>
                <th className="px-6 pb-4 pt-5 font-medium">Username</th>
                <th className="px-6 pb-4 pt-5 font-medium">Kontak</th>
                <th className="px-4 pb-4 pt-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-cyan-500" size={40} />
                      <p className="text-slate-500 font-black tracking-[0.2em] text-[10px] uppercase">Memuat Data...</p>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <p className="text-slate-500 font-bold">Tidak ada data pelanggan yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Hash size={16} className="text-slate-600" />
                        <span className="text-slate-200 font-black tracking-widest text-sm">{customer.customer_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-bold">{customer.name}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={10} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{customer.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {customer.username || customer.user?.username ? (
                        <span className="text-cyan-400 font-mono text-xs bg-cyan-500/5 px-2 py-1 rounded-md border border-cyan-500/10">
                          @{customer.username || customer.user?.username}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-slate-400 font-medium text-sm flex items-center gap-2">
                       <Phone size={12} className="text-slate-600" />
                       {customer.phone}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                          title="Edit Customer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(customer)}
                          className="p-2.5 bg-slate-800/50 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 rounded-xl transition-all border border-transparent hover:border-amber-500/20"
                          title="Reset Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteCustomer(customer)}
                          className="p-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                          title="Delete Customer"
                        >
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
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">
          Halaman <span className="text-white">{page}</span> dari <span className="text-white">{totalPages}</span>
        </p>
        <div className="flex gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="btn-secondary px-8 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="btn-primary px-10 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 transition-opacity duration-300">
          <div className="w-full max-w-2xl bg-[#0b0f10] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
            
            {/* Header (Static) */}
            <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {modalMode === "add" && "Tambah Pelanggan"}
                  {modalMode === "edit" && "Edit Data Pelanggan"}
                  {modalMode === "reset" && "Reset Password"}
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  {modalMode === "reset" ? `Input password baru untuk ${selectedCustomer?.username ? `@${selectedCustomer.username}` : selectedCustomer?.name}` : "Lengkapi rincian data pelanggan sesuai dengan identitas resmi."}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition shrink-0"><X size={20} /></button>
            </div>

            {/* Form Body & Footer */}
            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(modalMode === "add" || modalMode === "edit") && (
                  <>
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-premium"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NIK / No. Pelanggan</label>
                      <input
                        type="text"
                        required
                        value={formData.customer_number}
                        onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                        className="input-premium"
                        placeholder="3507..."
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Telepon</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-premium"
                        placeholder="Nomor Telepon"
                      />
                    </div>
                    
                    {modalMode === "add" && (
                      <div className="space-y-1.5 text-left md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-premium"
                          placeholder="Username"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Layanan</label>
                      <select
                        required
                        value={formData.service_id}
                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                        className="input-premium appearance-none"
                      >
                        <option value="" disabled className="bg-slate-900">Pilih Kategori Layanan...</option>
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.id} className="bg-slate-900">
                            {svc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="input-premium min-h-[80px] py-3"
                        placeholder="Alamat lengkap tempat tinggal pelanggan"
                      />
                    </div>
                  </>
                )}

                {(modalMode === "add" || modalMode === "reset") && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {modalMode === "reset" ? "Password Baru" : "Password Akses"}
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium"
                      placeholder="Password"
                    />
                  </div>
                )}

                </div>
              </div>

              {/* Footer */}
              <div className="p-6 md:p-8 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
        description={
          <>
            Apakah Anda yakin ingin menghapus pelanggan <span className="text-white font-bold">{deleteCustomer?.name}</span> ({deleteCustomer?.customer_number})? Tindakan ini tidak dapat dibatalkan.
          </>
        }
      />
    </div>
  );
}
