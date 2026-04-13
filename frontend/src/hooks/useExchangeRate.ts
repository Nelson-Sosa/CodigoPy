import { useState, useEffect } from 'react';
import { exchangeRateService } from '../services/api';

const DEFAULT_GS_RATE = 6600;
const DEFAULT_ARS_RATE = 850;

export const useExchangeRate = () => {
  const [gsRate, setGsRate] = useState(DEFAULT_GS_RATE);
  const [arsRate, setArsRate] = useState(DEFAULT_ARS_RATE);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');

  const fetchRates = async () => {
    try {
      const res = await exchangeRateService.get();
      setGsRate(res.data.gsRate || DEFAULT_GS_RATE);
      setArsRate(res.data.arsRate || DEFAULT_ARS_RATE);
      setSource(res.data.source || 'default');
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const syncFromExternal = async () => {
    try {
      setLoading(true);
      const res = await exchangeRateService.sync();
      setGsRate(res.data.gsRate);
      setArsRate(res.data.arsRate);
      setSource(res.data.source);
      return true;
    } catch (err) {
      console.error('Error syncing exchange rates:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateManual = async (gs: number, ars: number) => {
    try {
      setLoading(true);
      const res = await exchangeRateService.update({ gsRate: gs, arsRate: ars });
      setGsRate(res.data.gsRate);
      setArsRate(res.data.arsRate);
      setSource('manual');
      return true;
    } catch (err) {
      console.error('Error updating exchange rates:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const convertToGs = (usd: number) => Math.round(usd * gsRate);
  const convertToArs = (usd: number) => Math.round(usd * arsRate);
  const convertFromGs = (gs: number) => gs / gsRate;
  const convertFromArs = (ars: number) => ars / arsRate;

  return {
    gsRate,
    arsRate,
    loading,
    source,
    syncFromExternal,
    updateManual,
    convertToGs,
    convertToArs,
    convertFromGs,
    convertFromArs,
    refresh: fetchRates,
  };
};
