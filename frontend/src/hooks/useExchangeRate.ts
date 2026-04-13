import { useState, useEffect, useCallback } from 'react';
import { exchangeRateService } from '../services/api';

const DEFAULT_RATES = {
  'PYG': 6600,
  'ARS': 850
};

interface ExchangeRateData {
  rate: number;
  source: string;
  updatedAt: string;
  expiresAt?: string;
  expired?: boolean;
  warning?: string;
}

export const useExchangeRate = () => {
  const [rates, setRates] = useState<Record<string, ExchangeRateData>>({});
  const [loading, setLoading] = useState(true);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await exchangeRateService.get();
      const data = res.data;
      
      setRates({
        'PYG': {
          rate: data.gsRate || DEFAULT_RATES.PYG,
          source: data.source || 'default',
          updatedAt: data.updatedAt || new Date().toISOString()
        },
        'ARS': {
          rate: data.arsRate || DEFAULT_RATES.ARS,
          source: data.source || 'default',
          updatedAt: data.updatedAt || new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setRates({
        'PYG': { rate: DEFAULT_RATES.PYG, source: 'default', updatedAt: new Date().toISOString() },
        'ARS': { rate: DEFAULT_RATES.ARS, source: 'default', updatedAt: new Date().toISOString() }
      });
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
  
  const syncFromExternal = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await exchangeRateService.sync();
      await fetchRates();
      return true;
    } catch (err) {
      console.error('Error syncing exchange rates:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (currency: string, rate: number): Promise<void> => {
    setLoading(true);
    try {
      await exchangeRateService.update({ targetCurrency: currency, rate });
      await fetchRates();
    } catch (err) {
      console.error('Error updating exchange rate:', err);
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
    syncFromExternal,
    updateRate,
    refresh: fetchRates,
  };
};
