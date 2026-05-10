import { Receipt } from 'lucide-react';

type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number;
  createdAt: string;
};

type Props = {
  payments: Payment[];
  currency?: 'USD' | 'NGN';
};

const formatCurrency = (amount: number, currency: 'USD' | 'NGN') => {
  if (currency === 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const RecentPaymentsCard = ({
  payments,
  currency = 'NGN',
}: Props) => {
  return (
    <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-emerald-400 border-2 border-slate-900 rounded-lg">
          <Receipt size={18} className="text-slate-900" />
        </div>
        <h3 className="font-black uppercase text-sm tracking-tight">
          Recent Payments
        </h3>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {payments?.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="group cursor-pointer">

              <div className="flex justify-between items-start">

                <div>
                  <p className="font-black text-xs uppercase text-slate-900">
                    {payment.method}
                  </p>

                  <p className="text-[10px] font-bold text-slate-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-black text-xs">
                    {formatCurrency(payment.amount, currency)}
                  </p>

                  <span className="text-[9px] font-black uppercase text-emerald-500">
                    {payment.status}
                  </span>
                </div>

              </div>

              <div className="mt-2 h-1 w-0 group-hover:w-full bg-slate-100 transition-all duration-300" />
            </div>
          ))
        ) : (
          <p className="text-[10px] font-bold text-slate-400 uppercase italic">
            No transactions yet
          </p>
        )}
      </div>

      {/* FOOTER */}
      <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">
        View All Billing
      </button>
    </div>
  );
};