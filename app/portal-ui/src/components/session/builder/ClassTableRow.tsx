import { Trash2, Banknote } from 'lucide-react';

interface RowProps {
  cls: any;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}

export const ClassTableRow = ({ cls, onUpdate, onDelete }: RowProps) => (
  <tr className={`group hover:bg-slate-50 transition-colors ${cls.isDirty ? 'bg-amber-50/50' : ''}`}>
    {/* Class Name */}
    <td className="p-6">
      <input 
        type="text"
        value={cls.name}
        onChange={(e) => onUpdate(cls.id, 'name', e.target.value)}
        className="bg-transparent font-black text-lg text-slate-900 border-b-2 border-transparent focus:border-sky-400 outline-none w-full"
        placeholder="Section Name"
      />
    </td>

    {/* Age Range */}
    <td className="p-6">
      <div className="flex items-center gap-2">
        <AgeInput value={cls.ageMin} onChange={(val) => onUpdate(cls.id, 'ageMin', val)} />
        <span className="font-black text-slate-300">-</span>
        <AgeInput value={cls.ageMax} onChange={(val) => onUpdate(cls.id, 'ageMax', val)} />
      </div>
    </td>

    {/* Capacity */}
    <td className="p-6">
      <input 
        type="number" 
        value={cls.capacity} 
        onChange={(e) => onUpdate(cls.id, 'capacity', parseInt(e.target.value))}
        className="w-20 bg-slate-100 p-2 rounded-xl font-black border-2 border-slate-200 focus:border-slate-900 outline-none"
      />
    </td>

    {/* Optional Price Field */}
    <td className="p-6">
      <PriceInput 
        value={cls.price} 
        onChange={(val) => onUpdate(cls.id, 'price', val)} 
      />
    </td>

    {/* Actions */}
    <td className="p-6 text-right">
      <button 
        onClick={() => onDelete(cls.id)} 
        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
      >
        <Trash2 size={20} strokeWidth={3} />
      </button>
    </td>
  </tr>
);

/**
 * AgeInput: Consistent styling for small numbers
 */
const AgeInput = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <input 
    type="number" 
    value={value} 
    onChange={(e) => onChange(parseInt(e.target.value))}
    className="w-12 bg-slate-100 p-1 rounded font-bold text-center border-2 border-slate-200 focus:border-slate-900 outline-none"
  />
);

/**
 * PriceInput: Handles Naira symbol and optional (null) state
 */
const PriceInput = ({ value, onChange }: { value: number | null, onChange: (v: number | null) => void }) => (
  <div className="relative w-32 group/input">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">
      ₦
    </span>
    <input 
      type="number" 
      value={value ?? ''} 
      placeholder="Global"
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : parseFloat(val));
      }}
      className="w-full pl-7 pr-3 py-2 bg-slate-100 rounded-xl font-black border-2 border-slate-200 focus:border-emerald-400 outline-none text-sm transition-all placeholder:text-slate-300 placeholder:font-bold"
    />
  </div>
);