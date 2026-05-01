import React from 'react';
import { Save, RefreshCw, ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export const ClassBuilderHeader = ({ onSave, onReset, isSaving, hasChanges }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
      <div className="space-y-2">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate('/admin/sessions')}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-colors group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Sessions
        </button>
        
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black uppercase italic text-slate-900 tracking-tighter">
            Class Inventory
          </h2>
          {hasChanges && (
            <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-bounce">
              Unsaved Changes
            </span>
          )}
        </div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
          Configuration Scope: <span className="text-slate-900 italic">Global Draft Mode</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Reset Action */}
        <button 
          onClick={onReset}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2 font-black uppercase text-xs text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-all px-4"
        >
          <RefreshCw size={16} className={isSaving ? 'animate-spin' : ''} /> 
          Discard Draft
        </button>

        {/* The "Big" Save Action */}
        <button 
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`
            relative flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
            border-4 border-slate-900 
            ${hasChanges && !isSaving 
              ? 'bg-emerald-400 text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-none' 
              : 'bg-slate-100 text-slate-300 shadow-none opacity-80 cursor-not-allowed'}
          `}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} /> Syncing...
            </span>
          ) : (
            <>
              {hasChanges ? <Save size={20} /> : <Check size={20} />}
              {hasChanges ? 'Save All Changes' : 'System Synced'}
            </>
          )}
        </button>
      </div>
    </header>
  );
};