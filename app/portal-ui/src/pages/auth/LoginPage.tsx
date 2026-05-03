import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import api from '@/services/api';
import { VerificationGate } from '@/components/auth/VerificationGate';

// Simplified Neo-brutalist Logo
const WavingExplorer = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 text-sky-900 opacity-90">
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M70 40 L80 30 M70 40 L80 50" stroke="currentColor" strokeWidth="4" />
    <rect x="35" y="45" width="30" height="35" rx="5" stroke="currentColor" strokeWidth="4" fill="currentColor" />
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const showNotification = useNotificationStore((state) => state.show);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuthStore();
   const [pendingUser, setPendingUser] = useState<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     // 1. Hit the centralized API
  //     const { data } = await api.post('/v1/auth/login', { email, password });

  //     // 2. Persist to Zustand (matches your AuthState interface)
  //     // Note: mapping backend 'access_token' to store 'token'
  //     setAuth(data.user, data.access_token);
      
  //     showNotification(`Welcome back, ${data.user.name}!`, "success");

  //     // 3. Intelligent Redirect based on Role
  //     if (data.user.role === 'ADMIN') {
  //       navigate('/admin');
  //     } else {
  //       navigate('/dashboard');
  //     }
  //   } catch (error: any) {
  //     // Fallback error message if the backend doesn't provide one
  //     const message = error.response?.data?.message || "Oops! Wrong password for this adventure.";
  //     showNotification(message, "error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const { data } = await api.post('/v1/auth/login', { email, password });

        const user = data.user;

        // 🚨 BLOCK UNVERIFIED USERS
        if (!user.isEmailVerified) {
          setPendingUser(user);
          setShowVerification(true);

          useNotificationStore
            .getState()
            .show("Please verify your email before continuing", "warning");

          return;
        }

        // ✅ Normal login
        setAuth(user, data.access_token);

        useNotificationStore
          .getState()
          .show(`Welcome back, ${user.name}!`, "success");

        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');

      } catch (error: any) {
        const message =
          error.response?.data?.message || "Invalid login credentials";

        useNotificationStore.getState().show(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
  return (
    <div className="min-h-screen bg-[#FFFBE2] flex items-center justify-center p-4 md:p-10 font-medium">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        
        {/* Left Side: Brand Identity */}
        <div className="bg-sky-400 p-8 md:p-10 flex flex-col justify-center items-center text-white border-b-4 md:border-b-0 md:border-r-4 border-slate-900">
          <div className="mb-6 rotate-3 bg-white p-4 rounded-3xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
               <WavingExplorer />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic text-center tracking-tighter leading-none uppercase">
            My Little <br /> Explorers
          </h1>
          <p className="mt-4 font-bold text-sky-900 text-center text-sm md:text-base opacity-90 max-w-[200px]">
            Adventure awaits!
          </p>
        </div>

        {/* Right Side: Form Content */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight uppercase">
            Welcome Back!
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="parent@adventure.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <div className="space-y-1">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="text-[10px] font-black text-sky-600 hover:underline uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Checking map..." : "Start Exploring →"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            New here? <Link to="/register" className="text-emerald-500 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};