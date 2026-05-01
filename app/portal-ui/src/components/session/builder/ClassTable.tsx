import { Plus } from 'lucide-react';
import { ClassTableRow } from './ClassTableRow';

export const ClassTable = ({ classes, onUpdate, onDelete, onAdd }: any) => {
  return (
    <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b-4 border-slate-900">
          <tr>
            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Class Name</th>
            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Age Range</th>
            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400">Capacity</th>
            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-100">
          {classes.map((cls: any) => (
            <ClassTableRow key={cls.id} cls={cls} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
      <div className="p-6 bg-slate-50 border-t-4 border-slate-900 flex justify-center">
         <button onClick={onAdd} className="flex items-center gap-2 font-black uppercase text-sm text-sky-500 hover:scale-105 transition-transform">
           <Plus size={20} strokeWidth={4} /> Add New Class Template
         </button>
      </div>
    </div>
  );
};