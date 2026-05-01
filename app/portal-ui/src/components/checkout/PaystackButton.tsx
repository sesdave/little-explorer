// apps/portal-ui/src/components/checkout/PaystackButton.tsx

interface PaystackButtonProps {
  amount: number;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export const PaystackButton = ({ amount }: PaystackButtonProps) => {
  // Paystack often expects Kobo/Cents (amount * 100), 
  // but for the UI display, we keep it as a clean decimal.
  const formattedAmount = amount.toLocaleString();

  return (
    <button 
      type="button"
      className="w-full bg-[#09A5DB] text-white font-black py-5 rounded-[2rem] border-b-8 border-[#0682ad] flex items-center justify-center gap-3 shadow-xl hover:translate-y-1 hover:border-b-4 transition-all active:translate-y-2 active:border-b-0"
    >
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#09A5DB] text-sm font-black">
        P
      </div>
      <span>Pay ${formattedAmount} with Paystack</span>
    </button>
  );
};