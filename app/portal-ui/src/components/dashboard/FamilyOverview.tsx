// apps/web/src/components/dashboard/FamilyOverview.tsx

import { useFamilyStore } from '@/store/family.store';
import { AddChildModal } from './AddChildModal';
import { Check, Plus } from 'lucide-react';
import { calculateAge } from '@/utils/date-utils'; 
import { useEnrollmentStatus } from '@/hooks/use-enrollmentStatus';

interface FamilyOverviewProps {
  session: any;
  pendingApplication: any;
}

export const FamilyOverview = ({ session, pendingApplication }: FamilyOverviewProps) => {
  const { children } = useFamilyStore();
  
  // Use the hook with props passed from DashboardPage
  const { childStatusMap } = useEnrollmentStatus({
    children,
    session,
    pendingApplication
  });

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">
        Child Profiles
      </h2>
      
      {/* 
          DESKTOP FIX: 'lg:flex lg:flex-wrap' ensures no overlap on desktop 
          when the sidebar is present. 
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-x-10 gap-y-12">
        {children.map((child, index) => {
          const status = childStatusMap[child.id];
          const isEnrolled = status === 'CONFIRMED';
          
          return (
            <div key={child.id} className="flex flex-col items-center group cursor-pointer">
              <div className="relative w-28 h-28 mb-3">
                {/* YOUR ORIGINAL DESIGN */}
                <div className={`w-full h-full rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] group-hover:-translate-y-1 transition-all duration-300
                  ${isEnrolled ? 'bg-white' : 'bg-slate-200 opacity-80'}`}
                >
                  {child.photoUrl ? (
                    <img 
                      src={child.photoUrl} 
                      className={`w-full h-full object-cover ${!isEnrolled && 'grayscale'}`} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-400">
                      {child.firstName[0]}
                    </div>
                  )}
                </div>

                {/* GREEN CIRCLE FOR ENROLLED + TOOLTIP */}
                <div 
                  title={isEnrolled ? "Enrolled" : "Not Enrolled"}
                  className={`absolute -top-1 -right-1 border-4 border-slate-900 rounded-full p-1 shadow-sm z-10
                    ${isEnrolled ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}
                >
                  {isEnrolled ? (
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
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                  {isEnrolled ? 'Enrolled' : `Age ${calculateAge(child.dob)}`}
                </p>
              </div>
            </div>
          );
        })}
        
        {/* ADD CHILD BUTTON - DESIGN PRESERVED */}
        <AddChildModal trigger={
          <button className="flex flex-col items-center group">
            <div className="w-28 h-28 mb-3 rounded-[2.5rem] border-4 border-dashed border-slate-300 flex items-center justify-center text-slate-300 group-hover:border-sky-400 group-hover:bg-sky-50 transition-all">
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