import React, { useState } from 'react';
import { Copy, X, Loader2 } from 'lucide-react';

interface CloneSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; year: number }) => Promise<void>;
  sourceSessionName: string;
}

export const CloneSessionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  sourceSessionName 
}: CloneSessionModalProps) => {
  const [name, setName] = useState(`${sourceSessionName} (Copy)`);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({ name, year });
      onClose();
    } catch (error) {
      console.error('Cloning failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <div className="p-6 border-b-4 border-slate-900 bg-sky-400 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Copy className="text-slate-900" size={24} />
            <h2 className="font-black uppercase italic text-xl text-slate-900">Clone Session</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X size={24} className="text-slate-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Name</label>
            <input 
              autoFocus
              className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Year</label>
            <input 
              type="number"
              className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 p-4 rounded-2xl font-black uppercase text-xs border-4 border-slate-100 text-slate-400">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-4 rounded-2xl font-black uppercase text-xs bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(56,189,248,1)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Clone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};