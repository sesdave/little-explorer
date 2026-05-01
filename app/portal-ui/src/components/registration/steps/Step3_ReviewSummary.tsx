import { useFamilyStore } from '@/store/family.store';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export const Step3_ReviewSummary = ({ onNext, onBack }: Step3Props) => {
  const { registrationCart, children, selectedChildId } = useFamilyStore();
  const selectedChild = children.find(c => c.id === selectedChildId);
  const total = registrationCart.length * 150; 

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-slate-900">Review Summary</h2>
      <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4">
        {registrationCart.map((id) => (
          <div key={id} className="flex justify-between font-bold border-b border-slate-200 pb-2">
            <span className="text-slate-600 font-medium">Class ID: {id}</span>
            <span className="text-slate-900">$150.00</span>
          </div>
        ))}
        <div className="flex justify-between text-2xl font-black pt-4">
          <span>Total</span>
          <span className="text-sky-600">${total}.00</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <button onClick={onNext} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black">
          Secure Payment
        </button>
        <button onClick={onBack} className="text-slate-400 font-bold">← Back to Classes</button>
      </div>
    </div>
  );
};