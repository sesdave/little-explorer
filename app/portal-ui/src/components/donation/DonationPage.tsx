import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { usePaystackPayment } from 'react-paystack';

export const DonationPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | ''>('');
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string } | null>(null);

  const suggestions = [2000, 5000, 10000, 20000];

  // 1. Initial Empty Config
  const [paystackConfig] = useState<any>({
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: '',
    amount: 0,
    reference: '',
  });

  // 2. Initialize Hook at the top level (REQUIRED BY REACT RULES)
  //const initializePayment = usePaystackPayment(paystackConfig);

  // 3. Success Handler - This will now be triggered by Paystack
  const onSuccess = (reference: any) => {
    console.log("Payment Successful! Redirecting...", reference);
    // Use window.location for a hard redirect if navigate feels "stuck" due to the iframe
    window.location.href = `/dashboard/payment/verifying?reference=${reference.reference}`;
  };

  const onClose = () => {
    console.log("Payment window closed");
  };

  // --- MUTATION ---
  const { mutate: initializeDonation, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.post('/v1/payments/initialize-donation', {
        amount: Number(amount),
        donorName: donorName || "Anonymous",
        message
      });
      return response.data;
    },
    onSuccess: (data) => {
      // 4. Build the final config with data from the Backend
      console.log("returned data", data)
      const finalConfig = {
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: data.email || 'donor@vbs.com',
        amount: data.amount, // Kobo
        reference: data.reference,
        metadata: { 
          donorName, 
          message,
          custom_fields: [
            { display_name: "Donor Name", variable_name: "donor_name", value: donorName || "Anonymous" }
          ]
        },
      };

      // 5. TRIGGER THE POPUP
      // We pass (successCallback, closeCallback, configOverride)
      // @ts-ignore
      const initializePayment = usePaystackPayment(finalConfig);
      initializePayment({
      onSuccess,
      onClose,
    });
    },
    onError: (error: any) => {
      console.log("error", error)
      setErrorModal({
        show: true,
        message: error.response?.data?.message || "Could not initialize donation. Please try again."
      });
    }
  });

  const handleGiveNow = () => {
    if (!amount || amount < 100) {
      setErrorModal({ show: true, message: "Minimum donation is ₦100" });
      return;
    }
    initializeDonation();
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 py-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-100 border-4 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_#0f172a]">
          <Sparkles className="text-amber-600" size={32} />
        </div>
        <h1 className="text-4xl font-black uppercase italic text-slate-900">Partner With Us</h1>
        <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">Your one-time gift makes VBS possible</p>
      </div>

      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_#0f172a] space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-400">Select or Enter Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAmount(s)}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  amount === s 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_#475569]' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-900'
                }`}
              >
                ₦{s.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full pl-10 pr-4 py-4 border-4 border-slate-900 rounded-2xl font-black text-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Donor Name (Optional)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold focus:border-slate-900 outline-none transition-colors"
          />
          <textarea
            placeholder="Add a short note of encouragement..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold focus:border-slate-900 outline-none transition-colors resize-none"
            rows={2}
          />
        </div>

        <button
          onClick={handleGiveNow}
          disabled={isPending || !amount}
          className="w-full py-6 bg-emerald-500 text-white border-4 border-slate-900 rounded-2xl font-black text-xl uppercase italic shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isPending ? "Connecting..." : (
            <>
              Confirm Donation <Heart size={24} fill="currentColor" />
            </>
          )}
        </button>
      </div>

      <button 
        onClick={() => navigate(-1)}
        className="w-full py-4 font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase text-xs"
      >
        ← Go Back
      </button>

      {errorModal?.show && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-[2rem] p-8 shadow-[10px_10px_0px_0px_#0f172a] space-y-6">
            <div className="flex items-center gap-4 text-rose-500">
              <AlertCircle size={40} strokeWidth={3} />
              <h2 className="text-2xl font-black uppercase italic">Oops!</h2>
            </div>
            <p className="font-bold text-slate-600">{errorModal.message}</p>
            <button
              onClick={() => setErrorModal(null)}
              className="w-full py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase rounded-2xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};