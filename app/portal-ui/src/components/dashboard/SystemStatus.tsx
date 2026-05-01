// apps/web/src/components/dashboard/SystemStatus.tsx
import { ShieldCheck } from 'lucide-react';

export const SystemStatus = () => (
  <div className="
    flex items-center gap-3 
    bg-slate-50 text-slate-400 
    px-6 py-3 rounded-2xl 
    border-2 border-slate-200 border-dashed
  ">
    <ShieldCheck size={16} className="text-slate-300" />
    <span className="font-black text-[10px] uppercase tracking-widest">
      System: Online
    </span>
  </div>
);