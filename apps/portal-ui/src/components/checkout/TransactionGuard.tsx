import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const TransactionGuard = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/v1/registration/verify?ref=${reference}`);
        if (res.ok) setStatus('success');
        else setStatus('error');
      } catch {
        setStatus('error');
      }
    };
    if (reference) verify();
  }, [reference]);

  if (status === 'verifying') return <div className="p-20 text-center font-black animate-pulse">Verifying Payment...</div>;
  if (status === 'error') return <div className="p-20 text-center text-rose-500 font-bold">Verification Failed. Please contact support.</div>;
  
  return <>{children}</>;
};