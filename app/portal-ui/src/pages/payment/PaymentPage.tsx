// apps/web/src/pages/payment/PaymentPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import api from '@/services/api';

export const PaymentPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  // Expecting application details from your loader (amount, email, etc.)
  const { application, userEmail } = useLoaderData() as any;

  const config = {
  reference: `explorer_${applicationId}_${new Date().getTime()}`,
  email: userEmail,
  amount: Math.round(Number(application.totalAmount) * 100),
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  metadata: {
    applicationId,
    custom_fields: [
      { display_name: "Application ID", variable_name: "application_id", value: applicationId }
    ]
  }
};

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    // 🏛️ Principal Move: Don't confirm yet. Inform user we are verifying.
    navigate(`/payment/verifying?reference=${reference.reference}`);
  };

  const onClose = () => {
    console.log('Payment window closed');
  };

  return (
    <div className="max-w-2xl mx-auto p-12 text-center space-y-8">
      <div className="inline-block p-8 bg-emerald-50 rounded-[2.5rem] border-4 border-emerald-500 text-emerald-600 mb-4 shadow-[8px_8px_0px_0px_#10b981]">
        <ShieldCheck size={64} strokeWidth={3} />
      </div>
      
      <h1 className="text-5xl font-black uppercase italic text-slate-900 leading-tight">
        Final Step: <br /> Secure the Spots
      </h1>

      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#fda4af]">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
          <p className="font-black uppercase tracking-widest text-slate-400">Amount Due</p>
          <p className="text-3xl font-black text-rose-400">${Number(application.totalAmount).toLocaleString()}</p>
        </div>
        <p className="text-sm text-slate-400 italic">Reference: {applicationId}</p>
      </div>

      <button 
        //onClick={() => initializePayment(onSuccess, onClose)}
        className="w-full py-8 text-3xl font-black bg-emerald-500 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] hover:shadow-none hover:translate-y-1 transition-all uppercase italic"
      >
        Pay with Paystack
      </button>
      
      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
        Secure Transaction via Paystack • 256-bit Encryption
      </p>
    </div>
  );
};