import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Sessions', path: '/admin/sessions', icon: <Calendar size={20} /> },
    { label: 'Explorers', path: '/admin/users', icon: <Users size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r-4 border-slate-900 p-6">
      {/* Brand Logo */}
      <div className="mb-12 px-2">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
          Admin<span className="text-sky-500">Core</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all border-2
                ${isActive 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(56,189,248,1)]' 
                  : 'text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-900'}
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="pt-6 border-t-2 border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 font-black uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors rounded-xl">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};