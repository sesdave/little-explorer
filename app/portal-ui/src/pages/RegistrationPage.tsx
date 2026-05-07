// apps/web/src/pages/dashboard/RegistrationPage.tsx
import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { calculateAge } from '@/utils/date-utils';
import { CheckCircle2, CreditCard, Wallet } from 'lucide-react';
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

  // Redirect if there's a pending application
  useEffect(() => {
    if (pendingApplication?.id) {
      navigate(`/dashboard/payment/${pendingApplication.id}`, { replace: true });
    }
  }, [pendingApplication, navigate]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPrice = (price: any): number => {
    if (!price) return 0;
    if (typeof price === 'object' && price.toFixed) return Number(price.toFixed(2));
    return Number(price);
  };

  const pricePerChild = getPrice(session.pricePerClass);
  const totalAmount = selectedIds.length * pricePerChild;

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

      if (!applicationId) {
        throw new Error('Application ID not returned');
      }

      navigate(`/dashboard/payment/${applicationId}`, { replace: true });
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
      {/* HEADER */}
      <header>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic">
          Select Explorers
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider">
          Session: {session.name}
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

          // ✅ Tooltip logic
          let tooltip = '';
          if (!isEligibleClass) {
            tooltip = 'No available classes for this age';
          } else if (status === 'CONFIRMED') {
            tooltip = 'Already enrolled in this session';
          } else if (status === 'PENDING') {
            tooltip = 'Pending payment for this child';
          }

          return (
            <div key={child.id} className="relative group">
              <div
                onClick={() => toggleSelection(child.id, isSelectable)}
                className={`relative p-8 rounded-[2.5rem] border-4 transition-all duration-300
                  ${
                    !isSelectable
                      ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-sky-50 border-sky-500 shadow-[8px_8px_0px_0px_#0ea5e9]'
                      : 'bg-white border-slate-900 hover:border-sky-400 cursor-pointer shadow-[4px_4px_0px_0px_#0f172a]'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase">
                      {child.firstName}
                    </h3>
                    <p className="text-sm font-bold text-slate-500">
                      Age {age}
                    </p>

                    <p className="text-xs font-bold uppercase mt-2">
                      {status === 'CONFIRMED' && (
                        <span className="text-emerald-500">Enrolled</span>
                      )}
                      {status === 'PENDING' && (
                        <span className="text-amber-500">
                          Pending Payment
                        </span>
                      )}
                      {status === 'NOT_STARTED' && (
                        <span className="text-slate-400">Not Started</span>
                      )}
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={32} className="text-sky-500" />
                  )}
                </div>
              </div>

              {/* ✅ Tooltip */}
              {!isSelectable && tooltip && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                                bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl
                                opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                  {tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#fda4af] space-y-6">
          <div className="flex justify-between items-end border-b border-slate-700 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Order Summary
              </p>
              <h2 className="text-3xl font-black italic uppercase">
                Total: ₦{totalAmount.toLocaleString()}
              </h2>
            </div>
            <p className="font-bold text-rose-400">
              {selectedIds.length} Children × ₦{pricePerChild.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentPlan('FULL')}
              className={`p-4 border-4 rounded-2xl flex items-center gap-2 ${
                paymentPlan === 'FULL'
                  ? 'border-sky-400 bg-sky-900/30'
                  : 'border-slate-700'
              }`}
            >
              <CreditCard /> Pay Full
            </button>

            <button
              onClick={() => setPaymentPlan('PARTIAL')}
              className={`p-4 border-4 rounded-2xl flex items-center gap-2 ${
                paymentPlan === 'PARTIAL'
                  ? 'border-rose-400 bg-rose-900/30'
                  : 'border-slate-700'
              }`}
            >
              <Wallet /> Partial
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-10 sticky bottom-6">
        <Button
          onClick={handleBulkSubmit}
          disabled={selectedIds.length === 0 || isSubmitting}
          className="w-full py-10 text-3xl font-black bg-rose-400 text-white border-4 border-slate-900"
        >
          {isSubmitting
            ? 'ASSIGNING CLASSES...'
            : `CONFIRM & PAY ₦${totalAmount.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
};