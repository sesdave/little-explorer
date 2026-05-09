// routes/adminRevenueLoader.ts

import api from '@/services/api';

export const adminRevenueLoader = async () => {
  const [
    overviewResponse,
    transactionResponse,
  ] = await Promise.all([
    api.get('v1/admin/revenue/overview'),

    api.get('v1/admin/revenue/transactions'),
  ]);

  return {
    overview: overviewResponse.data.data,

    transactions:
      transactionResponse.data.data,
  };
};