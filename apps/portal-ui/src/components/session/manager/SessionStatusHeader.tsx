import { Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SessionEntity } from '@mle/types';

interface HeaderProps {
  activeSession?: SessionEntity;
  onNewSession: () => void;
}

export const SessionStatusHeader = ({ activeSession, onNewSession }: HeaderProps) => (
  <header className="bg-slate-900 rounded-[3rem] p-10 text-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="space-y-2 text-center md:text-left">
        <span className="bg-sky-400 text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
          Live System Status
        </span>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          {activeSession ? activeSession.name : "No Active Session"}
        </h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
          Registration: <span className={activeSession?.status === 'REGISTRATION' ? 'text-emerald-400' : 'text-rose-400'}>
            {activeSession?.status || 'OFFLINE'}
          </span>
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button 
          onClick={onNewSession}
          variant="outline" 
          className="bg-white text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(56,189,248,1)]"
        >
          <Plus className="mr-2" strokeWidth={3} /> New Session
        </Button>
      </div>
    </div>
    <Activity className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-800 opacity-50 rotate-12" />
  </header>
);