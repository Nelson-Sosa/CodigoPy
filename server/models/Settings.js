const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'Mi Empresa' },
  ruc: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  
  taxName: { type: String, default: 'IVA' },
  taxRate: { type: Number, default: 0 },
  
  invoiceEstablishment: { type: String, default: '001' },
  invoicePoint: { type: String, default: '001' },
  currentInvoiceNumber: { type: Number, default: 0 },
  
  timbradoNumber: { type: String, default: '' },
  timbradoFrom: { type: Date },
  timbradoTo: { type: Date },
  
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: '$' },
  
  exchangeRate: { type: Number, default: 6600 },
  
  footerMessage: { type: String, default: 'Gracias por su compra' },
}, { timestamps: true });

settingsSchema.virtual('id').get(function () { return this._id.toString(); });
settingsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Settings', settingsSchema);
