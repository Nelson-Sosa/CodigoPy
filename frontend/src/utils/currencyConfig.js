export const currencies = {
    USD: {
        code: 'USD',
        name: 'Dólar',
        symbol: '$',
        flag: '🇺🇸',
        locale: 'en-US',
        decimals: 2,
    },
    PYG: {
        code: 'PYG',
        name: 'Guaraní',
        symbol: 'Gs',
        flag: '🇵🇾',
        locale: 'es-PY',
        decimals: 0,
    },
    ARS: {
        code: 'ARS',
        name: 'Peso',
        symbol: 'AR$',
        flag: '🇦🇷',
        locale: 'es-AR',
        decimals: 2,
    },
};
export const getCurrencyConfig = (code) => {
    return currencies[code] || currencies.USD;
};
export const formatCurrency = (amount, currencyCode) => {
    const config = getCurrencyConfig(currencyCode);
    return new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
    }).format(amount);
};
