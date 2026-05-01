import { ChevronRight, CalendarPlus, Activity, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🏛️ Accepting pendingCount as a prop from the Parent Page
export const QuickActions = ({ pendingCount }: { pendingCount?: number }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] sticky top-8">
      <h2 className="text-xl font-black uppercase mb-6 italic tracking-tight text-sky-400">
        Quick Actions
      </h2>
      <div className="space-y-4">
         <AdminActionButton 
            label="Manage Sessions" 
            icon={<CalendarPlus size={16} />}
            onClick={() => navigate('/admin/sessions')} 
         />
         
         {/* 🚀 Now using the real count and navigating to registrations */}
         <AdminActionButton 
            label="Review Registrations" 
            count={pendingCount} 
            onClick={() => navigate('/admin/registrations')}
         />

         {/* 🔍 Shortcut to the Explorers Directory we just planned */}
         <AdminActionButton 
            label="Search Explorers" 
            icon={<Search size={16} />} 
            onClick={() => navigate('/admin/explorers')}
         />

         <AdminActionButton 
            label="Broadcast Message" 
            icon={<Activity size={16} />} 
         />
      </div>
    </div>
  );
};

interface AdminActionButtonProps {
  label: string;
  count?: number;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const AdminActionButton = ({ label, count, onClick, icon }: AdminActionButtonProps) => (
  <button 
    onClick={onClick}
    className="w-full flex justify-between items-center p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 hover:border-sky-400 hover:bg-slate-900 transition-all group text-left active:scale-[0.98]"
  >
    <div className="flex items-center gap-3">
      {icon && <span className="text-slate-500 group-hover:text-sky-400 transition-colors">{icon}</span>}
      <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </div>
    
    {/* 🏛️ Render count badge if > 0, otherwise show chevron */}
    {count && count > 0 ? (
      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {count}
      </span>
    ) : (
      <ChevronRight size={16} className="text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-1" />
    )}
  </button>
);