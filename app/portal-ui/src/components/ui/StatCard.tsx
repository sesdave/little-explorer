import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend: string;
  color: string;
  onClick?: () => void;
}

export const StatCard = ({ icon, label, value, trend, color, onClick }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-transform cursor-default">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 ${color} border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-slate-900`}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        {trend}
      </span>
    </div>
    <div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
    </div>
  </div>
);