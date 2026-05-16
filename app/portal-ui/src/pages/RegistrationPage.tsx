import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { calculateAge } from '@/utils/date-utils';
import {
  CheckCircle2,
  CreditCard,
  Wallet,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import api from '@/services/api';
import { useEnrollmentStatus } from '@/hooks/use-enrollmentStatus';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const data = useLoaderData() as any;

  const {
    children = [],
    availableClasses = [],
    session = { id: '', name: '', pricePerClass: 0 },
    pendingApplication,
  } = data || {};

  const { childStatusMap } = useEnrollmentStatus({
    children,
    session,
    pendingApplication,
  });

  useEffect(() => {
    if (pendingApplication?.id) {
      navigate(`/dashboard/payment/${pendingApplication.id}`, { replace: true });
    }
  }, [pendingApplication, navigate]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🛠️ DYNAMIC PRICING CALCULATION (Per-child dynamic checks)
  const totalAmount = selectedIds.reduce((sum, childId) => {
    const child = children.find((c: any) => c.id === childId);
    if (!child) return sum;

    const age = calculateAge(child.dob);
    
    // Find the eligible class matching this child's age group limits
    const assignedClass = availableClasses.find(
      (c: any) => age >= c.ageMin && age <= c.ageMax
    );

    // Dynamic resolution fallback check
    const individualPrice = assignedClass?.price !== undefined && assignedClass?.price !== null
      ? Number(assignedClass.price)
      : Number(session.pricePerClass || 0);

    return sum + individualPrice;
  }, 0);

  const amountToPayNow = paymentPlan === 'FULL' ? totalAmount : totalAmount / 2;

  const toggleSelection = (id: string, isSelectable: boolean) => {
    if (!isSelectable) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/v1/registrations/bulk', {
        sessionId: session.id,
        childIds: selectedIds,
        paymentPlan,
      });

      const applicationId = res?.data?.applicationId;
      if (!applicationId) throw new Error('Application ID not returned');

      navigate(`/dashboard/payment/${applicationId}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-80">
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/')} 
        className="text-slate-400 font-bold hover:text-sky-500 flex items-center gap-2 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      {/* HEADER */}
      <header>
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">
          Select Explorers
        </h1>
        <p className="text-slate-500 font-bold flex items-center gap-2">
          <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs uppercase tracking-widest">Session</span>
          {session.name}
        </p>
      </header>

      {/* CHILD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child: any) => {
          const age = calculateAge(child.dob);
          const isEligibleClass = availableClasses.some(
            (c: any) => age >= c.ageMin && age <= c.ageMax
          );
          const status = childStatusMap[child.id];
          const isSelectable = isEligibleClass && status === 'NOT_STARTED';
          const isSelected = selectedIds.includes(child.id);

          let tooltip = '';
          if (!isEligibleClass) tooltip = 'No available classes for this age';
          else if (status === 'CONFIRMED') tooltip = 'Already enrolled';
          else if (status === 'PENDING') tooltip = 'Pending payment';

          return (
            <div key={child.id} className="relative group">
              <div
                onClick={() => toggleSelection(child.id, isSelectable)}
                className={`p-8 rounded-[2.5rem] border-4 transition-all duration-300 relative overflow-hidden
                  ${!isSelectable 
                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' 
                    : isSelected
                    ? 'bg-sky-50 border-slate-900 shadow-[8px_8px_0px_0px_#0ea5e9]'
                    : 'bg-white border-slate-900 hover:border-sky-400 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase leading-none mb-1">
                      {child.firstName}
                    </h3>
                    <p className="text-sm font-bold text-slate-500">Age {age}</p>
                    <div className="mt-4 inline-block">
                      {status === 'CONFIRMED' && <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase">Enrolled</span>}
                      {status === 'PENDING' && <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-black uppercase">Pending</span>}
                      {status === 'NOT_STARTED' && <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Available</span>}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="text-sky-500 fill-sky-50" size={32} strokeWidth={3} />}
                </div>
              </div>

              {!isSelectable && tooltip && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                  {tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STICKY BOTTOM CHECKOUT CARD */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-8 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
              
              {/* PAYMENT TOGGLE BAR */}
              <div className="flex border-b-4 border-slate-900 h-16 sm:h-20">
                <button
                  onClick={() => setPaymentPlan('FULL')}
                  className={`flex-1 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all ${
                    paymentPlan === 'FULL' 
                    ? 'bg-sky-400 text-slate-900' 
                    : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <CreditCard size={20} strokeWidth={3} />
                  <span>Full Pay</span>
                </button>
                
                <button
                  onClick={() => setPaymentPlan('PARTIAL')}
                  className={`flex-1 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm relative transition-all border-l-4 border-slate-900 ${
                    paymentPlan === 'PARTIAL' 
                    ? 'bg-rose-400 text-white' 
                    : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <Wallet size={20} strokeWidth={3} />
                  <span>Partial</span>
                  <span className={`absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] px-2 py-1 rounded-full border-2 border-slate-900 transition-transform ${paymentPlan === 'PARTIAL' ? 'scale-110' : 'scale-100'}`}>
                    50%
                  </span>
                </button>
              </div>

              {/* ACTION AREA */}
              <div className="p-4 sm:p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Payment Due Now</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">
                      ₦{amountToPayNow.toLocaleString()}
                    </span>
                    {paymentPlan === 'PARTIAL' && (
                      <span className="text-sm font-bold text-slate-400 line-through">
                        ₦{totalAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-8 text-2xl font-black bg-emerald-400 hover:bg-emerald-500 text-slate-900 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  {isSubmitting ? 'WORKING...' : 'REGISTER →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 max-w-md w-full space-y-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4 text-center">
              <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center border-4 border-slate-900">
                <AlertTriangle className="text-amber-500" size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Confirm Details</h2>
              <p className="font-bold text-slate-600 leading-relaxed">
                You are about to register <span className="text-slate-900 px-1 border-b-2 border-sky-400">{selectedIds.length} explorer(s)</span> using the 
                <span className="text-slate-900 px-1 border-b-2 border-rose-400 ml-1 uppercase">{paymentPlan}</span> plan.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="w-full bg-emerald-400 text-slate-900 py-4 rounded-2xl font-black uppercase border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
              >
                {isSubmitting ? 'Processing...' : 'Yes, Proceed'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full bg-white text-slate-400 py-4 rounded-2xl font-black uppercase border-4 border-slate-200 hover:border-slate-900 hover:text-slate-900 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};