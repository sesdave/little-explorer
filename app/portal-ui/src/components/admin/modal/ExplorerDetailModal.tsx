import { X, Calendar, User, Mail, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const ExplorerDetailModal = ({ child, onClose }: { child: any; onClose: () => void }) => {
  if (!child) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border-4 border-slate-900 rounded-[3rem] shadow-[12px_12px_0px_0px_#0f172a] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-amber-300 border-b-4 border-slate-900 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Explorer Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT: PHOTO & BASIC INFO */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-[6px_6px_0px_0px_#0f172a] bg-slate-100">
                {child.photoUrl ? (
                  <img src={child.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-black text-slate-300">
                    {child.firstName[0]}
                  </div>
                )}
              </div>
              <div className={`px-4 py-1 rounded-full border-2 border-slate-900 text-[10px] font-black uppercase ${child.paymentStatus === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                {child.paymentStatus}
              </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-4xl font-black text-slate-900 uppercase leading-none">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-slate-400 font-bold uppercase text-xs mt-2 tracking-widest">
                  Explorer Details
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={<Calendar size={16}/>} label="Birth Date" value={format(new Date(child.dob), 'PP')} />
                <DetailItem icon={<User size={16}/>} label="Parent" value={child.parent.name} />
                <DetailItem icon={<Mail size={16}/>} label="Email" value={child.parent.email} />
                <DetailItem icon={<CreditCard size={16}/>} label="Enrolled" value={child.registrations[0] ? format(new Date(child.registrations[0].createdAt), 'PP') : 'Not Enrolled'} />
              </div>
            </div>
          </div>
          
          {/* FOOTER ACTION */}
          <div className="mt-10 flex gap-4">
            <button className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-widest">
              Edit Explorer
            </button>
            <button onClick={onClose} className="px-8 font-black border-4 border-slate-900 rounded-2xl uppercase">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-sky-500">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{label}</p>
      <p className="font-bold text-slate-900 break-all">{value}</p>
    </div>
  </div>
);