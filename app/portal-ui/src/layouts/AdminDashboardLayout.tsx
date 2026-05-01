import { ReactNode } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Activity 
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
export const AdminDashboardLayout = () => {
  const { logout } = useAuthStore(); // 🟢 Pull logout from store
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout(); // 🟢 Store handles clearing localStorage & state
    navigate('/login');
  };
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. Sidebar Container */}
      <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col border-r-8 border-slate-900 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.1)]">
        
        {/* Brand/Logo Section */}
        <div className="mb-12 relative">
          <div className="flex items-center gap-2 z-10 relative">
            <div className="bg-sky-400 p-2 border-2 border-white rounded-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <Activity size={20} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              MLE <span className="text-sky-400 text-sm not-italic font-bold">Admin</span>
            </h1>
          </div>
          {/* Decorative background element */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-4">
          <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="Overview" end />
          <NavItem to="/admin/sessions" icon={<Calendar size={20} />} label="Sessions" />
          <NavItem to="/admin/explorers" icon={<Users size={20} />} label="Explorers" />
          <NavItem to="/admin/revenue" icon={<BarChart3 size={20} />} label="Revenue" />
        </nav>

        {/* Footer Navigation (Settings/Profile) */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full p-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-rose-400 transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Stage */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header/Breadcrumb area if needed */}
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          {/* 🚀 Dynamic Page Content Renders Here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENT: NavItem ---

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
}

const NavItem = ({ to, icon, label, end }: NavItemProps) => (
  <NavLink 
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] transition-all border-4
      ${isActive 
        ? 'bg-sky-400 text-slate-900 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] translate-x-1 -translate-y-1' 
        : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50'}
    `}
  >
    <span className="transition-transform duration-300 group-hover:scale-110">
      {icon}
    </span>
    <span>{label}</span>
  </NavLink>
);