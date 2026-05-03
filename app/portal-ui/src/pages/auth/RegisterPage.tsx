import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { VerificationGate } from '@/components/auth/VerificationGate';
import api from '@/services/api';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 const { user, refreshUser } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!user?.email) return;
      if (cooldown > 0) return; // Block if cooling down
      
      await api.post('/auth/resend-verification', { email: user.email });
      
      setCooldown(60); // Set a 60-second wait
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
   };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const showNotification = useNotificationStore.getState().show;
    setIsLoading(true);
    
    try {
      // NOTE: Ensure your NestJS backend has app.enableCors() enabled!
      const { data } = await api.post('/v1/auth/register', { name, email, password, role: 'PARENT' });

      setAuth(data.user, data.access_token);

      showNotification("Adventure started! Welcome.", "success");
        // NestJS typically returns { user, access_token }
      
      // const response = await fetch('http://localhost:4000/api/v1/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     name, 
      //     email, 
      //     password,
      //     role: 'PARENT' 
      //   }),
      // });

     // const data = await response.json();
      //console.log("resp data", response)

      // if (response.ok) {
      //   showNotification("Adventure started! Welcome.", "success");
      //   // NestJS typically returns { user, access_token }
      //   setAuth(data.user, data.access_token);
      //   // navigate('/dashboard');
      // } else {
      //  showNotification(data.message || "Registration failed.", "error");
      //  // alert(data.message || "Registration failed. Try a different trail!");
      // }
    } catch (error: any) {
      console.error("Registration failed", error);

      const message =
        error.response?.data?.message ||
        "Registration failed. Try a different trail!";

      showNotification(message, "error");
      // console.error("Connection failed", error);
      // alert("Could not connect to the adventure server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

   if (user && !user.isEmailVerified){
    return (
      <VerificationGate 
        email={user?.email}
        cooldown={cooldown}
        isResending={isResending}
        onBack={() => navigate('/login')}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBE2] flex items-center justify-center p-4 md:p-10 font-medium">
      {/* Main Card */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        
        {/* Left Side: Brand Identity (Emerald) */}
        <div className="bg-emerald-500 p-8 md:p-10 flex flex-col justify-center items-center text-white border-b-4 md:border-b-0 md:border-r-4 border-slate-900">
          <div className="mb-6 rotate-3 bg-white p-5 rounded-3xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-emerald-600">
            <Zap size={48} strokeWidth={3} fill="currentColor" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic text-center tracking-tighter leading-none">
            Join the <br /> Journey
          </h1>
          <p className="mt-4 font-bold text-emerald-900 text-center text-sm md:text-base opacity-90 max-w-[220px]">
            Create an account to start your family's next adventure!
          </p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight">
            Create an Account
          </h2>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <Input 
              label="Parent/Guardian Full Name" 
              type="text" 
              placeholder="Alex Johnson" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="parent@adventure.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            
            <Input 
              label="Choose a Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />

            <Button 
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400"
            >
              {isLoading ? "Preparing Journey..." : "Start Exploring →"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-sky-500 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};