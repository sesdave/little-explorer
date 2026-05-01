import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce'; // Standard custom hook
import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const ExplorersPage = () => {
  const { data: explorers, meta } = useLoaderData() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for the input field to keep the UI snappy
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const debouncedQuery = useDebounce(query, 500);

  // 🏛️ Sync URL when debounced search changes
  useEffect(() => {
    setSearchParams(prev => {
      if (debouncedQuery) prev.set('search', debouncedQuery);
      else prev.delete('search');
      prev.set('page', '1'); // Reset to page 1 on new search
      return prev;
    });
  }, [debouncedQuery]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? meta.page + 1 : meta.page - 1;
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  return (
    <div className="space-y-8 p-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic italic">Explorers</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Database Management</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 leading-none">{meta.total}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase">Total Records</p>
        </div>
      </header>

      {/* 🔍 Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by child or parent name..."
          className="w-full pl-12 pr-4 py-4 bg-white border-4 border-slate-900 rounded-2xl font-bold shadow-[4px_4px_0px_0px_#0f172a] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
        />
      </div>

      {/* 📋 Table */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[10px_10px_0px_0px_#0f172a] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-6">Explorer</th>
              <th className="p-6">Parent</th>
              <th className="p-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-100">
            {explorers.map((child: any) => (
              <tr key={child.id}>
                <td className="p-6 font-black text-slate-900 uppercase">{child.firstName} {child.lastName}</td>
                <td className="p-6 font-bold text-slate-500 text-sm uppercase">{child.parent.name}</td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-full border-2 border-slate-900 text-[10px] font-black uppercase ${child.registrations.length > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                    {child.registrations.length > 0 ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🛠️ Pagination Controls */}
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-2xl border-2 border-slate-200">
        <p className="font-black uppercase text-[10px] text-slate-500">
          Page {meta.page} of {Math.max(meta.lastPage, 1)}
        </p>
        <div className="flex gap-2">
          <PaginationBtn 
            icon={<ChevronLeft size={18} />} 
            disabled={meta.page <= 1} 
            onClick={() => handlePageChange('prev')} 
          />
          <PaginationBtn 
            icon={<ChevronRight size={18} />} 
            disabled={meta.page >= meta.lastPage} 
            onClick={() => handlePageChange('next')} 
          />
        </div>
      </div>
    </div>
  );
};

const PaginationBtn = ({ icon, disabled, onClick }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-2 border-2 border-slate-900 rounded-lg transition-all ${disabled ? 'opacity-20 cursor-not-allowed' : 'bg-white hover:bg-sky-400 active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none'}`}
  >
    {icon}
  </button>
);