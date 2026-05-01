import { Power, Copy, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SessionEntity } from '@mle/types';
import { SessionStatusBadge } from '../SessionStatusBadge'; // 👈 Import the new badge

interface CardProps {
  session: SessionEntity;
  isActive: boolean;
  onActivate: () => void;
  onClone: () => void;
}

export const SessionCard = ({ session, isActive, onActivate, onClone }: CardProps) => {
  const navigate = useNavigate();

  return (
    <div className={`
      relative p-8 rounded-[2.5rem] border-4 border-slate-900 transition-all
      ${isActive ? 'bg-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] scale-[1.02]' : 'bg-slate-50 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] opacity-80'}
    `}>
      <div className="flex justify-between items-start mb-6">
        {/* 🚀 UPDATED: Replaced manual div with the Atomic Badge */}
        <SessionStatusBadge status={session.status} />
        
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase text-emerald-500 animate-pulse">Live</span>
            <Power className="text-emerald-500" fill="currentColor" size={20} />
          </div>
        )}
      </div>

      <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2">
        {session.name}
      </h3>
      
      <div className="space-y-1 mb-8">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {session._count?.classes || 0} Classes Templates
        </p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {session._count?.enrollments || 0} Registrations
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => navigate(`/admin/sessions/${session.id}/builder`)}
          className="flex items-center justify-center gap-2 w-full bg-white border-2 border-slate-900 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none"
        >
          <LayoutGrid size={14} /> Edit Inventory
        </button>

        {!isActive && (
          <button 
            onClick={onActivate}
            className="w-full bg-sky-400 text-slate-900 border-4 border-slate-900 py-3 rounded-2xl font-black uppercase tracking-widest hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
          >
            Switch to This Session
          </button>
        )}
        
        <button onClick={onClone} className="flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors mt-2 group">
          <Copy size={12} className="group-hover:rotate-12 transition-transform" /> 
          Clone to New Year
        </button>
      </div>
    </div>
  );
};