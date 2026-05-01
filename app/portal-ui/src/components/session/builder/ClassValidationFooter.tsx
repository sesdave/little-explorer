import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { ClassEntity } from '@mle/types';

interface FooterProps {
  classes: ClassEntity[];
}

export const ClassValidationFooter = ({ classes }: FooterProps) => {
  // 1. Logic: Aggregate all errors in the current draft
  const errors = [];
  
  const hasEmptyNames = classes.some(c => !c.name.trim());
  const hasAgeConflicts = classes.some(c => c.minAge >= c.maxAge);
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);

  if (hasEmptyNames) errors.push("Some classes are missing names.");
  if (hasAgeConflicts) errors.push("Minimum age cannot be greater than or equal to maximum age.");
  
  const isValid = errors.length === 0;

  return (
    <div className={`
      mt-8 p-6 rounded-[2rem] border-4 border-slate-900 transition-all duration-300
      ${isValid ? 'bg-emerald-50 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]' : 'bg-rose-50 shadow-[8px_8px_0px_0px_rgba(244,63,94,1)]'}
    `}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Status Icon & Messages */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${isValid ? 'bg-emerald-400' : 'bg-rose-400'}`}>
            {isValid ? <CheckCircle2 className="text-slate-900" /> : <AlertTriangle className="text-slate-900" />}
          </div>
          
          <div>
            <h4 className="font-black uppercase italic text-slate-900 leading-tight">
              {isValid ? 'Draft Integrity Verified' : 'Action Required'}
            </h4>
            <div className="mt-1">
              {isValid ? (
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Ready to sync. Total capacity across all sections: {totalCapacity} students.
                </p>
              ) : (
                <ul className="space-y-1">
                  {errors.map((err, i) => (
                    <li key={i} className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                      • {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Insight (Design #8 vibe) */}
        <div className="bg-white/50 border-2 border-slate-900/10 p-4 rounded-2xl hidden lg:block">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-sky-500" />
            <span className="text-[10px] font-black uppercase text-slate-400">Inventory Insight</span>
          </div>
          <p className="text-[10px] font-bold text-slate-600 max-w-[200px] leading-relaxed">
            You currently have <span className="text-slate-900 font-black">{classes.length}</span> class sections defined for this session scope.
          </p>
        </div>

      </div>
    </div>
  );
};