const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:   { type: String, required: true },
  // 'in' = entrada, 'out' = salida, 'adjust' = ajuste
  type:          { type: String, enum: ['in', 'out', 'adjust'], required: true },
  quantity:      { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock:      { type: Number, required: true },
  reason:        { type: String, required: true },
  reference:     { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

movementSchema.virtual('id').get(function () { return this._id.toString(); });
// Alias para compatibilidad con frontend legacy (entrada/salida/ajuste)
movementSchema.virtual('typeLegacy').get(function () {
  const map = { in: 'entrada', out: 'salida', adjust: 'ajuste' };
  return map[this.type] || this.type;
});
movementSchema.virtual('productId').get(function () {
  return typeof this.product === 'object' ? this.product._id?.toString() : this.product?.toString();
});

movementSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Movement', movementSchema);
