import { Sparkles, CreditCard, Loader2 } from 'lucide-react';

interface EnrollmentButtonProps {
  onClick: () => void;
  // 1. Added 'processing' to the type definition
  variant?: 'enroll' | 'payment' | 'processing'; 
}

export const EnrollmentButton = ({
  onClick,
  variant = 'enroll',
}: EnrollmentButtonProps) => {
  const isPayment = variant === 'payment';
  const isProcessing = variant === 'processing';

  return (
    <button
      onClick={onClick}
      // 2. Disable the button if processing
      disabled={isProcessing} 
      className={`
        group relative flex items-center gap-3 
        text-white px-6 py-3 rounded-2xl 
        border-4 border-slate-900 
        transition-all duration-200
        
        /* 3. Handle colors based on variant */
        ${isProcessing 
          ? 'bg-amber-400 cursor-wait' 
          : isPayment 
            ? 'bg-emerald-500 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none' 
            : 'bg-rose-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
        }
      `}
    >
      {/* 4. Logic for the Icon/Indicator */}
      {isProcessing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      )}

      <span className="font-black text-[11px] uppercase tracking-wider italic">
        {isProcessing 
          ? 'Verifying Payment...' 
          : isPayment 
            ? 'Complete Payment' 
            : 'Enroll Now'
        }
      </span>

      {!isProcessing && (
        isPayment ? (
          <CreditCard size={16} className="group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
        )
      )}
    </button>
  );
};