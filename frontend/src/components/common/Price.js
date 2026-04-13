import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useExchangeRate } from "../../hooks/useExchangeRate";
const Price = ({ amount, size = "md", className = "", showGs = true }) => {
    const { gsRate, loading } = useExchangeRate();
    const gs = amount * gsRate;
    const sizeClasses = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
    };
    const formatGs = (num) => {
        return num.toLocaleString("es-PY", { minimumFractionDigits: 0 });
    };
    return (_jsxs("span", { className: `inline-flex items-baseline gap-1 ${className}`, children: [_jsxs("span", { className: `font-bold text-green-600 ${sizeClasses[size]}`, children: ["$", amount.toFixed(2)] }), showGs && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-gray-400 text-xs", children: "|" }), _jsxs("span", { className: `text-gray-500 ${sizeClasses[size]}`, children: ["Gs. ", formatGs(gs)] })] })), loading && _jsx("span", { className: "text-gray-400 text-xs", children: "..." })] }));
};
export default Price;
