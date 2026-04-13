const CashRegister = require('../models/CashRegister');
const Sale = require('../models/Sale');

const PY_OFFSET_HOURS = -4;

const getPyDate = () => {
  const now = new Date();
  return new Date(now.getTime() + PY_OFFSET_HOURS * 60 * 60 * 1000);
};

const getPyToday = () => {
  const py = getPyDate();
  return new Date(py.getUTCFullYear(), py.getUTCMonth(), py.getUTCDate());
};

const getPyStartOfDay = () => {
  const py = getPyDate();
  return new Date(Date.UTC(py.getUTCFullYear(), py.getUTCMonth(), py.getUTCDate(), Math.abs(PY_OFFSET_HOURS), 0, 0, 0));
};

const getPyEndOfDay = () => {
  const py = getPyDate();
  return new Date(Date.UTC(py.getUTCFullYear(), py.getUTCMonth(), py.getUTCDate(), Math.abs(PY_OFFSET_HOURS) + 24, 0, 0, -1));
};

exports.getToday = async (req, res) => {
  try {
    const pyToday = getPyToday();
    let cashRegister = await CashRegister.findOne({ 
      date: pyToday,
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
    const pyToday = getPyToday();

    const existingOpen = await CashRegister.findOne({
      date: pyToday,
      user: req.user._id,
      status: 'open'
    });

    if (existingOpen) {
      return res.status(400).json({ message: 'La caja ya está abierta para hoy' });
    }

    const cashRegister = await CashRegister.create({
      date: pyToday,
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
    const pyToday = getPyToday();

    const cashRegister = await CashRegister.findOne({
      date: pyToday,
      user: req.user._id,
      status: 'open'
    });

    if (!cashRegister) {
      return res.status(400).json({ message: 'No hay caja abierta para hoy' });
    }

    const startOfDay = getPyStartOfDay();
    const endOfDay = getPyEndOfDay();

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).lean();

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
    const pyOffset = -4 * 60;
    const pyDate = new Date(now.getTime() + pyOffset * 60 * 1000);
    
    const todayYear = pyDate.getUTCFullYear();
    const todayMonth = pyDate.getUTCMonth();
    const todayDay = pyDate.getUTCDate();
    
    const todayStart = new Date(Date.UTC(todayYear, todayMonth, todayDay, pyOffset / 60, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(todayYear, todayMonth, todayDay, pyOffset / 60 + 24, 0, 0, -1));
    const startOfMonth = new Date(Date.UTC(todayYear, todayMonth, 1, pyOffset / 60, 0, 0, 0));
    
    const allRegisters = await CashRegister.find({
      user: req.user._id
    }).sort({ createdAt: -1 }).lean();
    
    let todayRegister = null;
    for (const reg of allRegisters) {
      const regDate = new Date(reg.date);
      const regPyDate = new Date(regDate.getTime() + pyOffset * 60 * 1000);
      if (regPyDate.getUTCFullYear() === todayYear && 
          regPyDate.getUTCMonth() === todayMonth && 
          regPyDate.getUTCDate() === todayDay) {
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
    const pyToday = getPyToday();

    const existing = await CashRegister.findOne({
      date: pyToday,
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

exports.forceCloseAll = async (req, res) => {
  try {
    const pyToday = getPyToday();
    
    const result = await CashRegister.updateMany(
      { date: pyToday, user: req.user._id, status: 'open' },
      { 
        status: 'closed',
        closedAt: new Date(),
        closingAmount: 0,
        notes: 'Cerrada por administrador'
      }
    );
    
    res.json({ 
      message: `${result.modifiedCount} caja(s) cerrada(s) exitosamente`,
      success: true 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
