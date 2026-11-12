export const formatCurrency = (val: number, decimals: number = 0): string => {
  if (isNaN(val) || !isFinite(val)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
};

export const formatPercent = (val: number, decimals: number = 2): string => {
  if (isNaN(val) || !isFinite(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
};

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDuration = (totalMonths: number): string => {
  const years = Math.floor(totalMonths / 12);
  const months = Math.round(totalMonths % 12);
  
  if (years === 0) return `${months} mo${months === 1 ? '' : 's'}`;
  if (months === 0) return `${years} yr${years === 1 ? '' : 's'}`;
  return `${years} yr${years === 1 ? '' : 's'} ${months} mo${months === 1 ? '' : 's'}`;
};
