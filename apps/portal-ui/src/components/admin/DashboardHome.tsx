// src/components/admin/DashboardHome.tsx

// 1. Define the interface for the StatCard props
interface StatCardProps {
  label: string;
  value: string;
  change: string;
  color?: string; // Optional because you have a default value
}

export const DashboardHome = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-black text-slate-900">Control Tower</h1>
      <p className="text-slate-500">Live system health and registrations</p>
    </header>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard label="Total Revenue" value="$42,500" change="+12%" />
      <StatCard label="Active Explorers" value="156" change="+5%" />
      <StatCard 
        label="Session Capacity" 
        value="88%" 
        change="Critical" 
        color="text-rose-500" 
      />
    </div>
  </div>
);

// 2. Apply the interface to the component
const StatCard = ({ label, value, change, color = "text-emerald-500" }: StatCardProps) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">{label}</p>
    <div className="flex justify-between items-end">
      <p className="text-4xl font-black text-slate-900">{value}</p>
      <span className={`font-bold text-sm ${color}`}>{change}</span>
    </div>
  </div>
);