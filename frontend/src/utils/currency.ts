export const formatCurrency = (amount: number): string => {
  // Para números negativos, formateamos el valor absoluto y luego agregamos el signo antes de la moneda
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  const formattedNumber = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absoluteAmount);
  
  if (isNegative) {
    return `Bs -${formattedNumber}`;
  }
  return `Bs ${formattedNumber}`;
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-BO').format(value);
};

/**
 * Calcula el porcentaje
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Parsea un string de moneda a número
 */
export const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(numericValue) || 0;
};