import { useFamilyStore } from '@/store/family.store';
import { AddChildModal } from './AddChildModal';
import { Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '@/utils/date-utils'; 

// Vibrant colors for the initials when registered
const FALLBACK_TEXT_COLORS = [
  'text-rose-500',
  'text-sky-500',
  'text-amber-500',
  'text-emerald-500',
  'text-indigo-500',
  'text-orange-500'
];

export const FamilyOverview = () => {
  const navigate = useNavigate();
  const { children } = useFamilyStore();
  
  // Use 'registrations' for confirmed DB records
  const registrations = useFamilyStore((state) => state.registrations || []);
  const registrationIsOpen = true; 

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">
        Child Profiles
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {children.map((child, index) => {
          const isRegistered = registrations.some(reg => reg.childId === child.id);
          const activeTextColor = FALLBACK_TEXT_COLORS[index % FALLBACK_TEXT_COLORS.length];

          return (
            <div 
              key={child.id} 
              // One click to rule them all: takes them to the bulk selection page
              // onClick={() => navigate('/dashboard/register')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-28 h-28 mb-3">
                <div className={`w-full h-full rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] group-hover:-translate-y-1 transition-all duration-300
                  ${isRegistered 
                    ? 'bg-white' 
                    : 'bg-slate-200 opacity-80' // Gray background for unregistered
                  }`}
                >
                  {child.photoUrl ? (
                    <img 
                      src={child.photoUrl} 
                      alt={child.firstName} 
                      className={`w-full h-full object-cover ${!isRegistered && 'grayscale'}`} 
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-4xl font-black uppercase
                      ${isRegistered ? activeTextColor : 'text-slate-400'}
                    `}>
                      {child.firstName[0]}
                    </div>
                  )}
                </div>

                <div className={`absolute -top-1 -right-1 border-4 border-slate-900 rounded-full p-1 shadow-sm transition-transform group-hover:scale-110
                  ${isRegistered ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}>
                  {isRegistered ? (
                    <Check size={14} className="text-white" strokeWidth={4} />
                  ) : (
                    <Plus size={14} className="text-white" strokeWidth={4} />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="font-black text-slate-900 text-lg leading-tight uppercase">
                  {child.firstName}
                </p>
                
                {/* {!isRegistered && registrationIsOpen ? (
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Enroll Now
                  </span>
                ) : ( */}
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                    (Age {calculateAge(child.dob)})
                  </p>
                {/* )} */}
              </div>
            </div>
          );
        })}
        
        <AddChildModal trigger={
          <button className="flex flex-col items-center group">
            <div className="w-28 h-28 mb-3 rounded-[2.5rem] border-4 border-dashed border-slate-300 flex items-center justify-center text-slate-300 group-hover:border-sky-400 group-hover:text-sky-400 group-hover:bg-sky-50 transition-all duration-300">
              <Plus size={40} strokeWidth={4} />
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Add Child
            </span>
          </button>
        } />
      </div>
    </section>
  );
};