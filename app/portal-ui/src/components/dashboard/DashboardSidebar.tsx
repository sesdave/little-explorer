// apps/web/src/components/dashboard/DashboardSidebar.tsx
import { Receipt, CreditCard, ChevronRight, Clock, Pencil, Trash2, Info, ShieldCheck, Plus } from 'lucide-react';
import { DismissalContactsCard } from './DismissalContactsCard';
import { RecentPaymentsCard } from './RecentPaymentsCard';

export const DashboardSidebar = ({ payments, registrations, dismissalContacts }: any) => {
    console.log("entered regis", registrations);
  return (
    <div className="space-y-8">
      {/* 💳 Recent Transactions Section */}
      <RecentPaymentsCard 
      payments={payments}
      currency="NGN"
      />
      
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

      {/* 🛡️ Dismissal Contacts */}
       <DismissalContactsCard />
    </div>
  );
};