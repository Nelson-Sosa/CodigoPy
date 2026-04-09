const Sale     = require('../models/Sale');
const Product  = require('../models/Product');
const Client   = require('../models/Client');

exports.dashboard = async (req, res) => {
  try {
    const now           = new Date();
    const startOfDay    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLast   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLast     = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalProducts, activeProducts, lowStockProducts, outOfStockProducts,
      totalClients, salesToday, salesMonth, salesLastMonth,
      recentSales, topProducts, inventoryValue, salesChart,
    ] = await Promise.all([
      Product.countDocuments({ status: { $ne: 'discontinued' } }),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ $expr: { $and: [{ $lte: ['$stock', '$minStock'] }, { $gt: ['$stock', 0] }] } }),
      Product.countDocuments({ stock: 0, status: 'active' }),
      Client.countDocuments({ isActive: true }),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfLast, $lte: endOfLast }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Sale.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5).populate('client', 'name'),
      Sale.aggregate([
        { $match: { status: 'completed' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.productName' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Product.aggregate([
        { $match: { status: { $ne: 'discontinued' } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$costPrice'] } } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      products: { total: totalProducts, active: activeProducts, lowStock: lowStockProducts, outOfStock: outOfStockProducts },
      clients:  { total: totalClients },
      inventory:{ totalValue: inventoryValue[0]?.total || 0 },
      sales: {
        today:     salesToday[0]     || { total: 0, count: 0, profit: 0 },
        month:     salesMonth[0]     || { total: 0, count: 0, profit: 0 },
        lastMonth: salesLastMonth[0] || { total: 0, count: 0 },
      },
      recentSales,
      topProducts,
      salesChart,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.salesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: 'completed' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate)   match.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    const [summary, byPayment, lowStockProducts] = await Promise.all([
      Sale.aggregate([
        { $match: match },
        { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$total' }, totalProfit: { $sum: '$profit' }, avgTicket: { $avg: '$total' } } },
      ]),
      Sale.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
      ]),
      Product.find({ $expr: { $lte: ['$stock', '$minStock'] }, status: 'active' })
        .populate('category', 'name color').sort({ stock: 1 }),
    ]);

    res.json({ summary: summary[0] || {}, byPayment, lowStockProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
