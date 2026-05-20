export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-BO').format(value);
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

export const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(numericValue) || 0;
};