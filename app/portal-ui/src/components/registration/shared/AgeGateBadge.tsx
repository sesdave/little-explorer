// src/components/registration/shared/AgeGateBadge.tsx
import React from 'react';

interface Props {
  minAge: number;
  maxAge: number;
  currentAge?: number;
}

export const AgeGateBadge: React.FC<Props> = ({ minAge, maxAge, currentAge }) => {
  const isEligible = currentAge !== undefined ? (currentAge >= minAge && currentAge <= maxAge) : true;

  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border
      ${isEligible 
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
        : 'bg-rose-50 text-rose-600 border-rose-100'
      }`}>
      {minAge}-{maxAge} Years {currentAge !== undefined && !isEligible && '• Not Eligible'}
    </div>
  );
};