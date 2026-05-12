// apps/web/src/pages/admin/AdminRevenuePage.tsx

import { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import api from '@/services/api';

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export const AdminRevenuePage = () => {
  const loaderData = useLoaderData() as any;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [page, setPage] = useState(1);

  /**
   * -------------------------------------------
   * REVENUE OVERVIEW
   * -------------------------------------------
   */

  const overviewQuery = useQuery({
    queryKey: ['revenue-overview'],

    queryFn: async () => {
      const response = await api.get(
        '/admin/revenue/overview',
      );

      return response.data.data;
    },

    initialData: loaderData.overview,

    refetchInterval: 30000,
  });

  /**
   * -------------------------------------------
   * TRANSACTIONS
   * -------------------------------------------
   */

  const transactionsQuery = useQuery({
    queryKey: [
      'revenue-transactions',
      search,
      status,
      method,
      page,
    ],

    queryFn: async () => {
      const response = await api.get(
        '/admin/revenue/transactions',
        {
          params: {
            page,
            limit: 10,
            search: search || undefined,
            status: status || undefined,
            method: method || undefined,
          },
        },
      );

      return response.data.data;
    },

    initialData: loaderData.transactions,

    refetchInterval: 30000,
  });

  const overview = overviewQuery.data;

  const transactions = transactionsQuery.data?.data || [];

  const pagination = transactionsQuery.data?.meta;

  const summaryCards = useMemo(() => {
    return [
      {
        label: 'Gross Revenue',
        value: currency.format(
          overview.summary.grossRevenue,
        ),

        icon: Wallet,

        bg: 'bg-emerald-400',
      },

      {
        label: 'Net Revenue',
        value: currency.format(
          overview.summary.netRevenue,
        ),

        icon: ArrowUpRight,

        bg: 'bg-sky-400',
      },

      {
        label: 'Pending Settlement',
        value: currency.format(
          overview.summary.pendingSettlement,
        ),

        icon: Clock3,

        bg: 'bg-amber-400',
      },

      {
        label: 'Failed Transactions',
        value:
          overview.summary.failedTransactions,

        icon: XCircle,

        bg: 'bg-rose-400',
      },
    ];
  }, [overview]);

  return (
    <div className="space-y-10 pb-20">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="relative overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">

        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 blur-3xl rounded-full" />

        <div className="relative flex items-center justify-between">

          <div>
            <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">
              PAYSTACK REVENUE OPERATIONS
            </p>

            <h1 className="text-5xl font-black text-white uppercase italic mt-3">
              Revenue Console
            </h1>

            <p className="text-slate-400 font-bold mt-4 max-w-2xl">
              Real-time transaction monitoring,
              settlement visibility, payment
              intelligence and explorer financial
              operations.
            </p>
          </div>

          <button
            onClick={() => {
              overviewQuery.refetch();
              transactionsQuery.refetch();
            }}
            className="bg-emerald-400 text-slate-900 border-4 border-white rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-3"
          >
            <RefreshCw size={18} />
            Refresh Ledger
          </button>
        </div>
      </header>

      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                    {card.label}
                  </p>

                  <h2 className="text-3xl font-black text-slate-900 mt-4">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`${card.bg} w-14 h-14 rounded-2xl border-4 border-slate-900 flex items-center justify-center`}
                >
                  <Icon
                    size={24}
                    className="text-slate-900"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================================================= */}
      {/* SETTLEMENT + SUCCESS */}
      {/* ================================================= */}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div className="xl:col-span-2 bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">
                Settlement Balance
              </p>

              <h2 className="text-6xl font-black text-slate-900 mt-4">
                {currency.format(
                  overview.settlements
                    .availableBalance,
                )}
              </h2>

              <p className="mt-6 text-slate-500 font-bold">
                Estimated next payout:
              </p>

              <p className="text-xl font-black text-emerald-500">
                {new Date(
                  overview.settlements
                    .estimatedNextPayoutDate,
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-emerald-400 border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              <Wallet
                size={60}
                className="text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">

          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
            Success Rate
          </p>

          <h2 className="text-7xl font-black mt-6">
            {overview.summary.successRate}%
          </h2>

          <div className="mt-8 h-4 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{
                width: `${overview.summary.successRate}%`,
              }}
            />
          </div>

          <div className="mt-8 space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">
                Successful
              </span>

              <span className="font-black">
                {
                  overview.summary
                    .successfulTransactions
                }
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">
                Failed
              </span>

              <span className="font-black text-rose-400">
                {
                  overview.summary
                    .failedTransactions
                }
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* TRANSACTION TABLE */}
      {/* ================================================= */}

      <section className="bg-white border-4 border-slate-900 rounded-[3rem] shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] overflow-hidden">

        {/* HEADER */}

        <div className="p-8 border-b-4 border-slate-900 bg-slate-50">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            <div>
              <h2 className="text-3xl font-black uppercase italic text-slate-900">
                Transaction Ledger
              </h2>

              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">
                Parent + Explorer payment intelligence
              </p>
            </div>

            <div className="flex flex-wrap gap-4">

              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  placeholder="Search parent, child or reference..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-80 bg-white border-4 border-slate-900 rounded-2xl h-14 pl-12 pr-4 font-bold outline-none"
                />
              </div>

              {/* STATUS */}

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="bg-white border-4 border-slate-900 rounded-2xl px-5 font-black uppercase text-xs"
              >
                <option value="">
                  All Status
                </option>

                <option value="SUCCESSFUL">
                  Successful
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

              {/* METHOD */}

              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value)
                }
                className="bg-white border-4 border-slate-900 rounded-2xl px-5 font-black uppercase text-xs"
              >
                <option value="">
                  All Methods
                </option>

                <option value="PAYSTACK">
                  PAYSTACK
                </option>

                <option value="BANK_TRANSFER">
                  BANK TRANSFER
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-slate-100 border-b-4 border-slate-900">

              <tr className="text-left">

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Transaction
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Parent
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Explorers
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Session
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Amount
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Status
                </th>

                <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-slate-500">
                  Method
                </th>
              </tr>
            </thead>

            <tbody>

              {transactions.map((transaction: any) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >

                  {/* TRANSACTION */}

                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-slate-900">
                        {transaction.externalReference ||
                          transaction.id}
                      </p>

                      <p className="text-xs text-slate-400 font-bold mt-1">
                        {new Date(
                          transaction.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </td>

                  {/* PARENT */}

                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-slate-900">
                        {transaction.parent?.name || 'N/A'}
                      </p>

                      <p className="text-xs text-slate-400 font-bold">
                        {transaction.parent.email}
                      </p>
                    </div>
                  </td>

                  {/* CHILDREN */}

                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">

                      {transaction.children.map(
                        (child: any) => (
                          <div
                            key={child.id}
                            className="bg-sky-100 border-2 border-slate-900 rounded-full px-3 py-1"
                          >
                            <p className="text-xs font-black text-slate-900">
                              {child.fullName}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </td>

                  {/* SESSION */}

                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900">
                      {transaction.session?.name || 'N/A'}
                    </p>
                  </td>

                  {/* AMOUNT */}

                  <td className="px-8 py-6">
                    <p className="text-xl font-black text-slate-900">
                      {currency.format(
                        transaction.amount,
                      )}
                    </p>
                  </td>

                  {/* STATUS */}

                  <td className="px-8 py-6">

                    {transaction.status ===
                    'SUCCESSFUL' ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 border-2 border-emerald-500 rounded-full px-4 py-2">
                        <CheckCircle2 size={16} />

                        <span className="font-black text-xs uppercase">
                          Successful
                        </span>
                      </div>
                    ) : transaction.status ===
                      'FAILED' ? (
                      <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 border-2 border-rose-500 rounded-full px-4 py-2">
                        <XCircle size={16} />

                        <span className="font-black text-xs uppercase">
                          Failed
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 border-2 border-amber-500 rounded-full px-4 py-2">
                        <Clock3 size={16} />

                        <span className="font-black text-xs uppercase">
                          Pending
                        </span>
                      </div>
                    )}
                  </td>

                  {/* METHOD */}

                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-4 py-2">
                      <CreditCard size={14} />

                      <span className="font-black text-xs uppercase">
                        {transaction.method}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex items-center justify-between p-8 border-t-4 border-slate-900 bg-slate-50">

          <p className="font-bold text-slate-500">
            Showing page {pagination.page} of{' '}
            {pagination.totalPages}
          </p>

          <div className="flex gap-4">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className="w-12 h-12 border-4 border-slate-900 rounded-2xl bg-white flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              disabled={
                page >= pagination.totalPages
              }
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className="w-12 h-12 border-4 border-slate-900 rounded-2xl bg-white flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};