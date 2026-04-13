export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flagSvg: React.ReactNode;
  locale: string;
  decimals: number;
}

const USFlag = () => (
  <svg viewBox="0 0 60 40" className="w-6 h-4 rounded-sm">
    <rect width="60" height="40" fill="#B22234"/>
    <rect y="3.08" width="60" height="3.08" fill="#fff"/>
    <rect y="9.23" width="60" height="3.08" fill="#fff"/>
    <rect y="15.38" width="60" height="3.08" fill="#fff"/>
    <rect y="21.54" width="60" height="3.08" fill="#fff"/>
    <rect y="27.69" width="60" height="3.08" fill="#fff"/>
    <rect width="24" height="22" fill="#3C3B6E"/>
    {Array.from({length: 5}).map((_, i) => 
      Array.from({length: 6}).map((_, j) => (
        <polygon key={`${i}-${j}`} points={`${4+j*3.5},${2+i*4} ${5+j*3.5},${4+i*4} ${3+j*3.5},${4+i*4}`} fill="#fff"/>
      ))
    )}
  </svg>
);

const PYFlag = () => (
  <svg viewBox="0 0 60 40" className="w-6 h-4 rounded-sm">
    <rect width="20" height="40" fill="#D52B1E"/>
    <rect x="20" width="20" height="40" fill="#fff"/>
    <rect x="40" width="20" height="40" fill="#0038A8"/>
    <circle cx="30" cy="20" r="8" fill="#EAC102"/>
    <circle cx="30" cy="20" r="6" fill="none" stroke="#EAC102" strokeWidth="0.5"/>
  </svg>
);

const ARFlag = () => (
  <svg viewBox="0 0 60 40" className="w-6 h-4 rounded-sm">
    <rect width="60" height="13.33" fill="#74ACDF"/>
    <rect y="13.33" width="60" height="13.33" fill="#fff"/>
    <rect y="26.67" width="60" height="13.33" fill="#74ACDF"/>
    <circle cx="30" cy="20" r="5" fill="#F6B30D"/>
    <polygon points="30,14 32,19 30,18 28,19" fill="#F6B30D"/>
    <polygon points="30,26 32,21 30,22 28,21" fill="#F6B30D"/>
  </svg>
);

export const currencies: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'Dólar',
    symbol: '$',
    flagSvg: <USFlag />,
    locale: 'en-US',
    decimals: 2,
  },
  PYG: {
    code: 'PYG',
    name: 'Guaraní',
    symbol: 'Gs',
    flagSvg: <PYFlag />,
    locale: 'es-PY',
    decimals: 0,
  },
  ARS: {
    code: 'ARS',
    name: 'Peso',
    symbol: 'AR$',
    flagSvg: <ARFlag />,
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
