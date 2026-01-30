"use client";

import { BASE_API_URL } from "@/global";
import { storeCookie } from "@/lib/client-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Auto redirect kalau sudah login
  useEffect(() => {
    const token = document.cookie.includes("token=");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Email dan password wajib diisi ⚠️");
      return;
    }

    setLoading(true);

    try {
      const url = `${BASE_API_URL}/app-owners/auth`;

      const { data } = await axios.post(
        url,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("LOGIN RESPONSE:", data);

      // ✅ LOGIN BERHASIL
      if (data.success) {
        const owner = data.data;

        storeCookie("token", owner.owner_token);
        storeCookie("owner_id", String(owner.id));
        storeCookie("email", owner.email);

        toast.success("Login berhasil 🎉", { autoClose: 1200 });

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1200);
      }

      // ❌ LOGIN GAGAL DARI API
      else {
        toast.error(data.message || "Email atau password salah ❌");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Server bermasalah 🚨 Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <ToastContainer theme="dark" />

      {/* 🌈 Glow Background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />

      {/* 🧊 Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-white">
            PDAM <span className="text-cyan-400">SMART</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Login to management system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="admin@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-slate-900/70 border border-white/10 text-slate-100 placeholder:text-slate-500 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg bg-slate-900/70 border border-white/10 text-slate-100 placeholder:text-slate-500 pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:brightness-110 active:scale-95 transition text-slate-900 font-semibold py-2.5 shadow-lg shadow-cyan-500/30 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-slate-500 mt-6">
          © 2026 PDAM Smart System
        </p>
      </div>
    </div>
  );
}
