// apps/web/src/pages/payment/PaymentPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { ShieldCheck } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useMemo, useState } from 'react';

export const PaymentPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const { data } = useLoaderData() as any;

  const application = data?.application ?? data;

  const userEmail =
    data?.userEmail ??
    data?.email ??
    'sesughdtyohemba@gmail.com';

  // ---------------------------
  // SOURCE OF TRUTH
  // ---------------------------
  const paymentPlan = application?.paymentPlan; // FULL | PARTIAL

  const totalAmount = Number(application?.totalAmount ?? 0);
  const amountPaid = Number(application?.amountPaid ?? 0);

  const remainingBalance = totalAmount - amountPaid;

  // ---------------------------
  // EXTRA SESSION (USER OVERRIDE AMOUNT)
  // ---------------------------
  const [customAmount, setCustomAmount] = useState<number | ''>('');

  const minPartialAmount = Math.round(totalAmount * 0.5);

  // ---------------------------
  // CORE RULE
  // ---------------------------
  const payableAmount = useMemo(() => {
    if (paymentPlan === 'PARTIAL') {
      // If user entered custom amount, use it
      if (customAmount !== '' && customAmount > 0) {
        return customAmount;
      }

      return minPartialAmount;
    }

    return remainingBalance;
  }, [paymentPlan, totalAmount, remainingBalance, customAmount]);

  // ---------------------------
  // VALIDATION GUARD
  // ---------------------------
  const isInvalidPartial =
    paymentPlan === 'PARTIAL' &&
    (payableAmount < minPartialAmount || payableAmount > remainingBalance);

  // ---------------------------
  // FORMATTING
  // ---------------------------
  const formattedRemaining = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(remainingBalance);

  const formattedPayable = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(payableAmount);

  // ---------------------------
  // PAYSTACK CONFIG
  // ---------------------------
  const config = {
    reference: `explorer_${applicationId}_${Date.now()}`,
    email: userEmail,
    amount: Math.round(payableAmount * 100),

    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

    custom_fields: {
      applicationId,
      paymentPlan,
      expectedAmount: payableAmount,
    },
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentClick = () => {
    if (!userEmail) {
      alert('User email is required');
      return;
    }

    if (!payableAmount || payableAmount <= 0) {
      alert('Invalid payment amount');
      return;
    }

    if (isInvalidPartial) {
      alert(`Partial payment must be between ₦${minPartialAmount.toLocaleString()} and ₦${remainingBalance.toLocaleString()}`);
      return;
    }

    initializePayment({
      onSuccess,
      onClose,
    });
  };

  const onSuccess = async (reference: any) => {
    navigate(
      `/dashboard/payment/verifying?reference=${reference.reference}`,
    );
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  return (
    <div className="max-w-2xl mx-auto p-12 text-center space-y-8">

      {/* ICON */}
      <div className="inline-block p-8 bg-emerald-50 rounded-[2.5rem] border-4 border-emerald-500 text-emerald-600 shadow-[8px_8px_0px_0px_#10b981]">
        <ShieldCheck size={64} strokeWidth={3} />
      </div>

      {/* TITLE */}
      <h1 className="text-5xl font-black uppercase italic text-slate-900">
        Complete Registration
      </h1>

      {/* SUMMARY */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#fda4af] text-left space-y-4">

        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Total Fee</span>
          <span className="font-black">₦{totalAmount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Amount Paid</span>
          <span className="font-black text-emerald-400">
            ₦{amountPaid.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between border-t border-slate-700 pt-4">
          <span className="font-bold text-slate-400">
            Remaining Balance
          </span>

          <span className="text-3xl font-black text-rose-400">
            {formattedRemaining}
          </span>
        </div>

        {/* PLAN LABEL */}
        <div className="pt-4 text-sm text-slate-400 font-bold uppercase">
          Payment Plan: {paymentPlan}
          {paymentPlan === 'PARTIAL' && (
            <span className="text-amber-400 ml-2">
              (Min 50% required, editable up to full balance)
            </span>
          )}
        </div>
      </div>

      {/* EXTRA SESSION INPUT (NO DESIGN CHANGE, SAME STYLE SYSTEM) */}
      {paymentPlan === 'PARTIAL' && (
        <div className="text-left space-y-2">
          <label className="text-xs font-black uppercase text-slate-500">
            Custom Amount (optional)
          </label>

          <input
            type="number"
            value={customAmount}
            onChange={(e) =>
              setCustomAmount(
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            placeholder={`Min ₦${minPartialAmount.toLocaleString()}`}
            className="w-full p-4 border-4 border-slate-900 rounded-2xl font-bold"
          />

          <p className="text-[10px] font-bold text-slate-400 uppercase">
            You can pay more than 50% but not exceed total balance
          </p>
        </div>
      )}

      {/* PAY BUTTON */}
      <button
        onClick={handlePaymentClick}
        className="
          w-full py-8 text-3xl font-black
          bg-emerald-500 text-white
          border-4 border-slate-900
          shadow-[8px_8px_0px_0px_#0f172a]
          hover:shadow-none hover:translate-y-1
          transition-all uppercase italic
        "
      >
        Pay {formattedPayable}
      </button>

      <p className="text-xs font-bold text-slate-400 uppercase">
        Secure Transaction via Paystack
      </p>
    </div>
  );
};