const Commission = require('../models/Commission');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { getPyDateKey } = require('../utils/date');

exports.getAll = async (req, res) => {
  try {
    const commissions = await Commission.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    const result = await Promise.all(commissions.map(async (c) => {
      const dateKeyStr = new Date().toISOString().slice(0, 7);
      const monthStart = Number(dateKeyStr.replace('-', '') + '01');
      const todayKey = getPyDateKey();

      const sales = await Sale.find({
        user: c.user._id,
        dateKey: { $gte: monthStart, $lte: todayKey },
        status: 'completed'
      }).lean();

      const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
      const totalCost = sales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
      const profit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);

      return {
        ...c.toObject(),
        stats: {
          salesCount: sales.length,
          totalSales,
          totalCost,
          profit,
          percentTarget: c.monthlyTarget > 0 ? (profit / c.monthlyTarget) * 100 : 0,
          commission: profit * (c.commissionPercent / 100),
        }
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const commission = await Commission.findOne({ user: userId });

    if (!commission) {
      return res.status(404).json({ message: 'Comisión no encontrada' });
    }

    res.json(commission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { userId, monthlyTarget, commissionPercent } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId requerido' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const commission = await Commission.findOneAndUpdate(
      { user: userId },
      {
        monthlyTarget: monthlyTarget || 0,
        commissionPercent: commissionPercent || 0,
        isActive: true,
      },
      { new: true, upsert: true }
    ).populate('user', 'name email role');

    res.json(commission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateKeyStr = new Date().toISOString().slice(0, 7);
    const monthStart = Number(dateKeyStr.replace('-', '') + '01');
    const todayKey = getPyDateKey();

    const commission = await Commission.findOne({ user: userId });

    const sales = await Sale.find({
      user: userId,
      dateKey: { $gte: monthStart, $lte: todayKey },
      status: 'completed'
    }).lean();

    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    const totalCost = sales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const profit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);

    res.json({
      commission: commission || { monthlyTarget: 0, commissionPercent: 0 },
      stats: {
        salesCount: sales.length,
        totalSales,
        totalCost,
        profit,
        percentTarget: (commission?.monthlyTarget || 0) > 0 
          ? (profit / commission.monthlyTarget) * 100 
          : 0,
        commission: profit * ((commission?.commissionPercent || 0) / 100),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};