const ExchangeRate = require('../models/ExchangeRate');

const DEFAULT_GS_RATE = 6600;
const DEFAULT_ARS_RATE = 850;

const fetchFromAPI = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API unavailable');
    return await response.json();
  } catch (err) {
    console.log('API fetch failed:', err.message);
    return null;
  }
};

exports.getCurrent = async (req, res) => {
  try {
    let rate = await ExchangeRate.findOne().sort({ updatedAt: -1 });
    
    if (!rate) {
      rate = await ExchangeRate.create({
        gsRate: DEFAULT_GS_RATE,
        arsRate: DEFAULT_ARS_RATE,
        source: 'default'
      });
    }
    
    res.json({
      gsRate: rate.gsRate,
      arsRate: rate.arsRate,
      source: rate.source,
      updatedAt: rate.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { gsRate, arsRate } = req.body;
    
    if (!gsRate || !arsRate) {
      return res.status(400).json({ message: 'gsRate y arsRate son requeridos' });
    }
    
    const rate = await ExchangeRate.create({
      gsRate: Number(gsRate),
      arsRate: Number(arsRate),
      source: 'manual'
    });
    
    res.json(rate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.syncFromExternal = async (req, res) => {
  try {
    let gsRate = DEFAULT_GS_RATE;
    let arsRate = DEFAULT_ARS_RATE;
    let source = 'default';

    // Intentar API de Paraguay (cambioschaco.com.py)
    try {
      const response = await fetch('https://cambioschaco.com.py/');
      if (response.ok) {
        const html = await response.text();
        const buyMatch = html.match(/(\d{3,5})\s*<\/\s*td[^>]*>\s*<\s*td[^>]*>\s*(\d{3,5})/gi);
        if (buyMatch && buyMatch.length > 0) {
          const parts = buyMatch[0].replace(/<[^>]*>/g, '').trim().split(/\s+/);
          if (parts.length >= 2) {
            const parsedRate = parseInt(parts[1].replace(/\./g, ''));
            if (parsedRate > 1000 && parsedRate < 10000) {
              gsRate = parsedRate;
              source = 'cambioschaco';
            }
          }
        }
      }
    } catch (e) {
      console.log('CambiosChaco unavailable:', e.message);
    }

    // Si no funcionó CambiosChaco, intentar API alternativa
    if (source === 'default') {
      try {
        const resApi = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (resApi.ok) {
          const data = await resApi.json();
          if (data.rates && data.rates.PYG) {
            gsRate = Math.round(data.rates.PYG);
            source = 'exchangerate-api';
          }
          if (data.rates && data.rates.ARS) {
            arsRate = Math.round(data.rates.ARS);
          }
        }
      } catch (e) {
        console.log('ExchangeRate API unavailable:', e.message);
      }
    }

    const rate = await ExchangeRate.create({
      gsRate,
      arsRate,
      source
    });

    res.json({
      gsRate,
      arsRate,
      source,
      updatedAt: rate.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
