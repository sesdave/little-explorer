export const PaginationBtn = ({ icon, disabled, onClick }: { 
  icon: React.ReactNode; 
  disabled: boolean; 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-3 border-4 border-slate-900 rounded-xl transition-all ${
      disabled 
        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
        : 'bg-white text-slate-900 hover:bg-sky-400 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none'
    }`}
  >
    {icon}
  </button>
);