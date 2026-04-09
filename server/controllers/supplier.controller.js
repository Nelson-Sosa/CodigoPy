const Supplier = require('../models/Supplier');

exports.getAll = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.categories = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const suppliers = await Supplier.find(filter)
      .populate('products', 'name sku')
      .sort({ createdAt: -1 });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('products', 'name sku stock salePrice');

    if (!supplier)
      return res.status(404).json({ message: 'Proveedor no encontrado' });

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier)
      return res.status(404).json({ message: 'Proveedor no encontrado' });

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier)
      return res.status(404).json({ message: 'Proveedor no encontrado' });

    if (!supplier.products.includes(productId)) {
      supplier.products.push(productId);
      await supplier.save();
    }

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
