import React, { useState } from 'react';
import { X, Loader2, Calendar, DollarSign, Users, Plus } from 'lucide-react';
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
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden animate-in zoom-in-95">
        
        <div className="p-6 border-b-4 border-slate-900 bg-sky-400 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-900">
            <Plus size={24} strokeWidth={3} />
            <h2 className="font-black uppercase italic text-xl">Create Blank Session</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24} className="text-slate-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Name</label>
            <input 
              autoFocus
              className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Winter Term 2026"
              required
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
              <input 
                type="date"
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
              <input 
                type="date"
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Config Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Per Class ($)</label>
              <input 
                type="number"
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
                value={formData.pricePerClass}
                onChange={(e) => setFormData({ ...formData, pricePerClass: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Max Capacity</label>
              <input 
                type="number"
                className="w-full p-4 rounded-2xl border-4 border-slate-100 focus:border-sky-400 outline-none font-bold"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 p-4 rounded-2xl font-black uppercase text-xs border-4 border-slate-100 text-slate-400">
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-4 bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(56,189,248,1)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Create Session'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};