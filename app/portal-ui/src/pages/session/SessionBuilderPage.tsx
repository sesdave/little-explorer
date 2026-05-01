import { useParams } from 'react-router-dom';
import { Plus, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSessionClasses } from '@/hooks/use-session-classes'; // Hypothetical hook

export const SessionBuilderPage = () => {
  const { sessionId } = useParams();
  const { classes, sessionName, isLoading } = useSessionClasses(sessionId);

  if (isLoading) return <div className="p-10 font-black animate-pulse">Loading Inventory...</div>;

  return (
    <div className="p-8 space-y-8">
      {/* 1. Builder Header */}
      <div className="flex justify-between items-end">
        <div>
          <button onClick={() => window.history.back()} className="text-slate-400 hover:text-slate-900 flex items-center gap-2 text-xs font-black uppercase mb-4">
            <ArrowLeft size={14} /> Back to Sessions
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            {sessionName} <span className="text-sky-400 not-italic">Inventory</span>
          </h1>
        </div>
        
        {/* Only show "Add" button here if there ARE classes */}
        {classes.length > 0 && (
          <Button onClick={() => console.log('Open Modal')}>
            <Plus className="mr-2" /> Add Class
          </Button>
        )}
      </div>

      <hr className="border-t-4 border-slate-100" />

      {/* 2. Main Content Area */}
      <section>
        {classes.length === 0 ? (
          // 🚀 PLACE THE EMPTY STATE HERE
          <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <div className="bg-white p-6 rounded-full shadow-xl mb-6 text-slate-200">
              <LayoutGrid size={48} />
            </div>
            <p className="font-black uppercase text-slate-400 mb-6 tracking-widest text-center">
              This session is a ghost town!<br/> 
              <span className="text-[10px] font-bold">Start by adding your first class template.</span>
            </p>
            <Button 
              onClick={() => console.log('Open Modal')}
              className="bg-sky-400 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <Plus className="mr-2" strokeWidth={3} /> Add Your First Class
            </Button>
          </div>
        ) : (
          // RENDER YOUR LIST OF CLASSES
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => (
              <div key={cls.id} className="p-6 bg-white border-4 border-slate-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="font-black uppercase">{cls.title}</h4>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};