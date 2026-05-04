import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { calculateAge } from '@/utils/date-utils';
import { CheckCircle2, AlertCircle, CreditCard, Wallet } from 'lucide-react';
import api from '@/services/api';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const data = useLoaderData() as any;

  const { 
    children = [], 
    availableClasses = [], 
    session = { id: '', name: '', pricePerClass: 0 },
    pendingApplication 
  } = data || {};

  useEffect(() => {
    console.log("enter useEffect", pendingApplication);
    if (pendingApplication?.id) {
      console.log("trying to navigate", pendingApplication.id)
      navigate(`/dashboard/payment/${pendingApplication.id}`, { replace: true });
    }
  }, [pendingApplication, navigate]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<'FULL' | 'PARTIAL'>('FULL'); // 👈 New State
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // 🏛️ Staff-Level robust parsing
const getPrice = (price: any): number => {
  if (!price) return 0;
  // If it's a Prisma Decimal object, it might have a .toNumber() or be a string
  if (typeof price === 'object' && price.toFixed) return Number(price.toFixed(2));
  return Number(price);
};

  // 🏛️ Financial Summary Logic
  const pricePerChild = getPrice(session.pricePerClass);
  const totalAmount = selectedIds.length * pricePerChild;

  const toggleSelection = (id: string, isEligible: boolean) => {
    if (!isEligible) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/v1/registrations/bulk', {
        sessionId: session.id,
        childIds: selectedIds,
        paymentPlan: paymentPlan // 👈 Now sending the required enum
      });
      console.log("submited data", res);
      const applicationId = res?.data?.applicationId;

      navigate(`/payment/${applicationId}`);
      //navigate('/dashboard?success=true');
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
      <header>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic">Select Explorers</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider">Session: {session.name}</p>
      </header>

      {/* 1. Explorer Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child: any) => {
          const age = calculateAge(child.dob);
          const isEligible = availableClasses.some((c: any) => age >= c.ageMin && age <= c.ageMax);
          const isSelected = selectedIds.includes(child.id);

          return (
            <div 
              key={child.id}
              onClick={() => toggleSelection(child.id, isEligible)}
              className={`relative p-8 rounded-[2.5rem] border-4 transition-all duration-300
                ${!isEligible ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' : 
                  isSelected ? 'bg-sky-50 border-sky-500 shadow-[8px_8px_0px_0px_#0ea5e9]' : 
                  'bg-white border-slate-900 hover:border-sky-400 cursor-pointer shadow-[4px_4px_0px_0px_#0f172a]'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">{child.firstName}</h3>
                  <p className="font-bold text-slate-500 text-sm">Age {age}</p>
                </div>
                {isSelected && <CheckCircle2 className="text-sky-500" size={32} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Amount Summary & Payment Plan Selection */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#fda4af] space-y-6">
          <div className="flex justify-between items-end border-b border-slate-700 pb-4">
            <div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Order Summary</p>
              <h2 className="text-3xl font-black italic uppercase">Total: ${totalAmount.toLocaleString()}</h2>
            </div>
            <p className="font-bold text-rose-400">{selectedIds.length} Children × ${pricePerChild}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentPlan('FULL')}
              className={`flex items-center gap-4 p-4 rounded-2xl border-4 transition-all
                ${paymentPlan === 'FULL' ? 'border-sky-400 bg-sky-900/30' : 'border-slate-700 hover:border-slate-500'}`}
            >
              <CreditCard className={paymentPlan === 'FULL' ? 'text-sky-400' : 'text-slate-500'} />
              <div className="text-left">
                <p className="font-black uppercase text-sm">Pay in Full</p>
                <p className="text-xs text-slate-400">Secure spot immediately</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentPlan('PARTIAL')}
              className={`flex items-center gap-4 p-4 rounded-2xl border-4 transition-all
                ${paymentPlan === 'PARTIAL' ? 'border-rose-400 bg-rose-900/30' : 'border-slate-700 hover:border-slate-500'}`}
            >
              <Wallet className={paymentPlan === 'PARTIAL' ? 'text-rose-400' : 'text-slate-500'} />
              <div className="text-left">
                <p className="font-black uppercase text-sm">Partial Plan</p>
                <p className="text-xs text-slate-400">50% now, 50% later</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 3. Final Action Bar */}
      <div className="pt-10 sticky bottom-6">
        <Button 
          onClick={handleBulkSubmit}
          disabled={selectedIds.length === 0 || isSubmitting}
          className="w-full py-10 text-3xl font-black bg-rose-400 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-y-1 transition-all"
        >
          {isSubmitting ? 'ASSIGNING CLASSES...' : `CONFIRM & PAY $${totalAmount}`}
        </Button>
      </div>
    </div>
  );
};