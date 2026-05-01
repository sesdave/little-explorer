import { useAdminStore } from '@/store/admin.store';

export const SessionManager = () => {
  const { sessions } = useAdminStore();

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black">Seasonal Sessions</h2>
        <button className="bg-sky-500 text-white px-6 py-2 rounded-xl font-bold">+ New Session</button>
      </div>
      
      <div className="space-y-4">
        {sessions.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-400 uppercase font-black">{s.startDate} - {s.endDate}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200'}`}>
              {s.active ? 'Active' : 'Draft'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};