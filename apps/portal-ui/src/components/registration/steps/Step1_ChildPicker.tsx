// apps/portal-ui/src/components/registration/steps/Step1_ChildPicker.tsx
import { useFamilyStore } from '@/store/family.store';

export const Step1_ChildPicker = ({ onNext }: { onNext: () => void }) => {
  // 1. Update to match the property names in family.store.ts
  const { children, selectedChildId, selectChild } = useFamilyStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <h2 className="text-3xl font-black text-slate-900">Who is exploring?</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {children.map((child) => (
          <button
            key={child.id}
            // 2. Use 'selectChild' instead of 'selectChildForReg'
            onClick={() => selectChild(child.id)}
            className={`flex items-center justify-between p-6 rounded-[2rem] border-4 transition-all
              ${selectedChildId === child.id 
                ? 'border-sky-500 bg-sky-50' 
                : 'border-slate-50 bg-white hover:border-slate-200'}`}
          >
            <span className="font-bold text-lg text-slate-800">{child.firstName}</span>
            {/* 3. Check 'selectedChildId' for the active indicator */}
            {selectedChildId === child.id && (
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      <button 
        // 4. Disable if no child is selected
        disabled={!selectedChildId}
        onClick={onNext}
        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-all"
      >
        Continue to Classes
      </button>
    </div>
  );
};