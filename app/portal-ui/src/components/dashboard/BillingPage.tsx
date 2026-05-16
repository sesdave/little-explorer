// apps/web/src/pages/dashboard/BillingPage.tsx
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, CheckCircle, AlertCircle } from 'lucide-react';

export const BillingPage = () => {
  const navigate = useNavigate();
  const familyData = useLoaderData() as any;
  const payments = familyData?.recentPayments || [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20 animate-in fade-in duration-300">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={3} /> Back to Dashboard
      </button>

      {/* HEADER SECTION */}
      <header className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">
            Billing History
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mt-1">
            Complete Ledger Statement & Payment Logs
          </p>
        </div>
        <div className="bg-sky-100 text-sky-600 p-4 rounded-2xl border-2 border-slate-900 font-black text-xs uppercase tracking-tight self-start sm:self-auto">
          Total Transactions: {payments.length}
        </div>
      </header>

      {/* MAIN TRANSACTIONS TABLE / LIST */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_0px_0px_#0f172a] space-y-6">
        {payments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="inline-block p-4 bg-slate-100 rounded-full text-slate-400">
              <Receipt size={32} />
            </div>
            <p className="font-black uppercase text-slate-400 text-sm italic">
              No statement entries found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => {
              const isSuccess = payment.status === 'SUCCESSFUL' || payment.status === 'SUCCESS';
              return (
                <div
                  key={payment.id || payment.reference}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-5 border-4 border-slate-900 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] ${
                      isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm sm:text-base">
                        {payment.purpose || 'Registration Payment'}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-0.5">
                        REF: <span className="font-mono text-slate-600">{payment.reference}</span>
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">
                        {payment.createdAt ? formatDate(payment.createdAt) : 'Date unavailable'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                    <span className="text-xl font-black italic text-slate-900">
                      {formatCurrency(Number(payment.amount || 0))}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border border-slate-900 mt-1 tracking-wider ${
                      isSuccess ? 'bg-emerald-400 text-slate-900' : 'bg-amber-300 text-slate-900'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};