const axios = require('axios');
const ExchangeRate = require('../models/ExchangeRate');

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas
const EXTERNAL_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

class ExchangeRateService {
  
  async getRate(targetCurrency = 'PYG') {
    // 1. Buscar rate manual activo y no expirado
    const manualRate = await ExchangeRate.findOne({
      targetCurrency,
      source: 'manual',
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });

    if (manualRate) {
      return {
        rate: manualRate.rate,
        source: 'manual',
        updatedAt: manualRate.updatedAt,
        expiresAt: manualRate.expiresAt,
        targetCurrency
      };
    }

    // 2. Buscar rate de API activo y no expirado
    const apiRate = await ExchangeRate.findOne({
      targetCurrency,
      source: 'api',
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (apiRate) {
      return {
        rate: apiRate.rate,
        source: 'api',
        updatedAt: apiRate.updatedAt,
        expiresAt: apiRate.expiresAt,
        targetCurrency
      };
    }

    // 3. Intentar obtener de API externa
    const externalRate = await this.fetchFromExternalAPI(targetCurrency);
    
    if (externalRate) {
      // Guardar como backup
      await this.saveRate(targetCurrency, externalRate, 'api', CACHE_DURATION_MS);
      
      return {
        rate: externalRate,
        source: 'api',
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
        targetCurrency
      };
    }

    // 4. Fallback: último valor guardado (aunque esté expirado)
    const lastRate = await ExchangeRate.findOne({
      targetCurrency,
      isActive: true
    }).sort({ createdAt: -1 });

    if (lastRate) {
      return {
        rate: lastRate.rate,
        source: lastRate.source,
        updatedAt: lastRate.updatedAt,
        expiresAt: lastRate.expiresAt,
        targetCurrency,
        expired: true,
        warning: 'Usando valor en caché. La fuente externa no está disponible.'
      };
    }

    // 5. Valor por defecto si todo falla
    const defaultRates = {
      'PYG': 6600,
      'ARS': 850
    };

    return {
      rate: defaultRates[targetCurrency] || 1,
      source: 'default',
      updatedAt: new Date(),
      targetCurrency,
      warning: 'Usando valor por defecto.'
    };
  }

  async fetchFromExternalAPI(targetCurrency) {
    try {
      const response = await axios.get(EXTERNAL_API_URL, { timeout: 5000 });
      
      if (response.data && response.data.rates) {
        const currencyMap = {
          'PYG': 'PYG',
          'ARS': 'ARS',
          'USD': 'USD'
        };
        
        const currency = currencyMap[targetCurrency];
        if (currency && response.data.rates[currency]) {
          return response.data.rates[currency];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching external API:', error.message);
      return null;
    }
  }

  async saveRate(targetCurrency, rate, source, expiresInMs = null) {
    // Desactivar rates anteriores de esta moneda
    await ExchangeRate.updateMany(
      { targetCurrency },
      { isActive: false }
    );

    const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs) : null;

    const newRate = await ExchangeRate.create({
      baseCurrency: 'USD',
      targetCurrency,
      rate,
      source,
      expiresAt,
      isActive: true
    });

    return newRate;
  }

  async saveManualRate(targetCurrency, rate) {
    return this.saveRate(targetCurrency, rate, 'manual', null);
  }

  async getAllRates() {
    const rates = await ExchangeRate.aggregate([
      { $match: { isActive: true } },
      { $sort: { targetCurrency: 1, createdAt: -1 } },
      { $group: {
        _id: '$targetCurrency',
        rate: { $first: '$rate' },
        source: { $first: '$source' },
        updatedAt: { $first: '$updatedAt' },
        expiresAt: { $first: '$expiresAt' }
      }}
    ]);

    return rates;
  }

  async isExpired(targetCurrency, source) {
    const rate = await ExchangeRate.findOne({
      targetCurrency,
      source,
      isActive: true
    });

    if (!rate) return true;
    if (!rate.expiresAt) return false;
    
    return new Date() > rate.expiresAt;
  }
}

module.exports = new ExchangeRateService();
