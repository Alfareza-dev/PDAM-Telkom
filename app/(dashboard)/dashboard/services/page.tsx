"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Plus, Edit2, Trash2, Loader2, LayoutDashboard, Package, Activity, Inbox } from "lucide-react";
import { toast } from "react-toastify";

type Service = {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    min_usage: 0,
    max_usage: 0,
    price: 0,
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/services`, {
        params: { page, quantity: 5, search }
      });
      setServices(res.data.data || []);
      const total = res.data.count || 0;
      setTotalPages(Math.ceil(total / 5) || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchServices();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      min_usage: 0,
      max_usage: 0,
      price: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setModalMode("edit");
    setSelectedService(service);
    setFormData({
      name: service.name,
      min_usage: service.min_usage,
      max_usage: service.max_usage,
      price: service.price,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        min_usage: Number(formData.min_usage),
        max_usage: Number(formData.max_usage),
        price: Number(formData.price),
      };

      if (modalMode === "add") {
        await api.post("/services", payload);
      } else if (modalMode === "edit" && selectedService) {
        await api.patch(`/services/${selectedService.id}`, payload);
      }
      setIsModalOpen(false);
      toast.success("Successfully saved.");
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred while saving.");
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
            <Package className="text-cyan-400" size={32} />
            Layanan <span className="text-cyan-400">Settings</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Konfigurasi kategori pemakaian dan tarif harga per m³.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={18} />
          Create New Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search service name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
        />
      </div>

      {/* Table Container */}
      <div className="w-full table-container shadow-cyan-500/5">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-5">Service Category</th>
                <th className="px-6 py-5">Usage Range (m³)</th>
                <th className="px-6 py-5">Price per Unit</th>
                <th className="px-4 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-cyan-500" size={40} />
                      <p className="text-slate-500 font-black tracking-[0.2em] text-[10px] uppercase">Retrieving Data...</p>
                    </div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                       <Inbox size={40} className="text-slate-600" />
                       <p className="text-slate-500 font-bold">No services configured yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="table-row group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                          <Activity size={18} />
                        </div>
                        <span className="text-slate-100 font-black tracking-tight text-lg">{service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 font-bold text-xs">{service.min_usage}</span>
                         <div className="w-4 h-[1px] bg-slate-700" />
                         <span className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 font-bold text-xs">{service.max_usage}</span>
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">m³</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                         <span className="text-emerald-400 font-black text-lg">Rp {service.price.toLocaleString("id-ID")}</span>
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tracking-widest mt-0.5">fixed rate</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                          title="Edit Service"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                          title="Delete Service"
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
                {modalMode === "add" ? "Create Service" : "Edit Parameter"}
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Configure the technical and pricing parameters for this water service.</p>
            </div>

            {/* Form Body (Scrollable) */}
            <div className="relative z-10 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Layanan</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium"
                    placeholder="e.g. Rumah Tangga A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Usage (m³)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.min_usage}
                      onChange={(e) => setFormData({ ...formData, min_usage: Number(e.target.value) })}
                      className="input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Usage (m³)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.max_usage}
                      onChange={(e) => setFormData({ ...formData, max_usage: Number(e.target.value) })}
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Harga per m³ (IDR)</label>
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium z-10">Rp</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 relative z-0"
                    />
                  </div>
                </div>

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
                    {isSubmitting ? "Updating..." : "Confirm Configuration"}
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
