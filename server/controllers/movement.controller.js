const Movement = require('../models/Movement');

exports.getAll = async (req, res) => {
  try {
    const { type, product, startDate, endDate, limit = 50 } = req.query;
    const filter = {};

    if (type)    filter.type = type;
    if (product) filter.product = product;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    const movements = await Movement.find(filter)
      .populate('product',   'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
