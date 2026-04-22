import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "cyan" | "indigo" | "emerald" | "amber";
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorMap = {
    cyan: {
      wrapperHover: "hover:border-cyan-400/50",
      blurBg: "bg-cyan-400/10 group-hover:bg-cyan-400/20",
      iconBg: "bg-cyan-400/10",
      iconText: "text-cyan-400",
    },
    indigo: {
      wrapperHover: "hover:border-indigo-400/50",
      blurBg: "bg-indigo-400/10 group-hover:bg-indigo-400/20",
      iconBg: "bg-indigo-400/10",
      iconText: "text-indigo-400",
    },
    emerald: {
      wrapperHover: "hover:border-emerald-400/50",
      blurBg: "bg-emerald-400/10 group-hover:bg-emerald-400/20",
      iconBg: "bg-emerald-400/10",
      iconText: "text-emerald-400",
    },
    amber: {
      wrapperHover: "hover:border-amber-400/50",
      blurBg: "bg-amber-400/10 group-hover:bg-amber-400/20",
      iconBg: "bg-amber-400/10",
      iconText: "text-amber-400",
    },
  };

  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`bg-slate-900/40 border border-white/5 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden group transition-all duration-300 ${theme.wrapperHover}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 ${theme.blurBg}`}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${theme.iconBg} ${theme.iconText}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-black text-white">{typeof value === 'number' ? value.toLocaleString('id-ID') : value}</h2>
      </div>
    </div>
  );
}
