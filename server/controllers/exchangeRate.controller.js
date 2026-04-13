const exchangeRateService = require('../services/exchangeRate.service');

exports.getCurrent = async (req, res) => {
  try {
    const targetCurrency = req.query.currency || 'PYG';
    const gsRate = await exchangeRateService.getRate('PYG');
    const arsRate = await exchangeRateService.getRate('ARS');
    
    res.json({
      gsRate: gsRate.rate,
      arsRate: arsRate.rate,
      source: gsRate.source,
      updatedAt: gsRate.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const rates = await exchangeRateService.getAllRates();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.syncExternal = async (req, res) => {
  try {
    const gsRate = await exchangeRateService.fetchFromExternalAPI('PYG');
    const arsRate = await exchangeRateService.fetchFromExternalAPI('ARS');
    
    if (gsRate) {
      await exchangeRateService.saveRate('PYG', gsRate, 'api', 6 * 60 * 60 * 1000);
    }
    
    if (arsRate) {
      await exchangeRateService.saveRate('ARS', arsRate, 'api', 6 * 60 * 60 * 1000);
    }
    
    const updated = await exchangeRateService.getRate('PYG');
    const updatedArs = await exchangeRateService.getRate('ARS');
    
    res.json({
      success: true,
      gsRate: updated.rate,
      arsRate: updatedArs.rate,
      source: updated.source,
      updatedAt: updated.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveManual = async (req, res) => {
  try {
    const { baseCurrency = 'USD', targetCurrency, rate } = req.body;
    
    if (!targetCurrency || !rate) {
      return res.status(400).json({ message: 'targetCurrency y rate son requeridos' });
    }
    
    await exchangeRateService.saveManualRate(targetCurrency, rate);
    
    const updated = await exchangeRateService.getRate(targetCurrency);
    
    res.json({
      success: true,
      ...updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
