const DEFAULT_EXCHANGE_RATE = 6600;

export const formatPrice = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatGs = (amount: number): string => {
  return (amount * DEFAULT_EXCHANGE_RATE).toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const priceDisplay = (amount: number): string => {
  return `$${formatPrice(amount)} | Gs. ${formatGs(amount)}`;
};

export const priceGs = (amount: number): string => {
  return `Gs. ${formatGs(amount)}`;
};
