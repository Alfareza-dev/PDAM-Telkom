"use client";

import { storeCookie } from "@/lib/client-cookie";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, User, Lock, Loader2, Check } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("adminbanana");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔁 Auto redirect kalau sudah login
  useEffect(() => {
    if (document.cookie.includes("token=")) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Username dan password wajib diisi");
      toast.warn("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      // PERBAIKAN MUTLAK: Login khusus Admin menggunakan username & password
      const { data } = await api.post("/auth", { username, password });

      if (data.success) {
        const token = data.token;
        
        if (token) {
          storeCookie("token", token);
          storeCookie("username", username);
          toast.success("Login successful! Welcome back.");
          setSuccess(true);
          setTimeout(() => {
            router.replace("/dashboard");
          }, 800);
        } else {
          setErrorMsg("JWT Token tidak ditemukan dalam response API /auth");
          toast.error("Token not found in response.");
        }
      } else {
        setErrorMsg(data.message || "Login gagal");
        toast.error(data.message || "Login failed");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Server tidak merespon";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 md:px-6">
      {/* Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />

      {/* Card */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-8 transition-all duration-500
        ${success ? "scale-95 opacity-0" : errorMsg ? "animate-shake" : ""}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-white">
            PDAM <span className="text-cyan-400">SMART</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to management system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <input
                type="text"
                required
                disabled={loading}
                placeholder="admin-29"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/10
                text-slate-100 placeholder:text-slate-500 pl-10 pr-3 py-2.5
                focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
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
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/10
                text-slate-100 placeholder:text-slate-500 pl-10 pr-10 py-2.5
                focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-sm text-red-400 text-center">{errorMsg}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
            rounded-lg bg-cyan-500 hover:brightness-110 active:scale-95
            transition text-slate-900 font-semibold py-2.5 shadow-lg
            shadow-cyan-500/30 disabled:opacity-60"
          >
            {success ? (
              <Check size={18} />
            ) : loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : null}
            {success ? "Welcome" : loading ? "Signing in..." : "Login"}
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
