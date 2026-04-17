import { useState, useEffect, useCallback } from 'react';
import { exchangeRateService } from '../services/api';

const DEFAULT_RATES = {
  'PYG': 6600,
  'ARS': 1500
};

interface ExchangeRateData {
  rate: number;
  updatedAt: string;
}

export const useExchangeRate = () => {
  const [rates, setRates] = useState<Record<string, ExchangeRateData>>({
    'PYG': { rate: DEFAULT_RATES.PYG, updatedAt: new Date().toISOString() },
    'ARS': { rate: DEFAULT_RATES.ARS, updatedAt: new Date().toISOString() }
  });
  const [loading, setLoading] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await exchangeRateService.get();
      const data = res.data;
      
      setRates({
        'PYG': {
          rate: data.gsRate || DEFAULT_RATES.PYG,
          updatedAt: data.updatedAt || new Date().toISOString()
        },
        'ARS': {
          rate: data.arsRate || DEFAULT_RATES.ARS,
          updatedAt: data.updatedAt || new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const getRate = (currency: string): number => {
    return rates[currency]?.rate || DEFAULT_RATES[currency as keyof typeof DEFAULT_RATES] || 1;
  };

  const convertToGs = (usd: number) => Math.round(usd * getRate('PYG'));
  const convertToArs = (usd: number) => Math.round(usd * getRate('ARS'));
  
  const updateRate = async (currency: string, rate: number): Promise<void> => {
    setRates(prev => ({
      ...prev,
      [currency]: { rate, updatedAt: new Date().toISOString() }
    }));
    
    setLoading(true);
    try {
      await exchangeRateService.update({ targetCurrency: currency, rate });
      await fetchRates();
    } catch (err) {
      console.error('Error updating exchange rate:', err);
      fetchRates();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    rates,
    loading,
    getRate,
    gsRate: getRate('PYG'),
    arsRate: getRate('ARS'),
    convertToGs,
    convertToArs,
    updateRate,
    refresh: fetchRates,
  };
};
