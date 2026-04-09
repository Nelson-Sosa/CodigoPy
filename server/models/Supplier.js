const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  businessName:    { type: String, trim: true },
  taxId:          { type: String, trim: true },
  contactName:    { type: String, trim: true },
  phone:          { type: String, required: true, trim: true },
  email:          { type: String, trim: true, lowercase: true },
  address:        { type: String, trim: true },
  city:           { type: String, trim: true },
  categories:     [{ type: String, trim: true }],
  products:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  deliveryTime:   { type: Number, default: 0 },
  paymentTerms:   { type: String, enum: ['contado', 'credito'], default: 'contado' },
  creditDays:     { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

supplierSchema.virtual('id').get(function () {
  return this._id.toString();
});

supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Supplier', supplierSchema);
