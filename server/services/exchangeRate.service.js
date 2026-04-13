const ExchangeRate = require('../models/ExchangeRate');

const DEFAULT_RATES = {
  'PYG': 6600,
  'ARS': 850
};

class ExchangeRateService {
  
  async getRate(targetCurrency = 'PYG') {
    const rate = await ExchangeRate.findOne({
      targetCurrency,
      isActive: true
    }).sort({ createdAt: -1 });

    if (rate) {
      return {
        rate: rate.rate,
        updatedAt: rate.updatedAt,
        targetCurrency
      };
    }

    return {
      rate: DEFAULT_RATES[targetCurrency] || 1,
      updatedAt: new Date(),
      targetCurrency
    };
  }

  async saveRate(targetCurrency, rate) {
    await ExchangeRate.updateMany(
      { targetCurrency },
      { isActive: false }
    );

    await ExchangeRate.create({
      baseCurrency: 'USD',
      targetCurrency,
      rate,
      source: 'manual',
      isActive: true
    });
  }

  async saveManualRate(targetCurrency, rate) {
    return this.saveRate(targetCurrency, rate);
  }

  async getAllRates() {
    const rates = await ExchangeRate.aggregate([
      { $match: { isActive: true } },
      { $sort: { targetCurrency: 1, createdAt: -1 } },
      { $group: {
        _id: '$targetCurrency',
        rate: { $first: '$rate' },
        updatedAt: { $first: '$updatedAt' }
      }}
    ]);

    return rates;
  }
}

module.exports = new ExchangeRateService();
