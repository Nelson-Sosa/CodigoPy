const Product = require('../models/Product');
const Movement = require('../models/Movement');
const { getPyDateKey } = require('../utils/date');

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku:  { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (status)   filter.status = status;

    const products = await Product.find(filter)
      .populate('category', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const movements = await Movement.find({ product: req.params.id })
      .sort({ createdAt: -1 }).limit(20);

    res.json({ product, movements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ CREATE (ARREGLADO)
exports.create = async (req, res) => {
  try {
    const {
      sku,
      barcode,
      name,
      brand,
      description,
      categoryId,
      price,
      cost,
      stock,
      minStock,
      maxStock,
      unit,
      imageUrl
    } = req.body;

    const product = await Product.create({
      sku,
      barcode: barcode || '',
      name,
      brand,
      description,
      category: categoryId,
      salePrice: Number(price),
      costPrice: Number(cost),
      stock: Number(stock),
      minStock: Number(minStock) || 0,
      maxStock: Number(maxStock) || 0,
      unit,
      imageUrl
    });

    await product.populate('category', 'name color icon');

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'El SKU ya existe' });

    res.status(500).json({ message: err.message });
  }
};



// ✅ UPDATE (ARREGLADO)
exports.update = async (req, res) => {
  try {
    const {
      sku,
      barcode,
      name,
      brand,
      description,
      categoryId,
      price,
      cost,
      stock,
      minStock,
      maxStock,
      unit,
      imageUrl,
      status
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        sku,
        barcode: barcode || '',
        name,
        brand,
        description,
        category: categoryId,
        salePrice: Number(price),
        costPrice: Number(cost),
        stock: Number(stock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        unit,
        imageUrl,
        status
      },
      { new: true, runValidators: true }
    ).populate('category', 'name color icon');

    if (!product)
      return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// PATCH /api/products/:id/stock
exports.adjustStock = async (req, res) => {
  try {
    const { quantity, type, reason } = req.body;

    if (!quantity || !type || !reason)
      return res.status(400).json({ message: 'Cantidad, tipo y motivo son requeridos' });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Producto no encontrado' });

    const previousStock = product.stock;

    if (type === 'in') {
      product.stock += Number(quantity);
    } else if (type === 'out') {
      if (product.stock < quantity)
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${product.stock}`
        });

      product.stock -= Number(quantity);
    } else {
      product.stock = Number(quantity);
    }

    await product.save();

    await Movement.create({
      dateKey: getPyDateKey(),
      product: product._id,
      productName: product.name,
      type,
      quantity: Number(quantity),
      previousStock,
      newStock: product.stock,
      reason,
      createdBy: req.user._id,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DELETE
exports.remove = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      status: 'discontinued'
    });

    res.json({ message: 'Producto dado de baja correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};