import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "cyan" | "indigo" | "emerald" | "amber";
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorMap = {
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
    indigo: "from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
  };

  const bgMap = {
    cyan: "bg-cyan-500/10 text-cyan-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border ${colorMap[color]} p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800/50 group`}>
      <div className={`absolute -right-4 -bottom-4 opacity-5 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12`}>
         <Icon size={120} />
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-3 rounded-xl ${bgMap[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
      </div>
    </div>
  );
}
