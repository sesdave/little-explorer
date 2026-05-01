import React from 'react';
import { SessionStatus } from '@mle/types';

interface BadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

/**
 * A reusable, high-contrast badge for Session Status.
 * Centralizes the color logic for system states.
 */
export const SessionStatusBadge = ({ status, size = 'md' }: BadgeProps) => {
  
  // Define color mapping based on the SessionStatus enum
  const getStatusStyles = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.PLANNING:
        return 'bg-amber-400 text-slate-900 border-amber-500';
      case SessionStatus.REGISTRATION:
        return 'bg-emerald-400 text-slate-900 border-emerald-500';
      case SessionStatus.ONGOING:
        return 'bg-sky-400 text-slate-900 border-sky-500';
      case SessionStatus.COMPLETED:
        return 'bg-slate-200 text-slate-500 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-4 py-1 text-[10px]';

  return (
    <div className={`
      ${getStatusStyles(status)}
      ${sizeClasses}
      inline-block rounded-full border-2 border-slate-900 
      font-black uppercase tracking-widest leading-none
      shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
    `}>
      {status}
    </div>
  );
};