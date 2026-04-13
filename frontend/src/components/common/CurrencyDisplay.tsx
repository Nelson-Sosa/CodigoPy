import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currency: 'USD' | 'PYG' | 'ARS';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  className?: string;
  darkMode?: boolean;
}

const currencyConfig = {
  USD: {
    code: 'us',
    name: 'Dólar',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  },
  PYG: {
    code: 'py',
    name: 'Guaraní',
    symbol: 'Gs',
    locale: 'es-PY',
    decimals: 0,
  },
  ARS: {
    code: 'ar',
    name: 'Peso Argentino',
    symbol: 'AR$',
    locale: 'es-AR',
    decimals: 2,
  },
};

const formatCurrency = (amount: number, locale: string, decimals: number) => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  size = 'md',
  showFlag = true,
  className = '',
  darkMode = false,
}) => {
  const config = currencyConfig[currency];
  const formattedAmount = formatCurrency(amount, config.locale, config.decimals);

  const sizeStyles = {
    sm: {
      text: 'text-xs',
      flag: 'w-5 h-3.5',
      gap: 'gap-1',
    },
    md: {
      text: 'text-sm',
      flag: 'w-6 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      text: 'text-base',
      flag: 'w-7 h-5',
      gap: 'gap-2',
    },
  };

  const styles = sizeStyles[size];

  const textColor = darkMode ? 'text-gray-100' : 'text-gray-700';
  const symbolColor = 'text-gray-400';

  // 🔥 SOLUCIÓN CLAVE
  const flagSrc = `${import.meta.env.BASE_URL}flags/${config.code}.svg`;

  return (
    <div className={`inline-flex items-center ${styles.gap} ${className}`}>
      {showFlag && (
        <div className="flex items-center gap-1">
          <img
            src={flagSrc}
            alt={config.name}
            title={config.name}
            className={`${styles.flag} object-contain`}
            style={{
              minWidth: '16px',
              minHeight: '12px',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `${import.meta.env.BASE_URL}flags/us.svg`;
            }}
          />
          <span className={`${styles.text} font-semibold ${textColor} whitespace-nowrap`}>
            ({formattedAmount})
          </span>
          <span className={`${styles.text} font-semibold ${textColor}`}>
            {config.code.toUpperCase()}
          </span>
          {currency !== 'USD' && (
            <span className={`${styles.text} ${symbolColor} whitespace-nowrap`}>
              {config.symbol}
            </span>
          )}
        </div>
      )}

      {!showFlag && (
        <div className="flex items-center gap-1">
          <span className={`${styles.text} font-semibold ${textColor} whitespace-nowrap`}>
            {formattedAmount}
          </span>
          {currency !== 'USD' && (
            <span className={`${styles.text} ${symbolColor} whitespace-nowrap`}>
              {config.symbol}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface CurrencyRowProps {
  amount: number;
  currency: 'USD' | 'PYG' | 'ARS';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({
  amount,
  currency,
  label,
  size = 'md',
  darkMode = false,
}) => {
  const labelColor = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="flex items-center justify-between">
      {label && <span className={`text-sm ${labelColor}`}>{label}</span>}

      <CurrencyDisplay
        amount={amount}
        currency={currency}
        size={size}
        darkMode={darkMode}
      />
    </div>
  );
};

export default CurrencyDisplay;