const exchangeRateService = require('../services/exchangeRate.service');

exports.getCurrent = async (req, res) => {
  try {
    const gsRate = await exchangeRateService.getRate('PYG');
    const arsRate = await exchangeRateService.getRate('ARS');
    
    res.json({
      gsRate: gsRate.rate,
      arsRate: arsRate.rate,
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

exports.saveManual = async (req, res) => {
  try {
    const { targetCurrency, rate } = req.body;
    
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
