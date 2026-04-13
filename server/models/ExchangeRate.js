const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  gsRate: { type: Number, required: true },
  arsRate: { type: Number, required: true },
  source: { type: String, default: 'manual' },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

exchangeRateSchema.virtual('id').get(function () { return this._id.toString(); });
exchangeRateSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
