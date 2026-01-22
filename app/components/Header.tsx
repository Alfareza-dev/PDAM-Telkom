"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${
          scrolled
            ? "backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold text-cyan-400 tracking-wide">
          PDAM SYSTEM
        </h1>

        {/* Menu */}
        <nav className="hidden md:flex gap-6 items-center text-sm">
          {["Home", "Services", "About"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
              className="relative group px-3 py-1 text-slate-200 hover:text-cyan-400 transition"
            >
              <span className="relative z-10">{item}</span>
              {/* underline highlight */}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
            </Link>
          ))}

          {/* Login button */}
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition duration-300"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
