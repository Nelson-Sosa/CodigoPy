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

  const flagSizes = {
    sm: 'w-5 h-4 rounded-sm',
    md: 'w-6 h-4 rounded',
    lg: 'w-8 h-5 rounded',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showFlag && (
        <img
          src={config.flagUrl}
          alt={config.name}
          title={config.name}
          className={`${flagSizes[size]} object-cover`}
        />
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
