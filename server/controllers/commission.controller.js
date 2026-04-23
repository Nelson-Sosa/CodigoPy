const Commission = require('../models/Commission');
const Sale = require('../models/Sale');
const User = require('../models/User');
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

const getMonthStats = async (userId, year, month) => {
  const monthStr = `${year}${String(month).padStart(2, '0')}`;
  const monthStart = Number(`${monthStr}01`);
  const monthEnd = month === 12 
    ? Number(`${year + 1}0101`) - 1 
    : Number(`${year}${String(month + 1).padStart(2, '0')}01`) - 1;

  const sales = await Sale.find({
    createdBy: userId,
    dateKey: { $gte: monthStart, $lte: monthEnd },
    status: 'completed'
  }).lean();

  return {
    salesCount: sales.length,
    totalSales: sales.reduce((acc, s) => acc + s.total, 0),
    totalCost: sales.reduce((acc, s) => acc + (s.totalCost || 0), 0),
    profit: sales.reduce((acc, s) => acc + (s.profit || 0), 0),
  };
};

const getMonthName = (month) => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return months[month - 1] || '';
};

exports.getAll = async (req, res) => {
  try {
    const commissions = await Commission.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    const pyDate = getPyDate();
    const result = await Promise.all(commissions.map(async (c) => {
      const stats = await getMonthStats(c.user._id, pyDate.year, pyDate.month);

      return {
        ...c.toObject(),
        stats: {
          ...stats,
          percentTarget: c.monthlyTarget > 0 ? (stats.profit / c.monthlyTarget) * 100 : 0,
          commission: stats.profit * (c.commissionPercent / 100),
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
    const commission = await Commission.findOne({ user: userId });
    const pyDate = getPyDate();

    const stats = await getMonthStats(userId, pyDate.year, pyDate.month);

    res.json({
      commission: commission || { monthlyTarget: 0, commissionPercent: 0 },
      stats: {
        ...stats,
        percentTarget: (commission?.monthlyTarget || 0) > 0 
          ? (stats.profit / commission.monthlyTarget) * 100 
          : 0,
        commission: stats.profit * ((commission?.commissionPercent || 0) / 100),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { months = 6 } = req.query;

    const commission = await Commission.findOne({ user: userId });
    if (!commission) {
      return res.json({ monthlyTarget: 0, commissionPercent: 0, history: [] });
    }

    const pyDate = getPyDate();
    const history = [];

    for (let i = 0; i < months; i++) {
      const d = new Date(pyDate.year, pyDate.month - 1 - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const monthStats = await getMonthStats(userId, year, month);

      history.push({
        year,
        month,
        monthName: getMonthName(month),
        ...monthStats,
        percentTarget: commission.monthlyTarget > 0 ? (monthStats.profit / commission.monthlyTarget) * 100 : 0,
        commission: monthStats.profit * (commission.commissionPercent / 100),
        meta: commission.monthlyTarget,
        percentCommission: commission.commissionPercent,
      });
    }

    res.json({
      monthlyTarget: commission.monthlyTarget,
      commissionPercent: commission.commissionPercent,
      history,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};