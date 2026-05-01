import { Trash2 } from 'lucide-react';

interface RowProps {
  cls: any;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

export const ClassTableRow = ({ cls, onUpdate, onDelete }: RowProps) => (
  <tr className={`group hover:bg-slate-50 transition-colors ${cls.isDirty ? 'bg-amber-50/50' : ''}`}>
    <td className="p-6">
      <input 
        type="text"
        value={cls.name}
        onChange={(e) => onUpdate(cls.id, 'name', e.target.value)}
        className="bg-transparent font-black text-lg text-slate-900 border-b-2 border-transparent focus:border-sky-400 outline-none w-full"
      />
    </td>
    <td className="p-6">
      <div className="flex items-center gap-2">
        <AgeInput value={cls.ageMin} onChange={(val) => onUpdate(cls.id, 'ageMin', val)} />
        <span className="font-black text-slate-300">-</span>
        <AgeInput value={cls.ageMax} onChange={(val) => onUpdate(cls.id, 'ageMax', val)} />
      </div>
    </td>
    <td className="p-6">
      <input 
        type="number" 
        value={cls.capacity} 
        onChange={(e) => onUpdate(cls.id, 'capacity', parseInt(e.target.value))}
        className="w-20 bg-slate-100 p-2 rounded-xl font-black border-2 border-slate-200 focus:border-slate-900 outline-none"
      />
    </td>
    <td className="p-6 text-right">
      <button onClick={() => onDelete(cls.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
        <Trash2 size={20} strokeWidth={3} />
      </button>
    </td>
  </tr>
);

// Small sub-component for consistent styling
const AgeInput = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <input 
    type="number" 
    value={value} 
    onChange={(e) => onChange(parseInt(e.target.value))}
    className="w-12 bg-slate-100 p-1 rounded font-bold text-center border-2 border-slate-200"
  />
);