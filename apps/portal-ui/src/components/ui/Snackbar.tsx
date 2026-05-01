import { useNotificationStore, NotificationType } from '@/store/notification.store';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Snackbar = () => {
  const { message, type, hide } = useNotificationStore();

  if (!message) return null;

  // Record ensures that all types ('success', 'error', 'info') are handled
  const styles: Record<NotificationType, string> = {
    success: "bg-emerald-400 border-slate-900 text-white",
    error: "bg-rose-500 border-slate-900 text-white",
    info: "bg-sky-400 border-slate-900 text-white",
  };

  const icons: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle2 size={24} strokeWidth={3} />,
    error: <AlertCircle size={24} strokeWidth={3} />,
    info: <Info size={24} strokeWidth={3} />,
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`
        flex items-center gap-4 px-6 py-4 rounded-2xl border-4 
        shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] min-w-[320px]
        ${styles[type]}
      `}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        
        <p className="font-black text-lg flex-1 leading-tight tracking-tight">
          {message}
        </p>
        
        <button 
          onClick={hide} 
          className="p-1 hover:bg-black/10 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};