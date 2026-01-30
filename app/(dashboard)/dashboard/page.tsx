export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-400 mt-2">
        Selamat datang di sistem manajemen PDAM 🚰
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
        {["Admins", "Customers", "Services", "Bills"].map((item) => (
          <div
            key={item}
            className="rounded-xl bg-slate-900 border border-white/10 p-5"
          >
            <p className="text-sm text-slate-400">{item}</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
