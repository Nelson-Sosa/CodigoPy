import React from 'react';
import { getCurrencyConfig, formatCurrency } from '../../utils/currencyConfig';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  size = 'md',
  showFlag = true,
  className = '',
}) => {
  const config = getCurrencyConfig(currency);
  const formattedAmount = formatCurrency(amount, currency);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const flagEmojis: Record<string, string> = {
    USD: '🇺🇸',
    PYG: '🇵🇾',
    ARS: '🇦🇷',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showFlag && (
        <span 
          className={`${sizeClasses[size]} select-none`}
          style={{ lineHeight: 1 }}
        >
          {flagEmojis[currency] || ''}
        </span>
      )}
      <span className={`${sizeClasses[size]} font-medium text-gray-700`}>
        {formattedAmount}
      </span>
      {currency !== 'USD' && (
        <span className={`${sizeClasses[size]} text-gray-400`}>
          {config.symbol}
        </span>
      )}
    </div>
  );
};

interface CurrencyRowProps {
  amount: number;
  currency: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({
  amount,
  currency,
  label,
  size = 'md',
}) => {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-gray-500 text-sm">{label}</span>}
      <CurrencyDisplay amount={amount} currency={currency} size={size} />
    </div>
  );
};

export default CurrencyDisplay;
