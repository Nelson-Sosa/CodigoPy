import { useEffect, useState } from "react";
import { settingsService } from "../../services/api";

interface PriceProps {
  amount: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGs?: boolean;
}

const Price: React.FC<PriceProps> = ({ 
  amount, 
  size = "md", 
  className = "",
  showGs = true 
}) => {
  const [exchangeRate, setExchangeRate] = useState(6600);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await settingsService.get();
        if (res.data?.exchangeRate) {
          setExchangeRate(res.data.exchangeRate);
        }
      } catch (err) {
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

  const formatGs = (num: number) => {
    return num.toLocaleString("es-PY", { minimumFractionDigits: 0 });
  };

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`font-bold text-green-600 ${sizeClasses[size]}`}>
        ${amount.toFixed(2)}
      </span>
      {showGs && (
        <>
          <span className="text-gray-400 text-xs">|</span>
          <span className={`text-gray-500 ${sizeClasses[size]}`}>
            Gs. {formatGs(gs)}
          </span>
        </>
      )}
    </span>
  );
};

export default Price;
