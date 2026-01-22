"use client";

import { BASE_API_URL } from "@/global";
import { storeCookie } from "@/lib/client-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `${BASE_API_URL}/app-owners/auth`;
      const payload = { email, password };

      const { data } = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("LOGIN RESPONSE:", data);

      // ✅ LOGIN BERHASIL
      if (data.success) {
        toast.success("Login berhasil 🎉", {
          autoClose: 1500,
        });

        const owner = data.data;

        storeCookie("token", owner.owner_token);
        storeCookie("owner_id", String(owner.id));
        storeCookie("email", owner.email);

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      }

      // ❌ LOGIN GAGAL (VALIDASI API)
      else {
        toast.warning(data.message || "Login gagal ❌");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      // ❌ ERROR SERVER / NETWORK
      toast.error("Login gagal! Server bermasalah 🚨");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <ToastContainer />

      <div className="relative w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-8">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/10 blur-3xl rounded-full" />

        {/* Header Card */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            PDAM <span className="text-cyan-400">SMART</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to management system
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
                className="w-full rounded-lg bg-slate-900/70 border border-white/10 text-slate-100 placeholder:text-slate-500 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
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
                className="w-full rounded-lg bg-slate-900/70 border border-white/10 text-slate-100 placeholder:text-slate-500 pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
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
            className="w-full rounded-lg bg-cyan-500 hover:brightness-110 active:scale-95 transition text-slate-900 font-semibold py-2.5 shadow-lg shadow-cyan-500/30"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
