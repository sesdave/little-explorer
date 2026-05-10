// apps/web/src/pages/payment/PaymentPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { ShieldCheck } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { useMemo, useState } from 'react';
import api from '@/services/api';
import axios from 'axios';

export const PaymentPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const { data } = useLoaderData() as any;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);


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
  const hasStartedPayment =
  amountPaid > 0 || (application?.payments?.length ?? 0) > 0;

  const canCancelRegistration = !hasStartedPayment;

  // ---------------------------
  // EXTRA SESSION (USER OVERRIDE AMOUNT)
  // ---------------------------
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [isCancelling, setIsCancelling] = useState(false);

  //const minPartialAmount = Math.round(totalAmount * 0.5);
  const initialPartialAmount = Math.round(totalAmount * 0.5);

const requiresInitialDeposit =
  paymentPlan === 'PARTIAL' && !hasStartedPayment;

  // ---------------------------
  // CORE RULE
  // ---------------------------
  /*const payableAmount = useMemo(() => {
    if (paymentPlan === 'PARTIAL') {
      if (customAmount !== '' && customAmount > 0) {
        return customAmount;
      }

      return minPartialAmount;
    }

    return remainingBalance;
  }, [paymentPlan, totalAmount, remainingBalance, customAmount]);*/
  const payableAmount = useMemo(() => {
  if (paymentPlan === 'PARTIAL') {

    // AFTER first payment:
    // allow any amount toward balance
    if (hasStartedPayment) {
      if (customAmount !== '' && customAmount > 0) {
        return customAmount;
      }

      return remainingBalance;
    }

    // FIRST payment must obey 50%
    if (customAmount !== '' && customAmount > 0) {
      return customAmount;
    }

    return initialPartialAmount;
  }

  return remainingBalance;
}, [
  paymentPlan,
  remainingBalance,
  customAmount,
  hasStartedPayment,
  initialPartialAmount,
]);

  // ---------------------------
  // VALIDATION
  // ---------------------------
  /*const isInvalidPartial =
    paymentPlan === 'PARTIAL' &&
    (payableAmount < minPartialAmount || payableAmount > remainingBalance);*/
  const isInvalidPartial =
      paymentPlan === 'PARTIAL' &&
      (
        payableAmount > remainingBalance ||

        (
          requiresInitialDeposit &&
          payableAmount < initialPartialAmount
        )
      );

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
  // CANCEL REGISTRATION
  // ---------------------------
  const handleCancelRegistration = async () => {
    // const confirmCancel = window.confirm(
    //   "Are you sure you want to cancel this registration? This cannot be undone."
    // );

    //if (!confirmCancel) return;

    try {
      setIsCancelling(true);

      await api.patch(`/v1/registrations/${applicationId}/cancel`)

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);

   if (axios.isAxiosError(err)) {
      alert(
        err.response?.data?.message ??
        'Failed to cancel registration'
      );

      return;
    }

    alert('Failed to cancel registration');

    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  // ---------------------------
  // PAYSTACK CONFIG
  // ---------------------------
  const config = {
    reference: `explorer_${applicationId}_${Date.now()}`,
    email: userEmail,
    amount: Math.round(payableAmount * 100),

    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

    metadata: {
      applicationId,
      paymentPlan,
      expectedAmount: payableAmount,

      custom_fields: [
        {
          display_name: "Application ID",
          variable_name: "application_id",
          value: applicationId ?? "",
        },
        {
          display_name: "Payment Plan",
          variable_name: "payment_plan",
          value: paymentPlan,
        },
        {
          display_name: "Expected Amount",
          variable_name: "expected_amount",
          value: payableAmount.toString(),
        },
      ],
    },
  };

  //const initializePayment = usePaystackPayment(config);

  // 1. Add this state at the top of your component
const [isInitializing, setIsInitializing] = useState(false);

const [statusModal, setStatusModal] = useState<{
  show: boolean;
  title: string;
  message: string;
} | null>(null);

const [payConfig, setPayConfig] = useState<any>({
    email: userEmail,
    amount: 0,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  });

  const initializePaystack = usePaystackPayment(payConfig);
  interface PaystackArgs {
  publicKey: string;
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (response: any) => void;
  onClose: () => void;
}

const handlePaymentClick = async () => {
    // 1. Client-side Pre-checks
    if (!userEmail) {
      setStatusModal({ show: true, title: "Missing Info", message: "Email is required." });
      return;
    }
    if (payableAmount <= 0 || isInvalidPartial) {
      setStatusModal({ 
        show: true, 
        title: "Invalid Amount", 
        message: requiresInitialDeposit 
          ? `First payment must be at least ₦${initialPartialAmount.toLocaleString()}` 
          : "Please check the amount." 
      });
      return;
    }

    try {
      setIsInitializing(true);

      // 2. GET AUTHORITY FROM BACKEND
      // We send our intent, backend validates and creates the PENDING record
      const response = await api.post('/v1/payments/initialize', {
        applicationId,
        amount: payableAmount,
      });

      const backendData = response.data;
      console.log("backend data", import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)

      if (!backendData?.reference) {
        throw new Error("Backend failed to generate a transaction reference.");
      }

      // 3. TRIGGER PAYSTACK WITH BACKEND DATA
      // We pass EVERYTHING in one object to the trigger function
      const paymentArgs: any = {
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: backendData.email || userEmail,
        amount: backendData.amount, // Using backend's calculated amount (usually kobo)
        reference: backendData.reference, // Using backend's generated reference
        metadata: {
          applicationId,
          expectedAmount: backendData.amount,
          paymentPlan,
           custom_fields: [
              {
                display_name: "Application ID",
                variable_name: "application_id",
                value: applicationId ?? "",
              },
              {
                display_name: "Payment Plan",
                variable_name: "payment_plan",
                value: paymentPlan,
              },
              {
                display_name: "Expected Amount",
                variable_name: "expected_amount",
                value: payableAmount.toString(),
              },
            ],
        },
        onSuccess: (res: any) => {
          setIsInitializing(false);
          navigate(`/dashboard/payment/verifying?reference=${res.reference}`);
        },
        onClose: () => setIsInitializing(false),
      };

      initializePaystack(paymentArgs);;

    } catch (err: any) {
      console.error("Payment Init Error:", err);
      setStatusModal({
        show: true,
        title: "Payment Error",
        message: err.response?.data?.message || "Could not connect to payment server. Please try again.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

// 2. The Updated handlePaymentClick
/*const handlePaymentClick = async () => {
  // --- VALIDATION ---
  if (!userEmail) {
    setStatusModal({
      show: true,
      title: "Missing Info",
      message: "User email is required to process payment.",
    });
    return;
  }

  if (!payableAmount || payableAmount <= 0) {
    setStatusModal({
      show: true,
      title: "Invalid Amount",
      message: "Please enter a valid amount to continue.",
    });
    return;
  }

  if (isInvalidPartial) {
    const errorMsg = requiresInitialDeposit
      ? `First payment must be at least ₦${initialPartialAmount.toLocaleString()}`
      : `Amount cannot exceed ₦${remainingBalance.toLocaleString()}`;
    
    setStatusModal({
      show: true,
      title: "Payment Constraint",
      message: errorMsg,
    });
    return;
  }

  // --- IDEMPOTENT INITIALIZATION ---
  try {
    setIsInitializing(true);

    // Call your Staff-level API endpoint
    const response = await api.post('/v1/payments/initialize', {
      applicationId,
      amount: payableAmount,
    });

    const { reference } = response.data;

    // Now trigger Paystack using the reference from the BACKEND
    // Note: You should update your 'config' object to use this dynamic reference
    initializePayment({
      onSuccess,
      onClose: () => {
        setIsInitializing(false);
        console.log("Payment closed");
      },
      // Pass the backend reference here if your hook allows, 
      // or ensure the 'config' state was updated.
      reference: reference 
    });

  } catch (err: any) {
    console.error(err);
    setStatusModal({
      show: true,
      title: "Connection Error",
      message: err.response?.data?.message ?? "Could not initialize payment. Please try again.",
    });
  } finally {
    setIsInitializing(false);
  }
};*/

  /*const handlePaymentClick = () => {
    if (!userEmail) {
      alert('User email is required');
      return;
    }

    if (!payableAmount || payableAmount <= 0) {
      alert('Invalid payment amount');
      return;
    }

    if (isInvalidPartial) {
      alert(
  requiresInitialDeposit
    ? `First payment must be at least ₦${initialPartialAmount.toLocaleString()}`
    : `Amount cannot exceed ₦${remainingBalance.toLocaleString()}`
);
      return;
    }

    initializePayment({
      onSuccess,
      onClose,
    });
  };*/

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
      <h1 className="text-3xl sm:text-5xl font-black uppercase italic text-slate-900 leading-[0.95] break-words">
        Complete <br className="sm:hidden" /> Registration
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

        <div className="flex flex-col sm:flex-row justify-between border-t border-slate-700 pt-4">
          <span className="font-bold text-slate-400">Remaining Balance</span>
          <span className="text-3xl font-black text-rose-400">
            {formattedRemaining}
          </span>
        </div>

        <div className="pt-4 text-sm text-slate-400 font-bold uppercase">
          Payment Plan: {paymentPlan}
          {paymentPlan === 'PARTIAL' && (
            <span className="text-amber-400 ml-2">
              (Min 50% required, editable up to full balance)
            </span>
          )}
        </div>
      </div>

      {/* 🚨 CANCEL BUTTON (NEW - BEST POSITION) */}
      {canCancelRegistration && (<button
        onClick={() => setShowCancelConfirm(true)}
        disabled={isCancelling}
        className="
          w-full py-6 text-xl font-black
          bg-rose-500 text-white
          border-4 border-slate-900
          shadow-[6px_6px_0px_0px_#0f172a]
          hover:shadow-none hover:translate-y-1
          transition-all uppercase italic
          opacity-90 hover:opacity-100
        "
      >
        {isCancelling ? 'Cancelling...' : 'Cancel Registration'}
      </button>)}

      {/* EXTRA SESSION INPUT */}
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
            placeholder={
                requiresInitialDeposit
                  ? `Min ₦${initialPartialAmount.toLocaleString()}`
                  : `Max ₦${remainingBalance.toLocaleString()}`
              }
            className="w-full p-4 border-4 border-slate-900 rounded-2xl font-bold"
          />

          <p className="text-[10px] font-bold text-slate-400 uppercase">
        {requiresInitialDeposit
          ? 'Minimum 50% required for first payment'
          : 'Enter any amount up to remaining balance'}
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

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          
          <div className="
            w-full max-w-md
            bg-white
            border-4 border-slate-900
            rounded-[2rem]
            p-8
            shadow-[10px_10px_0px_0px_#0f172a]
            space-y-6
          ">
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase italic text-slate-900">
                Cancel Registration?
              </h2>

              <p className="font-bold text-slate-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4">
              
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="
                  flex-1 py-4
                  border-4 border-slate-900
                  bg-slate-200
                  font-black uppercase
                  rounded-2xl
                "
              >
                Go Back
              </button>

              <button
                onClick={handleCancelRegistration}
                disabled={isCancelling}
                className="
                  flex-1 py-4
                  border-4 border-slate-900
                  bg-rose-500 text-white
                  font-black uppercase italic
                  rounded-2xl
                  shadow-[4px_4px_0px_0px_#0f172a]
                "
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>

            </div>
    </div>
  </div>
)}
{statusModal?.show && (
  <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6">
    <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_#0f172a] space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-black uppercase italic text-rose-500">
          {statusModal.title}
        </h2>
        <p className="font-bold text-slate-600">
          {statusModal.message}
        </p>
      </div>

      <button
        onClick={() => setStatusModal(null)}
        className="w-full py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase rounded-2xl shadow-[4px_4px_0px_0px_#475569]"
      >
        Got it
      </button>
    </div>
  </div>
)}
    </div>
  );
};