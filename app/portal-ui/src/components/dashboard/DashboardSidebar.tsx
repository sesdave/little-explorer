// apps/web/src/components/dashboard/DashboardSidebar.tsx
import { Receipt, CreditCard, ChevronRight, Clock, Heart, Plus } from 'lucide-react';
import { DismissalContactsCard } from './DismissalContactsCard';
import { RecentPaymentsCard } from './RecentPaymentsCard';
import { Navigate, useNavigate } from 'react-router-dom';

export const DashboardSidebar = ({ payments, registrations, dismissalContacts }: any) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      
      {/* 🎁 COMPACT DONATION BAR */}
    <div className="bg-amber-100 border-4 border-slate-900 rounded-3xl p-4 shadow-[6px_6px_0px_0px_#0f172a] flex items-center justify-between group hover:bg-amber-200 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] group-hover:scale-110 transition-transform">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase italic leading-none text-slate-900">
            Support VBS
          </h3>
          <p className="text-[10px] font-bold text-slate-600 leading-none mt-1">
            Fuel the mission 🚀
          </p>
        </div>
      </div>

      <button onClick={(e) => {
            e.stopPropagation(); // Prevents double-triggering if the parent div also has an onClick
            navigate('/dashboard/donate');
          }} className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-tight hover:bg-rose-500 transition-colors">
        Give
      </button>
    </div>

      {/* 🕒 Enrollment Status Summary */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <h3 className="font-black uppercase text-xs tracking-widest mb-4 text-sky-400">Current Status</h3>
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-amber-400" />
            <span className="text-[11px] font-bold uppercase">Reserved Spots</span>
          </div>
          <span className="font-black text-lg text-white">{registrations || 0}</span>
        </div>
      </div>

      {/* 💳 Recent Transactions Section */}
      <RecentPaymentsCard 
        payments={(payments || []).slice(0, 3)}
        currency="NGN"
      />

      {/* 🛡️ Dismissal Contacts */}
      <DismissalContactsCard />
    </div>
  );
};