const CashRegister = require('../models/CashRegister');
const Sale = require('../models/Sale');
const { getPyDateKey } = require('../utils/date');

async function autoCloseOldRegisters(dateKey) {
  const oldOpenRegisters = await CashRegister.find({
    dateKey: { $lt: dateKey },
    status: 'open'
  });

  for (const reg of oldOpenRegisters) {
    const sales = await Sale.find({
      dateKey: reg.dateKey,
      status: { $ne: 'cancelled' }
    }).lean();

    let cashSales = 0;
    sales.forEach(sale => {
      if (sale.paymentMethod === 'cash') {
        cashSales += sale.total;
      }
    });

    const expectedCash = reg.openingAmount + cashSales;

    reg.status = 'closed';
    reg.closedAt = new Date();
    reg.closingAmount = 0;
    reg.expectedAmount = expectedCash;
    reg.cashSales = cashSales;
    reg.totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    reg.totalCash = expectedCash;
    reg.salesCount = sales.length;
    reg.notes = 'Cerrada automáticamente por sistema - día anterior no cerrado';
    await reg.save();
  }

  return oldOpenRegisters.length;
}

exports.getToday = async (req, res) => {
  try {
    const dateKey = getPyDateKey();
    await autoCloseOldRegisters(dateKey);

    let cashRegister = await CashRegister.findOne({ 
      dateKey,
      status: 'open'
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
    const dateKey = getPyDateKey();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el administrador puede abrir la caja' });
    }

    await autoCloseOldRegisters(dateKey);

    const existing = await CashRegister.findOne({
      dateKey,
      status: 'open'
    });

    if (existing) {
      return res.status(400).json({ message: 'La caja ya está abierta para hoy' });
    }

    const cashRegister = await CashRegister.create({
      dateKey,
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
    const dateKey = getPyDateKey();

    // Solo el admin puede cerrar caja
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el administrador puede cerrar la caja' });
    }

    const cashRegister = await CashRegister.findOne({
      dateKey,
      status: 'open'
    });

    if (!cashRegister) {
      return res.status(400).json({ message: 'No hay caja abierta para hoy' });
    }

    const sales = await Sale.find({
      dateKey,
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
      .sort({ dateKey: -1 })
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
    const dateKey = getPyDateKey();
    const dateKeyStr = dateKey.toString();
    const monthStart = Number(dateKeyStr.slice(0, 6) + '01');
    
    await autoCloseOldRegisters(dateKey);

    const todayRegister = await CashRegister.findOne({
      dateKey,
      status: 'open'
    });
    
    let todayStatus = 'not_opened';
    let openingAmount = 0;
    
    if (todayRegister && todayRegister.status) {
      todayStatus = todayRegister.status;
      openingAmount = todayRegister.openingAmount || 0;
    }

    const todaySales = await Sale.find({
      dateKey,
      status: { $ne: 'cancelled' }
    }).lean();
    
    const monthSales = await Sale.find({
      dateKey: { $gte: monthStart, $lte: dateKey },
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
    let monthCardSales = 0;
    let monthTransferSales = 0;
    let monthCreditSales = 0;
    let monthTotal = 0;
    monthSales.forEach(sale => {
      monthTotal += sale.total;
      switch (sale.paymentMethod) {
        case 'cash': monthCashSales += sale.total; break;
        case 'card': monthCardSales += sale.total; break;
        case 'transfer': monthTransferSales += sale.total; break;
        case 'credit': monthCreditSales += sale.total; break;
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
      monthCard: monthCardSales,
      monthTransfer: monthTransferSales,
      monthCredit: monthCreditSales,
      monthSalesCount: monthSales.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reopen = async (req, res) => {
  try {
    const { openingAmount = 0 } = req.body;
    const dateKey = getPyDateKey();

    const existing = await CashRegister.findOne({
      dateKey,
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
    
    await CashRegisterModel.collection.createIndex({ dateKey: 1, user: 1 });
    
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
    const dateKey = getPyDateKey();
    
    const result = await CashRegister.updateMany(
      { dateKey, status: 'open' },
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

exports.forceCloseAllAny = async (req, res) => {
  try {
    const result = await CashRegister.updateMany(
      { status: 'open' },
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

exports.cleanDuplicates = async (req, res) => {
  try {
    const all = await CashRegister.find().sort({ date: -1, createdAt: -1 }).lean();
    
    const toDelete = [];
    const seen = new Set();
    
    for (const reg of all) {
      const key = `${reg.date?.toISOString().split('T')[0]}-${reg.user}`;
      if (seen.has(key)) {
        toDelete.push(reg._id);
      } else {
        seen.add(key);
      }
    }
    
    if (toDelete.length === 0) {
      return res.json({ message: 'No hay registros duplicados', deleted: 0 });
    }
    
    await CashRegister.deleteMany({ _id: { $in: toDelete } });
    
    res.json({ 
      message: `Se eliminaron ${toDelete.length} registros duplicados`,
      deleted: toDelete.length 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRegister = async (req, res) => {
  try {
    const { registerId } = req.body;
    
    if (!registerId) {
      return res.status(400).json({ message: 'Falta registerId' });
    }
    
    const result = await CashRegister.findByIdAndDelete(registerId);
    
    if (!result) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    
    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteByUserName = async (req, res) => {
  try {
    const { userName, date } = req.body;
    
    const User = require('../models/User');
    const user = await User.findOne({ name: userName });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const query = { user: user._id };
    if (date) {
      query.date = new Date(date);
    }
    
    const result = await CashRegister.deleteMany(query);
    
    res.json({ message: `${result.deletedCount} registro(s) eliminado(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
