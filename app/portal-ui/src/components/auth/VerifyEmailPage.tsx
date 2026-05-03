// apps/web/src/pages/auth/VerifyEmailPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notification.store';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const showNotification = useNotificationStore((state) => state.show);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      try {
        // ✅ CAPTURE RESPONSE
        const { data } = await api.get(`/v1/auth/verify-email`, {
          params: { token },
        });

        // ✅ SAVE AUTH (auto login)
        setAuth(data.user, data.access_token);

        setStatus('success');

        showNotification(
          "Account verified! Redirecting to your dashboard...",
          "success"
        );

        // ✅ AUTO REDIRECT (clean UX)
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (error) {
        setStatus('error');
        showNotification(
          "Verification failed. Link may be expired.",
          "error"
        );
      }
    };

    verifyToken();
  }, [searchParams, navigate, setAuth, showNotification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBE2] p-6 font-medium">
      <div className="max-w-md w-full bg-white border-4 border-slate-900 p-10 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#0f172a] text-center space-y-6">

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic">
              Calibrating Compass...
            </h1>
            <p className="font-bold text-slate-500 text-sm uppercase tracking-widest">
              Checking your credentials
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center text-emerald-500 bg-emerald-50 w-24 h-24 mx-auto rounded-3xl border-4 border-slate-900 items-center shadow-[4px_4px_0px_0px_#0f172a]">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 uppercase italic">
                Ready to Explore!
              </h1>
              <p className="font-bold text-slate-500 text-sm">
                Taking you to your dashboard...
              </p>
            </div>

            {/* Optional manual fallback */}
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full py-6 bg-emerald-500 text-white border-4 border-slate-900 rounded-2xl font-black shadow-[6px_6px_0px_0px_#0f172a]"
            >
              GO NOW →
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in shake duration-500">
            <div className="flex justify-center text-rose-500 bg-rose-50 w-24 h-24 mx-auto rounded-3xl border-4 border-slate-900 items-center shadow-[4px_4px_0px_0px_#0f172a]">
              <XCircle size={48} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 uppercase italic">
                Signal Lost!
              </h1>
              <p className="font-bold text-slate-500 text-sm">
                This link is invalid or expired.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-2xl font-black"
            >
              BACK TO LOGIN
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};