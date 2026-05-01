import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, User as UserIcon } from 'lucide-react';

export const ParentPortalLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-800 font-medium">
      {/* Main Navigation Header */}
      <header className="h-24 bg-white/80 backdrop-blur-md border-b-4 border-slate-50 sticky top-0 z-50 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          
          {/* Logo - Returns to Dashboard */}
          <Link 
            to="/" 
            className="font-black text-3xl text-sky-500 tracking-tight italic hover:scale-105 transition-transform"
          >
            Little Explorers
          </Link>

          {/* User Profile Area */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Parent Portal
              </p>
              <p className="text-sm font-bold text-slate-700">
                {user?.name || 'Explorer Parent'}
              </p>
            </div>

            {/* Profile Avatar & Dropdown Placeholder */}
            <div className="group relative">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-sky-600 font-bold cursor-pointer group-hover:bg-sky-200 transition-colors">
                {user?.name?.[0] || <UserIcon size={20} />}
              </div>

              {/* Simple Tooltip/Menu on Hover */}
              <div className="absolute right-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] min-w-[160px]">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Surface */}
      <main className="max-w-5xl mx-auto p-6 pb-32 lg:pb-12 animate-in fade-in duration-500">
        {/* This is where your DashboardPage, RegistrationPage, 
            and other child routes will appear! 
        */}
        <Outlet />
      </main>

      {/* Subtle Mobile Support Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/80 to-transparent pointer-events-none">
        {/* Future home for a bottom navigation bar if needed */}
      </div>
    </div>
  );
};