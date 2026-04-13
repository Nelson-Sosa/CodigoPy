export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const currencies: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'Dólar',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  },
  PYG: {
    code: 'PYG',
    name: 'Guaraní',
    symbol: 'Gs',
    locale: 'es-PY',
    decimals: 0,
  },
  ARS: {
    code: 'ARS',
    name: 'Peso',
    symbol: 'AR$',
    locale: 'es-AR',
    decimals: 2,
  },
};

export const getCurrencyConfig = (code: string): CurrencyConfig => {
  return currencies[code] || currencies.USD;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
};
