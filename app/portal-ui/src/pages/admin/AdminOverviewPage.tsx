// apps/web/src/pages/admin/AdminOverviewPage.tsx
import { Users, Calendar, DollarSign, Activity, TrendingUp, ChevronRight } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { QuickActions } from '@/components/overview/QuickActions';
import { RecentApplications } from '@/components/overview/RecentApplications'; // 👈 Make sure to import this
import { useLoaderData, useNavigate } from 'react-router-dom';

export const AdminOverviewPage = () => {
  // Pulling the real data from the adminDashboardLoader
  const { stats, recentApps } = useLoaderData() as any;
  const navigate = useNavigate();

  // Fallback if data isn't ready
  if (!stats) return (
    <div className="p-20 text-center font-black uppercase italic text-slate-400 animate-pulse">
      Initialising Management Console...
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
            Management Console
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            System Status: <span className="text-emerald-500">All Systems Operational</span>
          </p>
        </div>
        <button className="bg-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] px-6 py-2 font-black uppercase text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2">
          Generate Report <ChevronRight size={18} strokeWidth={3} />
        </button>
      </header>
      
      {/* Stats Grid - Mapping to backend AdminService fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={24} strokeWidth={3} />} 
          label="Total Explorers" 
          value={stats.totalExplorers} 
          trend={stats.explorerTrend} 
          color="bg-sky-400" 
          onClick={() => navigate('/admin/explorers')}
        />
        <StatCard 
          icon={<Calendar size={24} strokeWidth={3} />} 
          label="Confirmed Seats" 
          value={stats.activeRegistrations} 
          trend="Steady" 
          color="bg-amber-400" 
        />
        <StatCard 
          icon={<DollarSign size={24} strokeWidth={3} />} 
          label="Revenue (MTD)" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend={stats.revenueTrend} 
          color="bg-emerald-400" 
        />
        <StatCard 
          icon={<Activity size={24} strokeWidth={3} />} 
          label="Action Required" 
          value={stats.pendingCount} 
          trend="Pending" 
          color="bg-rose-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Revenue Chart Area */}
          <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] p-8 overflow-hidden relative">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">Revenue Analytics</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Monthly Growth Trend</p>
              </div>
              <div className="bg-slate-100 border-2 border-slate-900 px-3 py-1 rounded-lg font-black text-xs">
                2026 VS 2025
              </div>
            </div>
            
            <div className="h-64 w-full bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center space-y-2">
              <TrendingUp size={40} className="text-slate-200" />
              <p className="text-slate-300 font-black uppercase tracking-tighter italic">Data visualization stream active</p>
            </div>
          </div>

          {/* 🏛️ RE-ADDED: The Real-time Application Feed */}
          <RecentApplications applications={recentApps} />
        </div>

        {/* Modular Sidebar Component - Passing pendingCount for the badge */}
        <QuickActions pendingCount={stats.pendingCount} />
      </div>
    </div>
  );
};