export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-400 text-white',
    partial: 'bg-amber-400 text-slate-900',
    unpaid: 'bg-rose-400 text-white',
    default: 'bg-slate-200 text-slate-500'
  };

  return (
    <span className={`px-4 py-1.5 rounded-xl border-2 border-slate-900 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_#0f172a] ${styles[status] || styles.default}`}>
      {status || 'Unknown'}
    </span>
  );
}