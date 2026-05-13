import React, { useState } from 'react';
import { X, Loader2, Calendar, DollarSign, Users, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

export const CreateSessionModal = ({ isOpen, onClose, onConfirm }: CreateSessionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    theme: '', // Text field for custom theme names
    startDate: '',
    endDate: '',
    pricePerClass: 25,
    maxCapacity: 20,
    status: 'DRAFT',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-6 border-b-4 border-slate-900 bg-sky-400 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-900">
            <Plus size={24} strokeWidth={3} />
            <h2 className="font-black uppercase italic text-xl tracking-tight">Create New Session</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-900" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* TOP ROW: SESSION NAME & THEME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Session Name
              </label>
              <input 
                autoFocus
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-slate-900 outline-none font-bold transition-all placeholder:text-slate-300"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Winter Term"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                <Palette size={12} strokeWidth={3} /> Session Theme
              </label>
              <input 
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-rose-400 outline-none font-bold transition-all placeholder:text-slate-300"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g. Jurassic Adventure"
                required
              />
            </div>
          </div>

          {/* DATES GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Start Date
              </label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-slate-900 outline-none font-bold bg-white"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                End Date
              </label>
              <input 
                type="date"
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-slate-900 outline-none font-bold bg-white"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* CONFIG GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Price Per Class
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
                <input 
                  type="number"
                  className="w-full p-4 pl-8 rounded-2xl border-4 border-slate-100 focus:border-slate-900 outline-none font-bold"
                  value={formData.pricePerClass}
                  onChange={(e) => setFormData({ ...formData, pricePerClass: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Max Capacity
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number"
                  className="w-full p-4 pl-12 rounded-2xl border-4 border-slate-100 focus:border-slate-900 outline-none font-bold"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 p-4 rounded-2xl font-black uppercase text-xs border-4 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"
            >
              Discard
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-4 bg-slate-900 text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(56,189,248,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="font-black uppercase tracking-wider">Launch Session →</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};