// apps/web/src/components/dashboard/DashboardSidebar.tsx
import { Receipt, CreditCard, ChevronRight, Clock } from 'lucide-react';

export const DashboardSidebar = ({ payments, registrations }: any) => {
    console.log("entered regis", registrations);
  return (
    <div className="space-y-8">
      {/* 💳 Recent Transactions Section */}
      <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-400 border-2 border-slate-900 rounded-lg">
            <Receipt size={18} className="text-slate-900" />
          </div>
          <h3 className="font-black uppercase text-sm tracking-tight">Recent Payments</h3>
        </div>

        <div className="space-y-4">
          {payments?.length > 0 ? (
            payments.map((payment: any) => (
              <div key={payment.id} className="group cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-xs uppercase text-slate-900">{payment.method}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(payment.paidAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs">${Number(payment.amount).toLocaleString()}</p>
                    <span className="text-[9px] font-black uppercase text-emerald-500">Successful</span>
                  </div>
                </div>
                <div className="mt-2 h-1 w-0 group-hover:w-full bg-slate-100 transition-all duration-300" />
              </div>
            ))
          ) : (
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">No transactions yet</p>
          )}
        </div>

        <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">
          View All Billing
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
    </div>
  );
};