const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  sku:         { type: String, required: true, unique: true, uppercase: true },
  brand:       { type: String, default: '' },
  description: { type: String, default: '' },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  salePrice:   { type: Number, required: true, min: 0 },
  costPrice:   { type: Number, required: true, min: 0 },
  stock:       { type: Number, default: 0, min: 0 },
  minStock:    { type: Number, default: 5 },
  maxStock:    { type: Number, default: 100 },
  unit:        { type: String, default: 'unidad' },
  imageUrl:    { type: String, default: '' },
  status:      { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' },
}, { timestamps: true });

// Virtuales para compatibilidad con frontend
productSchema.virtual('price').get(function () { return this.salePrice; });
productSchema.virtual('cost').get(function ()  { return this.costPrice; });
productSchema.virtual('id').get(function ()    { return this._id.toString(); });
productSchema.virtual('categoryId').get(function () {
  if (!this.category) return null;
  if (typeof this.category === 'object' && this.category._id) {
    return this.category._id.toString();
  }
  return this.category.toString();
});
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out';
  if (this.stock <= this.minStock) return 'low';
  return 'ok';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
