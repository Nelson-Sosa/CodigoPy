const CashRegister = require('../models/CashRegister');
const Sale = require('../models/Sale');

const getLocalToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return new Date(local.getFullYear(), local.getMonth(), local.getDate());
};

const getLocalStartOfDay = (date) => {
  const local = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  return new Date(local.getFullYear(), local.getMonth(), local.getDate(), 0, 0, 0, 0);
};

const getLocalEndOfDay = (date) => {
  const local = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  return new Date(local.getFullYear(), local.getMonth(), local.getDate(), 23, 59, 59, 999);
};

exports.getToday = async (req, res) => {
  try {
    const today = getLocalToday();
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
    const today = getLocalToday();

    const existingOpen = await CashRegister.findOne({
      date: today,
      user: req.user._id,
      status: 'open'
    });

    if (existingOpen) {
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
    const today = getLocalToday();

    const cashRegister = await CashRegister.findOne({
      date: today,
      user: req.user._id,
      status: 'open'
    });

    if (!cashRegister) {
      return res.status(400).json({ message: 'No hay caja abierta para hoy' });
    }

    const startOfDay = getLocalStartOfDay(new Date());
    const endOfDay = getLocalEndOfDay(new Date());

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
    const localDate = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const todayYear = localDate.getFullYear();
    const todayMonth = localDate.getMonth();
    const todayDay = localDate.getDate();
    
    const todayStart = new Date(Date.UTC(todayYear, todayMonth, todayDay, 4, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(todayYear, todayMonth, todayDay, 27, 59, 59, 999));
    const startOfMonth = new Date(Date.UTC(todayYear, todayMonth, 1, 4, 0, 0, 0));
    
    const allTodayRegisters = await CashRegister.find({
      user: req.user._id
    }).sort({ date: -1 }).lean();
    
    let todayRegister = null;
    for (const reg of allTodayRegisters) {
      const regDate = new Date(reg.date);
      const regLocalDate = new Date(regDate.getTime() - 4 * 60 * 60 * 1000);
      if (regLocalDate.getFullYear() === todayYear && 
          regLocalDate.getMonth() === todayMonth && 
          regLocalDate.getDate() === todayDay) {
        todayRegister = reg;
        break;
      }
    }
    
    let todayStatus = 'not_opened';
    let openingAmount = 0;
    
    if (todayRegister && todayRegister.status) {
      todayStatus = todayRegister.status;
      openingAmount = todayRegister.openingAmount || 0;
    }

    const todaySales = await Sale.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    }).lean();
    
    const monthSales = await Sale.find({
      createdAt: { $gte: startOfMonth, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    }).lean();

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
    const today = getLocalToday();

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

exports.fixIndexes = async (req, res) => {
  try {
    const CashRegisterModel = require('../models/CashRegister');
    await CashRegisterModel.collection.dropIndexes();
    
    await CashRegisterModel.collection.createIndex({ date: 1, user: 1 });
    
    res.json({ 
      message: 'Índices corregidos exitosamente',
      success: true 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
