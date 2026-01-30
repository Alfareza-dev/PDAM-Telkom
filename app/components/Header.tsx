"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Jika scroll lebih dari 20px, state jadi true
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-md border-b border-white/10 py-3 shadow-xl" // Saat Scroll: Gelap Transparan (Modern)
            : "bg-transparent py-5" // Saat di Atas: Benar-benar Transparan
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LOGO - Tetap Cyan agar konsisten */}
        <h1 className="text-xl font-bold text-cyan-400 tracking-tight">
          PDAM SMART
        </h1>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {["Home", "Services", "About"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
              className="text-slate-200 hover:text-cyan-400 transition-colors"
            >
              {item}
            </Link>
          ))}

          {/* LOGIN BUTTON */}
          <Link
            href="/login"
            className={`px-5 py-2 rounded-full border transition-all duration-300 ${
              scrolled
                ? "bg-cyan-500 border-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/20"
                : "bg-transparent border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
            }`}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
