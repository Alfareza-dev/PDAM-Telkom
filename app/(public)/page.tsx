import { Droplets, Gauge, CreditCard, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* 🔑 SENTINEL (WAJIB untuk sticky header ala Apple) */}
      <div id="scroll-sentinel" className="h-px" />

      {/* 🌌 PAGE WRAPPER */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-100">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 pt-40 pb-32 text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Smart Water{" "}
              <span className="text-cyan-400">Management System</span>
            </h1>

            <p className="mt-6 text-slate-400 max-w-2xl mx-auto">
              Platform digital PDAM untuk monitoring penggunaan air, pembayaran
              tagihan, dan layanan pelanggan secara cepat dan transparan.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <a
                href="/login"
                className="px-6 py-3 rounded-lg bg-cyan-500 text-slate-900
                           font-semibold hover:brightness-110 transition
                           shadow-lg shadow-cyan-500/30"
              >
                Get Started
              </a>

              <a
                href="#services"
                className="px-6 py-3 rounded-lg border border-white/20
                           hover:border-cyan-400 transition"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* ✨ Glow */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
        </section>

        {/* ================= SERVICES ================= */}
        <section id="services" className="max-w-7xl mx-auto px-6 py-32">
          <h2 className="text-3xl font-bold text-center mb-16">
            Our <span className="text-cyan-400">Services</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <ServiceCard
              icon={<Gauge size={28} />}
              title="Usage Monitoring"
              desc="Pantau pemakaian air pelanggan secara realtime."
            />
            <ServiceCard
              icon={<CreditCard size={28} />}
              title="Online Payment"
              desc="Pembayaran tagihan cepat dan aman."
            />
            <ServiceCard
              icon={<Droplets size={28} />}
              title="Water Quality"
              desc="Monitoring kualitas dan distribusi air."
            />
            <ServiceCard
              icon={<ShieldCheck size={28} />}
              title="Secure System"
              desc="Keamanan data pelanggan terjamin."
            />
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section
          id="about"
          className="max-w-5xl mx-auto px-6 pb-32 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">
            About <span className="text-cyan-400">PDAM Smart</span>
          </h2>

          <p className="text-slate-400 leading-relaxed">
            PDAM Smart adalah sistem informasi berbasis web yang dirancang untuk
            meningkatkan efisiensi layanan air bersih, transparansi data, serta
            kemudahan akses bagi pelanggan dan petugas operasional.
          </p>
        </section>
      </div>
    </>
  );
}

/* ================= CARD ================= */

function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="group rounded-xl bg-white/5 backdrop-blur
                 border border-white/10 p-6
                 hover:border-cyan-400/40 transition"
    >
      <div className="text-cyan-400 mb-4 group-hover:scale-110 transition">
        {icon}
      </div>

      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
