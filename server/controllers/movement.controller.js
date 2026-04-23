const Movement = require('../models/Movement');

exports.getAll = async (req, res) => {
  try {
    const { type, product, startDate, endDate, limit = 50 } = req.query;
    const filter = {};

    if (type)    filter.type = type;
    if (product) filter.product = product;
    if (startDate || endDate) {
      const start = Number(startDate.replace(/-/g, ''));
      const end = Number(endDate.replace(/-/g, ''));
      filter.dateKey = {};
      if (start) filter.dateKey.$gte = start;
      if (end) filter.dateKey.$lte = end;
    }

    const movements = await Movement.find(filter)
      .populate('product',   'name sku')
      .populate('createdBy', 'name')
      .sort({ dateKey: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
