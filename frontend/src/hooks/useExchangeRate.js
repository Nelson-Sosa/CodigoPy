import { useState, useEffect, useCallback } from 'react';
import { exchangeRateService } from '../services/api';
const DEFAULT_RATES = {
    'PYG': 6600,
    'ARS': 850
};
export const useExchangeRate = () => {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const fetchRates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await exchangeRateService.getAll();
            const ratesMap = {};
            if (res.data.rates && Array.isArray(res.data.rates)) {
                res.data.rates.forEach((r) => {
                    ratesMap[r._id] = {
                        rate: r.rate,
                        source: r.source,
                        updatedAt: r.updatedAt,
                        expiresAt: r.expiresAt
                    };
                });
            }
            // Agregar rates por defecto si no existen
            if (!ratesMap['PYG'])
                ratesMap['PYG'] = { rate: DEFAULT_RATES.PYG, source: 'default', updatedAt: new Date().toISOString() };
            if (!ratesMap['ARS'])
                ratesMap['ARS'] = { rate: DEFAULT_RATES.ARS, source: 'default', updatedAt: new Date().toISOString() };
            setRates(ratesMap);
        }
        catch (err) {
            console.error('Error fetching exchange rates:', err);
            // Usar valores por defecto
            setRates({
                'PYG': { rate: DEFAULT_RATES.PYG, source: 'default', updatedAt: new Date().toISOString() },
                'ARS': { rate: DEFAULT_RATES.ARS, source: 'default', updatedAt: new Date().toISOString() }
            });
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchRates();
    }, [fetchRates]);
    const getRate = (currency) => {
        return rates[currency]?.rate || DEFAULT_RATES[currency] || 1;
    };
    const convertToGs = (usd) => Math.round(usd * getRate('PYG'));
    const convertToArs = (usd) => Math.round(usd * getRate('ARS'));
    const syncFromExternal = async () => {
        try {
            setLoading(true);
            await exchangeRateService.sync();
            await fetchRates();
            return true;
        }
        catch (err) {
            console.error('Error syncing exchange rates:', err);
            return false;
        }
        finally {
            setLoading(false);
        }
    };
    const updateRate = async (currency, rate) => {
        try {
            setLoading(true);
            await exchangeRateService.update({ targetCurrency: currency, rate });
            await fetchRates();
            return true;
        }
        catch (err) {
            console.error('Error updating exchange rate:', err);
            return false;
        }
        finally {
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
