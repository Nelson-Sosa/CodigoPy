const mongoose = require('mongoose');

const cashRegisterSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format (Paraguay timezone)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  openingAmount: { type: Number, required: true, default: 0 },
  closingAmount: { type: Number, default: null },
  expectedAmount: { type: Number, default: null },
  
  cashSales: { type: Number, default: 0 },
  cardSales: { type: Number, default: 0 },
  transferSales: { type: Number, default: 0 },
  creditSales: { type: Number, default: 0 },
  
  totalSales: { type: Number, default: 0 },
  totalCash: { type: Number, default: 0 },
  
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  reopenedAt: { type: Date },
  
  notes: { type: String, default: '' },
  
  salesCount: { type: Number, default: 0 },
}, { timestamps: true });

cashRegisterSchema.index({ date: 1, user: 1 });

cashRegisterSchema.virtual('id').get(function () { return this._id.toString(); });
cashRegisterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CashRegister', cashRegisterSchema);
