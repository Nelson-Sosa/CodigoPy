const CashRegister = require('../models/CashRegister');
const Sale = require('../models/Sale');

const getStartOfDay = (date) => {
  const offset = -4 * 60;
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
};

const getEndOfDay = (date) => {
  const offset = -4 * 60;
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999);
};

exports.getToday = async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    let cashRegister = await CashRegister.findOne({ 
      date: today,
      user: req.user._id 
    });

    if (!cashRegister) {
      cashRegister = { status: 'not_opened' };
    }

    res.json(cashRegister);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.open = async (req, res) => {
  try {
    const { openingAmount = 0 } = req.body;
    const today = getStartOfDay(new Date());

    const existing = await CashRegister.findOne({
      date: today,
      user: req.user._id
    });

    if (existing && existing.status === 'open') {
      return res.status(400).json({ message: 'La caja ya está abierta para hoy' });
    }

    const cashRegister = await CashRegister.create({
      date: today,
      user: req.user._id,
      openingAmount,
      status: 'open',
      openedAt: new Date(),
    });

    res.status(201).json(cashRegister);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.close = async (req, res) => {
  try {
    const { closingAmount, notes } = req.body;
    const today = getStartOfDay(new Date());

    const cashRegister = await CashRegister.findOne({
      date: today,
      user: req.user._id,
      status: 'open'
    });

    if (!cashRegister) {
      return res.status(400).json({ message: 'No hay caja abierta para hoy' });
    }

    const startOfDay = getStartOfDay(new Date());
    const endOfDay = getEndOfDay(new Date());

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;
    let creditSales = 0;

    sales.forEach(sale => {
      switch (sale.paymentMethod) {
        case 'cash':
          cashSales += sale.total;
          break;
        case 'card':
          cardSales += sale.total;
          break;
        case 'transfer':
          transferSales += sale.total;
          break;
        case 'credit':
          creditSales += sale.total;
          break;
      }
    });

    const totalSales = cashSales + cardSales + transferSales + creditSales;
    const expectedCash = cashRegister.openingAmount + cashSales;

    cashRegister.closingAmount = closingAmount;
    cashRegister.expectedAmount = expectedCash;
    cashRegister.cashSales = cashSales;
    cashRegister.cardSales = cardSales;
    cashRegister.transferSales = transferSales;
    cashRegister.creditSales = creditSales;
    cashRegister.totalSales = totalSales;
    cashRegister.totalCash = expectedCash;
    cashRegister.status = 'closed';
    cashRegister.closedAt = new Date();
    cashRegister.notes = notes || '';
    cashRegister.salesCount = sales.length;

    await cashRegister.save();
    res.json(cashRegister);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    
    const history = await CashRegister.find()
      .populate('user', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CashRegister.countDocuments();

    res.json({ history, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    
    const getLocalDate = (date) => {
      const offset = -4 * 60;
      const localDate = new Date(date.getTime() + offset * 60 * 1000);
      return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    };
    
    const getLocalDateEnd = (date) => {
      const offset = -4 * 60;
      const localDate = new Date(date.getTime() + offset * 60 * 1000);
      return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999);
    };
    
    const today = getLocalDate(now);
    const startOfDay = getLocalDate(now);
    const endOfDay = getLocalDateEnd(now);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayRegister = await CashRegister.findOne({ date: today, user: req.user._id });
    
    let todayStatus = 'not_opened';
    if (todayRegister) {
      todayStatus = todayRegister.status;
    }

    let todaySales = [];
    let monthSales = [];
    
    todaySales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });
    
    monthSales = await Sale.find({
      createdAt: { $gte: startOfMonth, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;
    let creditSales = 0;
    
    todaySales.forEach(sale => {
      switch (sale.paymentMethod) {
        case 'cash': cashSales += sale.total; break;
        case 'card': cardSales += sale.total; break;
        case 'transfer': transferSales += sale.total; break;
        case 'credit': creditSales += sale.total; break;
      }
    });

    let monthCashSales = 0;
    let monthTotal = 0;
    monthSales.forEach(sale => {
      monthTotal += sale.total;
      if (sale.paymentMethod === 'cash') {
        monthCashSales += sale.total;
      }
    });

    const totalSales = cashSales + cardSales + transferSales + creditSales;
    const openingAmount = todayRegister?.openingAmount || 0;
    const expectedCash = openingAmount + cashSales;

    res.json({
      todayStatus,
      todayRegister: {
        cashSales,
        cardSales,
        transferSales,
        creditSales,
        totalSales,
        totalCash: expectedCash,
        salesCount: todaySales.length,
        openingAmount,
        status: todayStatus,
      },
      monthTotal,
      monthCash: monthCashSales,
      monthSalesCount: monthSales.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reopen = async (req, res) => {
  try {
    const { openingAmount = 0 } = req.body;
    const today = getStartOfDay(new Date());

    const existing = await CashRegister.findOne({
      date: today,
      user: req.user._id,
      status: 'closed'
    });

    if (!existing) {
      return res.status(400).json({ message: 'No hay caja cerrada para reabrir hoy' });
    }

    const reopenAt = new Date();
    const wasClosedAt = new Date(existing.closedAt);
    
    const hoursDiff = (reopenAt - wasClosedAt) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      return res.status(400).json({ 
        message: 'No se puede reabrir una caja de un día anterior. Abre una nueva caja.' 
      });
    }

    existing.status = 'open';
    existing.openedAt = reopenAt;
    existing.closedAt = null;
    existing.closingAmount = null;
    existing.expectedAmount = null;
    existing.reopenedAt = reopenAt;
    existing.openingAmount = openingAmount;

    await existing.save();
    res.json({ 
      message: `Caja reaberta a las ${reopenAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      cashRegister: existing 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
