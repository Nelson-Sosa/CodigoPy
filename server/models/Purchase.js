const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  productName:  { type: String, required: true },
  description:  { type: String, default: '' },
  isNewProduct: { type: Boolean, default: false },
  sku:          { type: String, default: '' },
  categoryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  quantity:     { type: Number, required: true, min: 1 },
  unitCost:     { type: Number, required: true },
  salePrice:    { type: Number, default: 0 },
  subtotal:     { type: Number, required: true },
});

const purchaseSchema = new mongoose.Schema({
  purchaseNumber:  { type: String, unique: true },
  supplier:       { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName:   { type: String, default: 'Proveedor General' },
  items:          [purchaseItemSchema],
  subtotal:       { type: Number, required: true },
  tax:            { type: Number, default: 0 },
  total:          { type: Number, required: true },
  status:         { type: String, enum: ['pending', 'received', 'cancelled'], default: 'pending' },
  paymentMethod:  { type: String, enum: ['cash', 'credit', 'transfer'], default: 'credit' },
  paymentStatus:  { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  amountPaid:     { type: Number, default: 0 },
  notes:          { type: String, default: '' },
  expectedDate:   { type: Date },
  receivedDate:   { type: Date },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

purchaseSchema.pre('save', async function (next) {
  if (!this.purchaseNumber) {
    const count = await mongoose.model('Purchase').countDocuments();
    this.purchaseNumber = `OC-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

purchaseSchema.virtual('id').get(function () { return this._id.toString(); });
purchaseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
