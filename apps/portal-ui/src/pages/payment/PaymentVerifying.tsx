// apps/web/src/pages/payment/PaymentVerifying.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

export const PaymentVerifying = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'delay'>('verifying');
  
  const reference = searchParams.get('reference');

  useEffect(() => {
    let pollCount = 0;
    const interval = setInterval(async () => {
      try {
        // 🏛️ Check the payment status via our backend
        const response = await api.get(`/v1/payments/verify/${reference}`);
        
        if (response.data.status === 'SUCCESSFUL') {
          setStatus('success');
          clearInterval(interval);
          // Wait 2 seconds so they see the success animation
          setTimeout(() => navigate('/dashboard?payment=success'), 2000);
        }
      } catch (e) {
        console.error("Polling error", e);
      }

      pollCount++;
      if (pollCount > 15) { // If it takes > 30 seconds, tell them it's taking a while
        setStatus('delay');
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [reference, navigate]);

  return (
    <div className="max-w-md mx-auto p-12 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      {status === 'verifying' && (
        <>
          <Loader2 className="w-16 h-16 text-sky-500 animate-spin" strokeWidth={3} />
          <h2 className="text-3xl font-black uppercase italic text-slate-900">Verifying Payment...</h2>
          <p className="font-bold text-slate-500 uppercase text-sm">Talking to Paystack. Don't close this window!</p>
        </>
      )}

      {status === 'success' && (
        <div className="animate-in zoom-in duration-300">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" strokeWidth={3} />
          <h2 className="text-3xl font-black uppercase italic text-slate-900 mt-4">Spots Secured!</h2>
          <p className="font-bold text-slate-500 uppercase text-sm">Welcome to the session, Explorer.</p>
        </div>
      )}

      {status === 'delay' && (
        <>
          <h2 className="text-3xl font-black uppercase italic text-slate-900 text-rose-500">Still Processing...</h2>
          <p className="font-bold text-slate-500 uppercase text-sm">
            The banks are taking their time! You can safely close this page; we'll email you once it's confirmed.
          </p>
          <button onClick={() => navigate('/dashboard')} className="font-black underline uppercase text-sky-500">Go to Dashboard</button>
        </>
      )}
    </div>
  );
};