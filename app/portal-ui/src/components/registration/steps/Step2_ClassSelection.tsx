// apps/portal-ui/src/components/registration/steps/Step2_ClassSelection.tsx
import { ClassCard } from '../shared/ClassCard';
import { useAgeCalculator } from '@/hooks/use-age-calculator';
import { useFamilyStore } from '@/store/family.store'; // Added import

export const Step2_ClassSelection = ({ onNext, 
      onBack }: { 
    onNext: () => void;
    onBack: () => void;
   }) => {
  // 1. Destructure based on your actual store state
  const { 
    children, 
    selectedChildId, 
    registrationCart, 
    toggleRegistration 
  } = useFamilyStore();

  const selectedChild = children.find(c => c.id === selectedChildId);
  const age = useAgeCalculator(selectedChild?.dob);

  // Mock classes (usually fetched from your portal-api)
  const availableClasses = [
    { id: 'c1', title: 'Sensory Art', minAge: 2, maxAge: 4, price: 120 },
    { id: 'c2', title: 'Lego Engineering', minAge: 5, maxAge: 9, price: 180 }
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-black text-slate-900">Available Adventures</h2>
        <p className="text-slate-500 font-bold">
          Registering for: <span className="text-sky-600">{selectedChild?.firstName}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableClasses.map(cls => {
          // 1. Check if age exists and is a number
            // If age is null, isEligible will default to false
            const isEligible = typeof age === 'number' && age >= cls.minAge && age <= cls.maxAge;
            
            return (
                <ClassCard 
                key={cls.id}
                item={cls}
                isEligible={isEligible}
                selected={registrationCart.includes(cls.id)}
                onToggle={() => toggleRegistration(cls.id)}
                />
            );
        })}
      </div>

      <button 
        onClick={onNext} 
        disabled={registrationCart.length === 0}
        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all"
      >
        Review Registration
      </button>
    </div>
  );
};