const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  costPrice:   { type: Number, required: true },
  subtotal:    { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  client:        { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientName:    { type: String, default: 'Cliente General' },
  clientRuc:     { type: String, default: '' },
  items:         [saleItemSchema],
  subtotal:      { type: Number, required: true },
  discount:      { type: Number, default: 0 },
  tax:           { type: Number, default: 0 },
  total:         { type: Number, required: true },
  totalCost:     { type: Number, required: true },
  profit:        { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'credit'], default: 'cash' },
  status:        { type: String, enum: ['completed', 'cancelled', 'pending'], default: 'completed' },
  notes:         { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

saleSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    this.invoiceNumber = `CP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

saleSchema.virtual('id').get(function () { return this._id.toString(); });
saleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Sale', saleSchema);
