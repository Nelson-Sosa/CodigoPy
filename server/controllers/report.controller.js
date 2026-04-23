const Sale     = require('../models/Sale');
const Product  = require('../models/Product');
const Client   = require('../models/Client');
const { getPyDateKey } = require('../utils/date');

const getPyDate = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Asuncion',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  return {
    year: Number(parts.find(p => p.type === 'year').value),
    month: Number(parts.find(p => p.type === 'month').value),
    day: Number(parts.find(p => p.type === 'day').value),
  };
};

exports.dashboard = async (req, res) => {
  try {
    const pyDate = getPyDate();
    const todayKey = pyDate.year * 10000 + pyDate.month * 100 + pyDate.day;
    const monthStart = pyDate.year * 10000 + pyDate.month * 100 + 1;
    const lastMonth = pyDate.month === 1 ? 12 : pyDate.month - 1;
    const lastMonthYear = pyDate.month === 1 ? pyDate.year - 1 : pyDate.year;
    const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0).getDate();
    const lastMonthEndKey = lastMonthYear * 10000 + lastMonth * 100 + lastMonthEnd;
    const startOfMonth = new Date(pyDate.year, pyDate.month - 1, 1);
    const endOfMonth = new Date(pyDate.year, pyDate.month, 0, 23, 59, 59);

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
        { $match: { 
            $or: [
              { dateKey: todayKey },
              { dateKey: { $exists: false }, createdAt: { $gte: new Date(pyDate.year, pyDate.month - 1, pyDate.day), $lte: new Date(pyDate.year, pyDate.month - 1, pyDate.day, 23, 59, 59) } }
            ],
            status: 'completed' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
      ]),
      Sale.aggregate([
        { $match: { 
            $or: [
              { dateKey: { $gte: monthStart, $lte: todayKey } },
              { dateKey: { $exists: false }, createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
            ],
            status: 'completed' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
      ]),
      Sale.aggregate([
        { $match: { 
            $or: [
              { dateKey: { $gte: lastMonthYear * 10000 + lastMonth * 100 + 1, $lte: lastMonthEndKey } },
              { dateKey: { $exists: false }, createdAt: { $gte: new Date(lastMonthYear, lastMonth - 1, 1), $lte: new Date(lastMonthYear, lastMonth, 0, 23, 59, 59) } }
            ],
            status: 'completed' 
          } 
        },
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
        { $match: { 
            $or: [
              { dateKey: { $gte: todayKey - 6, $lte: todayKey } },
              { dateKey: { $exists: false }, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            ],
            status: 'completed' 
          } 
        },
        { $group: { _id: '$dateKey', total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$profit' } } },
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
    const filter = { status: 'completed' };
    if (startDate || endDate) {
      filter.$or = [
        { dateKey: { $gte: Number(startDate.replace(/-/g, '')), $lte: Number(endDate.replace(/-/g, '')) } },
        {
          dateKey: { $exists: false },
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59') }
        }
      ];
    }

    const [summary, byPayment, lowStockProducts] = await Promise.all([
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$total' }, totalProfit: { $sum: '$profit' }, avgTicket: { $avg: '$total' } } },
      ]),
      Sale.aggregate([
        { $match: filter },
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
