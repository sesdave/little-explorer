// apps/web/src/components/dashboard/EnrollmentButton.tsx
import { Sparkles, CreditCard } from 'lucide-react';

interface EnrollmentButtonProps {
  onClick: () => void;
  variant?: 'enroll' | 'payment';
}

export const EnrollmentButton = ({
  onClick,
  variant = 'enroll',
}: EnrollmentButtonProps) => {
  const isPayment = variant === 'payment';

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 
        text-white px-6 py-3 rounded-2xl 
        border-4 border-slate-900 
        shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-none transition-all duration-200

        ${isPayment ? 'bg-emerald-500' : 'bg-rose-400'}
      `}
    >
      {/* Pulse Dot */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>

      <span className="font-black text-[11px] uppercase tracking-wider italic">
        {isPayment ? 'Make Payment' : 'Enroll Now'}
      </span>

      {isPayment ? (
        <CreditCard size={16} className="group-hover:rotate-12 transition-transform duration-300" />
      ) : (
        <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
};