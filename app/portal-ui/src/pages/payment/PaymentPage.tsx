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
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  } | null>(null);

  const application = data?.application ?? data;
  const userEmail = data?.userEmail ?? data?.email ?? '';

  // ---------------------------
  // SOURCE OF TRUTH
  // ---------------------------
  const paymentPlan = application?.paymentPlan; 
  const totalAmount = Number(application?.totalAmount ?? 0);
  const amountPaid = Number(application?.amountPaid ?? 0);
  const remainingBalance = totalAmount - amountPaid;

  const hasStartedPayment = amountPaid > 0 || 
    application?.payments?.some((p: any) => p.status === 'SUCCESSFUL');
  
  const canCancelRegistration = !hasStartedPayment;
  const initialPartialAmount = Math.round(totalAmount * 0.5);
  const requiresInitialDeposit = paymentPlan === 'PARTIAL' && !hasStartedPayment;

  // ---------------------------
  // CORE RULE
  // ---------------------------
  const payableAmount = useMemo(() => {
    if (customAmount !== '' && customAmount > 0) {
      return customAmount;
    }
    if (paymentPlan === 'PARTIAL') {
      return hasStartedPayment ? remainingBalance : initialPartialAmount;
    }
    return remainingBalance;
  }, [paymentPlan, remainingBalance, customAmount, hasStartedPayment, initialPartialAmount]);

  // ---------------------------
  // VALIDATION: STRICT ENFORCEMENT
  // ---------------------------
  const isInvalidAmount = useMemo(() => {
    if (payableAmount <= 0) return true;

    // RULE 1: For FULL plan, must be AT LEAST the balance (Support allowed)
    if (paymentPlan === 'FULL' && payableAmount < remainingBalance) {
      return true;
    }

    // RULE 2: For PARTIAL plan, follow the original strict flow
    if (paymentPlan === 'PARTIAL') {
      if (requiresInitialDeposit && payableAmount < initialPartialAmount) return true;
      if (payableAmount > remainingBalance) return true;
    }

    return false;
  }, [payableAmount, paymentPlan, remainingBalance, requiresInitialDeposit, initialPartialAmount]);

  // ---------------------------
  // FORMATTING
  // ---------------------------
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);

  const formattedRemaining = formatCurrency(remainingBalance);
  const formattedPayable = formatCurrency(payableAmount);

  // ---------------------------
  // HANDLERS
  // ---------------------------
  const handleCancelRegistration = async () => {
    try {
      setIsCancelling(true);
      await api.patch(`/v1/registrations/${applicationId}/cancel`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Failed to cancel';
      alert(msg);
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const onSuccess = async (reference: any) => {
      setIsInitializing(false);
     navigate(
       `/dashboard/payment/verifying?reference=${reference.reference}`,
     );
   };

   const onClose = () => {
     setIsInitializing(false)
   };

  const handlePaymentClick = async () => {
    // 1. Client-side Pre-checks

    try {
      setIsInitializing(true);

      // 2. GET AUTHORITY FROM BACKEND
      // We send our intent, backend validates and creates the PENDING record
      const response = await api.post('/v1/payments/initialize', {
        applicationId,
        amount: payableAmount,
      });

      const backendData = response.data;
      console.log("backend data", backendData)

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
        }
      };
      const initializePayment = usePaystackPayment(paymentArgs);
      initializePayment({
      onSuccess,
      onClose,
    });

      //initializePaystack(paymentArgs);;

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

  /*const handlePaymentClick = async () => {
    try {
      setIsInitializing(true);
      const response = await api.post('/v1/payments/initialize', {
        applicationId,
        amount: payableAmount,
      });

      const { reference, amount: backendAmount, email: backendEmail } = response.data;
      
      const config: any = {
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_aeda5f517067e18dcc905a5193b7f68b87f9e51b',
        email: backendEmail || userEmail,
        amount: backendAmount,
        reference: reference,
        metadata: { applicationId, paymentPlan, expectedAmount: payableAmount }
      };
      console.log("config", config);

      const handler = (window as any).PaystackPop.setup({
        ...config,
        callback: (res: any) => {
          navigate(`/dashboard/payment/verifying?reference=${res.reference}`);
        },
        onClose: () => setIsInitializing(false),
      });
      handler.openIframe();
    } catch (err: any) {
      setStatusModal({ show: true, title: "Error", message: "Initialization failed." });
    } finally {
      setIsInitializing(false);
    }
  };*/

  return (
    <div className="max-w-2xl mx-auto p-12 text-center space-y-8 animate-in fade-in duration-500">
      
      <div className="inline-block p-8 bg-emerald-50 rounded-[2.5rem] border-4 border-slate-900 text-emerald-600 shadow-[8px_8px_0px_0px_#10b981]">
        <ShieldCheck size={64} strokeWidth={3} />
      </div>

      <h1 className="text-3xl sm:text-5xl font-black uppercase italic text-slate-900 leading-[0.95]">
        Complete <br /> Registration
      </h1>

      {/* THE BOX YOU ASKED TO KEEP INTACT */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#fda4af] text-left space-y-4">
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Total Fee</span>
          <span className="font-black italic">₦{totalAmount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between border-b border-slate-700 pb-4">
          <span className="font-bold text-slate-400">Amount Paid</span>
          <span className="font-black italic text-emerald-400">₦{amountPaid.toLocaleString()}</span>
        </div>

        <div className="flex justify-between pt-2">
          <span className="font-bold text-slate-400 uppercase text-xs">Remaining Balance</span>
          <span className="text-3xl font-black text-rose-400 italic">{formattedRemaining}</span>
        </div>

        {/* EXTRA SUPPORT ONLY FOR FULL PLAN */}
        {paymentPlan === 'FULL' && payableAmount > remainingBalance && (
          <div className="flex justify-between pt-2 border-t border-slate-700 mt-2 animate-pulse">
            <span className="font-bold text-emerald-400 uppercase text-[10px]">Extra Support Contribution</span>
            <span className="font-black text-emerald-400">+ ₦{(payableAmount - remainingBalance).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* INPUT FIELD */}
      <div className="text-left space-y-2">
        <label className="text-xs font-black uppercase text-slate-500">
          {paymentPlan === 'FULL' ? 'Adjust Payment / Extra Support' : 'Custom Amount'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₦</span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={payableAmount.toString()}
            className="w-full p-6 pl-12 border-4 border-slate-900 rounded-2xl font-black text-2xl focus:ring-8 focus:ring-emerald-500/10 outline-none transition-all"
          />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase italic">
          {requiresInitialDeposit 
            ? `Minimum ₦${initialPartialAmount.toLocaleString()} (50%) required` 
            : paymentPlan === 'FULL' 
              ? 'Enter amount ≥ balance for extra support.' 
              : 'Enter amount up to the balance.'}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="space-y-4">
        <button
          onClick={handlePaymentClick}
          disabled={isInitializing || isInvalidAmount}
          className="w-full py-8 text-3xl font-black bg-emerald-500 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] hover:shadow-none hover:translate-y-1 active:scale-95 transition-all uppercase italic disabled:opacity-50"
        >
          {isInitializing ? 'INITIALIZING...' : `Pay ${formattedPayable}`}
        </button>

        {canCancelRegistration && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-4 text-sm font-black text-slate-400 uppercase hover:text-rose-500 transition-colors"
          >
            Cancel Registration
          </button>
        )}
      </div>

      {/* MODALS RENDERED HERE (CancelConfirm & StatusModal) */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm text-left">
          <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_#0f172a] space-y-6">
            <h2 className="text-3xl font-black uppercase italic">Cancel?</h2>
            <p className="font-bold text-slate-600 italic uppercase text-sm">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-4 border-4 border-slate-900 bg-slate-200 font-black rounded-xl uppercase">Back</button>
              <button onClick={handleCancelRegistration} className="flex-1 py-4 border-4 border-slate-900 bg-rose-500 text-white font-black italic rounded-xl uppercase">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {statusModal?.show && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6 text-left">
          <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_#0f172a] space-y-6">
            <h2 className="text-2xl font-black uppercase italic text-rose-500 italic">{statusModal.title}</h2>
            <p className="font-bold text-slate-600 italic uppercase text-sm">{statusModal.message}</p>
            <button onClick={() => setStatusModal(null)} className="w-full py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase rounded-2xl">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
};