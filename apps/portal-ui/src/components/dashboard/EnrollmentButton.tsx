// apps/web/src/components/dashboard/EnrollmentButton.tsx
import { Sparkles } from 'lucide-react';

interface EnrollmentButtonProps {
  onClick: () => void;
}

export const EnrollmentButton = ({ onClick }: EnrollmentButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        group relative flex items-center gap-3 
        bg-rose-400 text-white 
        px-6 py-3 rounded-2xl 
        border-4 border-slate-900 
        shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-none transition-all duration-200
      "
    >
      {/* 🏛️ The Pulse Notification Dot */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>

      <span className="font-black text-[11px] uppercase tracking-wider italic">
        Enroll Now
      </span>

      <Sparkles 
        size={16} 
        className="group-hover:rotate-12 transition-transform duration-300" 
      />
    </button>
  );
};