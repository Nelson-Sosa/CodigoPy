import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { settingsService } from "../../services/api";
const Price = ({ amount, size = "md", className = "", showGs = true }) => {
    const [exchangeRate, setExchangeRate] = useState(6600);
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await settingsService.get();
                if (res.data?.exchangeRate) {
                    setExchangeRate(res.data.exchangeRate);
                }
            }
            catch (err) {
                console.log("Using default exchange rate");
            }
        };
        fetchRate();
    }, []);
    const gs = amount * exchangeRate;
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
    return (_jsxs("span", { className: `inline-flex items-baseline gap-1 ${className}`, children: [_jsxs("span", { className: `font-bold text-green-600 ${sizeClasses[size]}`, children: ["$", amount.toFixed(2)] }), showGs && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-gray-400 text-xs", children: "|" }), _jsxs("span", { className: `text-gray-500 ${sizeClasses[size]}`, children: ["Gs. ", formatGs(gs)] })] }))] }));
};
export default Price;
