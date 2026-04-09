const Settings = require('../models/Settings');

exports.get = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNextInvoiceNumber = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    settings.currentInvoiceNumber += 1;
    await settings.save();
    
    const num = String(settings.currentInvoiceNumber).padStart(7, '0');
    const formatted = `${settings.invoiceEstablishment}-${settings.invoicePoint}-${num}`;
    
    res.json({ 
      number: settings.currentInvoiceNumber,
      formatted: formatted
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
