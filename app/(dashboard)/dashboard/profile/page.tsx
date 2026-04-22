"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  User, Shield, CheckCircle, Edit3, Lock,
  Phone, Save, X, Loader2, Eye, EyeOff
} from "lucide-react";

type AdminProfile = {
  id: number;
  name: string;
  username: string;
  phone: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admins/me");
      const data = res.data.data || res.data;
      setProfile(data);
      setFormData({ name: data.name, phone: data.phone, password: "" });
    } catch (err) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
      };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }
      await api.patch(`/admins/${profile.id}`, payload);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({ name: profile.name, phone: profile.phone, password: "" });
    }
    setIsEditing(false);
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12 px-4 md:px-0 pt-2">

      {/* Profile Hero Card */}
      <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20 ring-4 ring-white/5">
              {loading ? (
                <Loader2 className="animate-spin text-white" size={40} />
              ) : (
                <span className="text-4xl font-black text-white">{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-950 p-2 rounded-xl border border-white/10 shadow-xl">
              <Shield size={18} className="text-cyan-400" />
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 w-48 bg-slate-800/80 animate-pulse rounded-lg" />
                <div className="h-4 w-32 bg-slate-800/60 animate-pulse rounded-lg" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profile?.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-cyan-400 text-sm bg-cyan-500/5 px-3 py-1 rounded-lg border border-cyan-500/10">
                    @{profile?.username}
                  </span>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-full">
                    Administrator
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Edit Toggle */}
          {!loading && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 rounded-xl transition-all font-bold text-sm"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Info Grid / Edit Form */}
      {!loading && (
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl">
          {!isEditing ? (
            /* Info View */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="py-4 sm:py-0 sm:pr-6 space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Full Name
                </p>
                <p className="text-white font-bold text-lg">{profile?.name}</p>
              </div>
              <div className="py-4 sm:py-0 sm:pl-6 space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </p>
                <p className="text-white font-bold text-lg">{profile?.phone || "—"}</p>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-black text-lg">Edit Profile</h3>
                <button type="button" onClick={handleCancel} className="text-slate-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium"
                    placeholder="Nama Lengkap"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-premium"
                    placeholder="0812..."
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Lock size={10} /> New Password
                    <span className="text-slate-600 normal-case tracking-normal font-medium">(kosongkan jika tidak ingin mengubah)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-premium pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-[2]"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
