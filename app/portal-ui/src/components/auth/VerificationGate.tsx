// apps/web/src/components/auth/VerificationGate.tsx
import { MailQuestion, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VerificationGateProps {
  email?: string;
  onResend: () => Promise<void>;
  onBack: () => void;
  isResending: boolean;
  cooldown: number; // 👈 NEW: Pass the countdown value (seconds)
}

export const VerificationGate = ({ email, onResend, onBack, isResending, cooldown }: VerificationGateProps) => {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Icon Area */}
      <div className="mx-auto w-24 h-24 bg-amber-100 border-4 border-slate-900 rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_#0f172a] relative">
        <MailQuestion size={40} className="text-slate-900" />
        <div className="absolute -bottom-2 -right-2 p-2 bg-white border-2 border-slate-900 rounded-full">
          <Loader2 size={12} className="animate-spin text-sky-500" />
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tight">
          Waiting for Echo...
        </h1>
        <p className="text-slate-500 font-bold max-w-sm mx-auto">
          We sent a verification link to <span className="text-slate-900 underline">{email}</span>. 
          Once you click it, this page will unlock!
        </p>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 w-full max-w-sm">
          <Button 
            onClick={onBack}
            className="flex-1 bg-slate-100 text-slate-900 border-2 border-slate-900 font-black"
          >
            BACK
          </Button>
          
          <Button 
            onClick={onResend}
            // 🏛️ UPDATE: Disable button if either sending OR cooling down
            disabled={isResending || cooldown > 0} 
            className="flex-1 bg-sky-400 text-white border-4 border-slate-900 font-black shadow-[4px_4px_0px_0px_#0f172a] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* 🏛️ UPDATE: Visual feedback for the cooldown */}
            {isResending ? (
              'SENDING...'
            ) : cooldown > 0 ? (
              `WAIT ${cooldown}s` 
            ) : (
              <><Send size={16} /> RESEND</>
            )}
          </Button>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">
          {cooldown > 0 ? 'Cooling down...' : 'Searching for verification signal...'}
        </p>
      </div>
    </div>
  );
};