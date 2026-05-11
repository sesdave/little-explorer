import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { ExplorerDetailModal } from '@/components/admin/modal/ExplorerDetailModal';

export const ExplorersPage = () => {
  const { data: explorers, meta } = useLoaderData() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  
  // 🔍 Local search state
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const debouncedQuery = useDebounce(query, 500);

  // 💰 Payment Filter state (synced with URL)
  const currentFilter = searchParams.get('paymentStatus') || 'all';

  useEffect(() => {
    setSearchParams(prev => {
      if (debouncedQuery) prev.set('search', debouncedQuery);
      else prev.delete('search');
      prev.set('page', '1');
      return prev;
    });
  }, [debouncedQuery]);

  const handleFilterChange = (status: string) => {
    setSearchParams(prev => {
      if (status === 'all') prev.delete('paymentStatus');
      else prev.set('paymentStatus', status);
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? meta.page + 1 : meta.page - 1;
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">Explorers</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Database Management</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900 leading-none">{meta.total}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase">Total Records</p>
        </div>
      </header>

      {/* TOOLBAR: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-12 pr-4 py-4 bg-white border-4 border-slate-900 rounded-2xl font-bold shadow-[4px_4px_0px_0px_#0f172a] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Payment Filters */}
        <div className="flex p-1 bg-slate-100 border-4 border-slate-900 rounded-2xl gap-1">
          {['all', 'paid', 'partial', 'unpaid'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                currentFilter === status 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:bg-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[10px_10px_0px_0px_#0f172a] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-6">Explorer</th>
              <th className="p-6">Parent</th>
              <th className="p-6 text-center">Payment Status</th>
              <th className="p-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-100">
            {explorers.length > 0 ? explorers.map((child: any) => (
              <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-6">
                  <div className="font-black text-slate-900 uppercase">{child.firstName} {child.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {child.id.split('-')[0]}</div>
                </td>
                <td className="p-6">
                  <div className="font-bold text-slate-700 text-sm uppercase">{child.parent.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{child.parent.email}</div>
                </td>
                <td className="p-6 text-center">
                  <StatusBadge status={child.paymentStatus} />
                </td>
                <td className="p-6 text-center">
                   <button onClick={() => setSelectedChild(child)}
                    className="text-[10px] font-black uppercase border-2 border-slate-900 px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] active:shadow-none active:translate-y-[1px] transition-all">
                     View
                   </button>
                </td>
                {/* Add the Modal component at the bottom of the return statement */}
                <ExplorerDetailModal 
                  child={selectedChild} 
                  onClose={() => setSelectedChild(null)} 
                />
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-20 text-center font-black text-slate-300 uppercase italic text-2xl">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a]">
        <p className="font-black uppercase text-[12px] text-white tracking-widest">
          Showing Page {meta.page} <span className="text-sky-400 mx-2">//</span> Total {meta.lastPage}
        </p>
        <div className="flex gap-4">
          <PaginationBtn 
            icon={<ChevronLeft size={24} strokeWidth={3} />} 
            disabled={meta.page <= 1} 
            onClick={() => handlePageChange('prev')} 
          />
          <PaginationBtn 
            icon={<ChevronRight size={24} strokeWidth={3} />} 
            disabled={meta.page >= meta.lastPage} 
            onClick={() => handlePageChange('next')} 
          />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
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
};

const PaginationBtn = ({ icon, disabled, onClick }: any) => (
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