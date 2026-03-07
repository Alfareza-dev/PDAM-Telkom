"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Plus, Edit2, Trash2, Key, Loader2, UserCog, Shield } from "lucide-react";
import { toast } from "react-toastify";

type Admin = {
  id: number;
  username: string;
  name: string;
  phone: string;
  user?: {
    username: string;
  };
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "reset">("add");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admins`, {
        params: { page, quantity: 5, search }
      });
      setAdmins(res.data.data || []);
      const total = res.data.count || 0;
      setTotalPages(Math.ceil(total / 5) || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAdmins();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/admins/${id}`);
      toast.success("Admin deleted successfully");
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to delete admin");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ name: "", username: "", password: "", phone: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setModalMode("edit");
    setSelectedAdmin(admin);
    setFormData({ name: admin.name, username: admin.username, password: "", phone: admin.phone });
    setIsModalOpen(true);
  };

  const openResetPasswordModal = (admin: Admin) => {
    setModalMode("reset");
    setSelectedAdmin(admin);
    setFormData({ name: "", username: "", password: "", phone: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await api.post("/admins", formData);
      } else if (modalMode === "edit" && selectedAdmin) {
        const payload: any = { name: formData.name, phone: formData.phone };
        if (formData.password) payload.password = formData.password;
        await api.patch(`/admins/${selectedAdmin.id}`, payload);
      } else if (modalMode === "reset" && selectedAdmin) {
        await api.patch(`/admins/${selectedAdmin.id}`, { password: formData.password });
      }
      setIsModalOpen(false);
      toast.success("Successfully saved.");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-cyan-400" size={32} />
            Admin <span className="text-cyan-400">Management</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Kelola akses dan otoritas pengelola sistem.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={18} />
          Add New Admin
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
        />
      </div>

      {/* Table Container */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-4 text-white font-semibold text-sm">Profile</th>
                <th className="px-6 py-4 text-white font-semibold text-sm">Username</th>
                <th className="px-6 py-4 text-white font-semibold text-sm">Contact</th>
                <th className="px-4 py-4 text-white font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-cyan-500" size={40} />
                      <p className="text-slate-500 font-black tracking-[0.2em] text-[10px] uppercase">Retrieving Data...</p>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <p className="text-slate-500 font-bold">No administrator records found.</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-slate-400 font-black group-hover:border-cyan-500/30 transition-all">
                          {admin.name.charAt(0)}
                        </div>
                        <span className="text-slate-300 font-bold tracking-tight">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-cyan-400 font-mono text-sm bg-cyan-500/5 px-2 py-1 rounded-md border border-cyan-500/10">
                        @{admin.user?.username || admin.username || 'Tidak ada data'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{admin.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(admin)}
                          className="p-2.5 bg-slate-800/50 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 rounded-xl transition-all border border-transparent hover:border-amber-500/20"
                          title="Reset Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                          title="Delete Admin"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-10">
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">
          Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
        </p>
        <div className="flex gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="btn-secondary px-8 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="btn-primary px-10 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-hidden p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="relative w-[calc(100%-2rem)] md:w-full mx-4 md:mx-auto max-w-lg bg-[#0f172a] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
            
            {/* Header (Static) */}
            <div className="relative z-10 p-6 md:p-8 border-b border-slate-800/50">
              <h2 className="text-3xl font-black text-white">
                {modalMode === "add" && "Register Admin"}
                {modalMode === "edit" && "Edit Admin Profile"}
                {modalMode === "reset" && "Reset Password"}
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                {modalMode === "reset" ? `Resetting password for @${selectedAdmin?.username}` : "Pastikan seluruh informasi di bawah ini akurat."}
              </p>
            </div>

            {/* Form Body (Scrollable) */}
            <div className="relative z-10 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                {(modalMode === "add" || modalMode === "edit") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-premium"
                        placeholder="e.g. Jack Ma"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nomor Telepon</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-premium"
                        placeholder="0812..."
                      />
                    </div>
                    {modalMode === "add" && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-premium"
                          placeholder="admin.id"
                        />
                      </div>
                    )}
                  </div>
                )}

                {(modalMode === "add" || modalMode === "reset") && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {modalMode === "reset" ? "Password Baru" : "Password Akses"}
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="btn-primary flex-[2]"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                    {isSubmitting ? "Processing..." : "Confirm & Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
