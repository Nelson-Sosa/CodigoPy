const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  baseCurrency: { type: String, default: 'USD' },
  targetCurrency: { type: String, required: true },
  rate: { type: Number, required: true },
  source: { type: String, enum: ['manual', 'api'], default: 'api' },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

exchangeRateSchema.index({ targetCurrency: 1, isActive: 1, expiresAt: 1 });

exchangeRateSchema.virtual('id').get(function () { return this._id.toString(); });
exchangeRateSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
