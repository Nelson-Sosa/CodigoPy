const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  ruc:            { type: String, default: '' },
  phone:          { type: String, default: '' },
  email:          { type: String, default: '', lowercase: true },
  address:        { type: String, default: '' },
  city:           { type: String, default: '' },
  notes:          { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  totalPurchases: { type: Number, default: 0 },
  totalSpent:     { type: Number, default: 0 },
}, { timestamps: true });

clientSchema.virtual('id').get(function () { return this._id.toString(); });
clientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);
