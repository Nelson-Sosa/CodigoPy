import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getCurrencyConfig, formatCurrency } from '../../utils/currencyConfig';
const CurrencyDisplay = ({ amount, currency, size = 'md', showFlag = true, className = '', }) => {
    const config = getCurrencyConfig(currency);
    const formattedAmount = formatCurrency(amount, currency);
    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };
    const flagSizes = {
        sm: 'w-4 h-4 text-xs',
        md: 'w-5 h-5 text-sm',
        lg: 'w-6 h-6 text-base',
    };
    return (_jsxs("div", { className: `inline-flex items-center gap-1.5 ${className}`, children: [showFlag && (_jsx("span", { className: `${flagSizes[size]} leading-none`, title: config.name, children: config.flag })), _jsx("span", { className: `${sizeClasses[size]} font-medium text-gray-700`, children: formattedAmount }), currency !== 'USD' && (_jsx("span", { className: `${sizeClasses[size]} text-gray-400`, children: config.symbol }))] }));
};
export const CurrencyRow = ({ amount, currency, label, size = 'md', }) => {
    return (_jsxs("div", { className: "flex items-center justify-between", children: [label && _jsx("span", { className: "text-gray-500 text-sm", children: label }), _jsx(CurrencyDisplay, { amount: amount, currency: currency, size: size })] }));
};
export default CurrencyDisplay;
