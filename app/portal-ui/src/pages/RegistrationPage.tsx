import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { calculateAge } from '@/utils/date-utils';
import {
  CheckCircle2,
  CreditCard,
  Wallet,
  AlertTriangle
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

  const pricePerChild = Number(session.pricePerClass || 0);
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
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">

      {/* HEADER */}
      <header>
        <h1 className="text-4xl font-black uppercase italic">
          Select Explorers
        </h1>
        <p className="text-slate-500 font-bold">
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

          const isSelectable =
            isEligibleClass && status === 'NOT_STARTED';

          const isSelected = selectedIds.includes(child.id);

          // ✅ TOOLTIP LOGIC RESTORED
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
                className={`p-8 rounded-[2.5rem] border-4 transition-all duration-300
                  ${
                    !isSelectable
                      ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-sky-50 border-sky-500 shadow-[8px_8px_0px_0px_#0ea5e9]'
                      : 'bg-white border-slate-900 hover:border-sky-400 cursor-pointer'
                  }`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-2xl font-black uppercase">
                      {child.firstName}
                    </h3>

                    <p className="text-sm font-bold text-slate-500">
                      Age {age}
                    </p>

                    {/* STATUS LABEL */}
                    <p className="text-xs font-bold uppercase mt-2">
                      {status === 'CONFIRMED' && (
                        <span className="text-emerald-500">Enrolled</span>
                      )}
                      {status === 'PENDING' && (
                        <span className="text-amber-500">Pending Payment</span>
                      )}
                      {status === 'NOT_STARTED' && (
                        <span className="text-slate-400">Not Started</span>
                      )}
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="text-sky-500" />
                  )}
                </div>
              </div>

              {/* ✅ TOOLTIP (RESTORED) */}
              {!isSelectable && tooltip && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                                bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl
                                opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {tooltip}
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* SUMMARY */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6">

          <div className="flex justify-between">
            <h2 className="text-3xl font-black">
              ₦{totalAmount.toLocaleString()}
            </h2>
          </div>

          {/* PAYMENT OPTIONS */}
          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => setPaymentPlan('FULL')}
              className={`p-4 border-4 rounded-2xl ${
                paymentPlan === 'FULL'
                  ? 'border-sky-400 bg-sky-900/30'
                  : 'border-slate-700'
              }`}
            >
              <CreditCard />
              Full Payment
            </button>

            <button
              onClick={() => setPaymentPlan('PARTIAL')}
              className={`p-4 border-4 rounded-2xl relative ${
                paymentPlan === 'PARTIAL'
                  ? 'border-rose-400 bg-rose-900/30'
                  : 'border-slate-700'
              }`}
            >
              <Wallet />
              Partial

              {/* 50% LABEL */}
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-full border-2 border-black">
                50%
              </span>
            </button>

          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-10 sticky bottom-6 sm:bottom-6 bg-white/80 backdrop-blur-sm -mx-6 px-6 pb-6">
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={selectedIds.length === 0}
          className="w-full py-10 text-3xl font-black bg-rose-400 text-white border-4 border-slate-900"
        >
          CONFIRM REGISTRATION
        </Button>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">

          <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 max-w-md w-full space-y-6">

            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-500" />
              <h2 className="text-xl font-black uppercase">
                Confirm Action
              </h2>
            </div>

            <p className="font-bold text-slate-600">
              You are registering <b>{selectedIds.length}</b> child(ren)
              with <b>{paymentPlan}</b> payment plan.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-4 border-slate-900 p-3 font-black"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkSubmit}
                className="flex-1 bg-rose-400 text-white border-4 border-slate-900 font-black"
              >
                Confirm
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};