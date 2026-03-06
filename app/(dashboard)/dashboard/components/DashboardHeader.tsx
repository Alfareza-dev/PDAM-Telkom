export default function DashboardHeader({ username }: { username?: string }) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Welcome back, <span className="text-cyan-400">{username || "Admin"}</span>!
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Statistik & performa sistem PDAM Smart hari ini.
        </p>
      </div>
      <div className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Current Date</p>
        <p className="text-sm font-medium text-slate-200">{today}</p>
      </div>
    </div>
  );
}
