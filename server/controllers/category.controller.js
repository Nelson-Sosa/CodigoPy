const Category = require('../models/Category');
const Product  = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    // Agregar conteo de productos por categoría
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat._id,
          status: { $ne: 'discontinued' },
        });
        return { ...cat.toJSON(), productCount: count };
      })
    );
    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const category = await Category.create({
      name,
      description,
      color,
      icon
    });

    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });

    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, color, icon },
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: 'Categoría no encontrada' });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.remove = async (req, res) => {
  try {
    const count = await Product.countDocuments({
      category: req.params.id,
      status: { $ne: 'discontinued' },
    });
    if (count > 0)
      return res.status(400).json({ message: `No se puede eliminar: tiene ${count} productos activos` });

    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
