const DEFAULT_EXCHANGE_RATE = 6600;
export const formatPrice = (amount) => {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
export const formatGs = (amount) => {
    return (amount * DEFAULT_EXCHANGE_RATE).toLocaleString('es-PY', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
export const priceDisplay = (amount) => {
    return `$${formatPrice(amount)} | Gs. ${formatGs(amount)}`;
};
export const priceGs = (amount) => {
    return `Gs. ${formatGs(amount)}`;
};
