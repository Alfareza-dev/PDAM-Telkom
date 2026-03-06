import { cookies } from "next/headers";
import axios from "axios";
import StatCard from "./components/StatCard";
import DashboardHeader from "./components/DashboardHeader";
import { BASE_API_URL } from "@/global";
import { Users, FileText, CreditCard, LayoutDashboard } from "lucide-react";

async function getDashboardData() {
  const token = cookies().get("token")?.value;
  const username = cookies().get("username")?.value;
  const headers = { 
    Authorization: `Bearer ${token}`,
    "app-key": process.env.NEXT_PUBLIC_APP_KEY
  };

  try {
    const fetchStats = async (endpoint: string) => {
      try {
        const { data } = await axios.get(`${BASE_API_URL}${endpoint}?page=1&quantity=100`, { headers });
        return data.count ?? data.data?.length ?? 0;
      } catch (error) {
        return 0;
      }
    };

    const [total_customers, total_services, total_bills, total_payments] = await Promise.all([
      fetchStats("/customers"),
      fetchStats("/services"),
      fetchStats("/bills"),
      fetchStats("/payments"),
    ]);

    return { total_customers, total_services, total_bills, total_payments, username };
  } catch (error) {
    return { total_customers: 0, total_services: 0, total_bills: 0, total_payments: 0, username };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <DashboardHeader username={stats.username} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pelanggan" value={stats.total_customers} icon={Users} color="cyan" />
        <StatCard title="Total Layanan" value={stats.total_services} icon={LayoutDashboard} color="indigo" />
        <StatCard title="Total Tagihan" value={stats.total_bills} icon={FileText} color="emerald" />
        <StatCard title="Total Pembayaran" value={stats.total_payments} icon={CreditCard} color="amber" />
      </div>

      {/* Decorative Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
          <h2 className="text-3xl font-bold text-white relative z-10">Optimalkan Layanan Air Bersih</h2>
          <p className="text-slate-400 mt-4 max-w-md relative z-10 leading-relaxed text-lg">
            Sistem manajemen PDAM Smart membantu Anda memantau seluruh aktivitas pelanggan, penagihan, dan layanan secara real-time dangan tingkat akurasi tinggi.
          </p>
          <div className="mt-8 flex gap-4 relative z-10">
             <div className="h-1 w-20 bg-cyan-500 rounded-full" />
             <div className="h-1 w-10 bg-slate-700 rounded-full" />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-cyan-400 shadow-xl">
              <LayoutDashboard size={40} />
           </div>
           <h3 className="text-xl font-bold text-white">Quick Management</h3>
           <p className="text-sm text-slate-500">Kelola master data dengan mudah melalui panel navigasi di sebelah kiri.</p>
        </div>
      </div>
    </div>
  );
}
