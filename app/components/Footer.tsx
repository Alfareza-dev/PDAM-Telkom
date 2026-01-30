export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <h2 className="text-cyan-400 font-bold text-lg">PDAM SMART</h2>
            <p className="text-slate-500 text-xs">
              © 2026 PDAM SMART • Smart Water Management System
            </p>
          </div>

          {/* Quick Links (Opsional, agar footer tidak terlalu sepi) */}
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
