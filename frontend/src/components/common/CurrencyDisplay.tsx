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
  const symbolColor = darkMode ? 'text-gray-400' : 'text-gray-400';

  return (
    <div
      className={`inline-flex items-center ${styles.gap} ${className}`}
      style={{ display: 'inline-flex', visibility: 'visible' } as React.CSSProperties}
    >
      {showFlag !== false && (
        <div
          className={`${styles.flag} flex-shrink-0`}
          style={{ display: 'block', visibility: 'visible' } as React.CSSProperties}
        >
          <img
            src={`/flags/${config.code}.svg`}
            alt={config.name}
            title={config.name}
            className="w-full h-full object-contain"
            style={{
              display: 'block',
              visibility: 'visible',
              minWidth: '16px',
              minHeight: '12px',
            } as React.CSSProperties}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <span className={`${styles.text} font-semibold ${textColor} whitespace-nowrap`}>
        {formattedAmount}
      </span>
      {currency !== 'USD' && (
        <span className={`${styles.text} ${symbolColor} whitespace-nowrap`}>
          {config.symbol}
        </span>
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
    <div
      className="flex items-center justify-between"
      style={{ display: 'flex', visibility: 'visible' } as React.CSSProperties}
    >
      {label && (
        <span className={`text-sm ${labelColor}`}>{label}</span>
      )}
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
