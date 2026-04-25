const Sale     = require('../models/Sale');
const Product  = require('../models/Product');
const Movement = require('../models/Movement');
const Client   = require('../models/Client');
const { getPyDateKey } = require('../utils/date');

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, status, client, userId, page = 1, limit = 20 } = req.query;
    const filter = {};
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'supervisor';

    if (!isAdmin) {
      filter.createdBy = req.user._id;
    }
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (userId) filter.createdBy = userId;
    if (startDate || endDate) {
      const start = Number(startDate.replace(/-/g, ''));
      const end = Number(endDate.replace(/-/g, ''));
      filter.$or = [
        { dateKey: { $gte: start, $lte: end } },
        {
          dateKey: { $exists: false },
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate + 'T23:59:59')
          }
        }
      ];
    }

    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate('client', 'name ruc phone email address city')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ sales, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMySales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;
    const todayKey = getPyDateKey();
    const dateKeyStr = todayKey.toString();
    const monthStart = Number(dateKeyStr.slice(0, 6) + '01');

    const baseFilter = { status: { $ne: 'cancelled' }, createdBy: userId };
    const dateFilter = { ...baseFilter };
    
    if (startDate || endDate) {
      const start = Number(startDate.replace(/-/g, ''));
      const end = Number(endDate.replace(/-/g, ''));
      dateFilter.$or = [
        { dateKey: { $gte: start, $lte: end } },
        {
          dateKey: { $exists: false },
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate + 'T23:59:59')
          }
        }
      ];
    }

    const todaySales = await Sale.find({
      ...baseFilter,
      $or: [
        { dateKey: todayKey },
        { dateKey: { $exists: false }, createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)), $lte: new Date(new Date().setHours(23,59,59,999)) } }
      ]
    }).lean();
    const monthSales = await Sale.find({
      ...baseFilter,
      $or: [
        { dateKey: { $gte: monthStart, $lte: todayKey } },
        { dateKey: { $exists: false }, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lte: new Date() } }
      ]
    }).lean();
    const allSales = await Sale.find({ ...baseFilter }).lean();

    const calcStats = (sales) => ({
      count: sales.length,
      total: sales.reduce((acc, s) => acc + s.total, 0),
      profit: sales.reduce((acc, s) => acc + (s.profit || 0), 0),
      products: sales.reduce((acc, s) => acc + s.items.reduce((i, item) => i + item.quantity, 0), 0),
    });

    const todayStats = calcStats(todaySales);
    const monthStats = calcStats(monthSales);
    const allStats = calcStats(allSales);

    const recentSales = await Sale.find(baseFilter)
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      today: todayStats,
      month: monthStats,
      all: allStats,
      recentSales,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const todayKey = getPyDateKey();
    const dateKeyStr = todayKey.toString();
    const monthStart = Number(dateKeyStr.slice(0, 6) + '01');

    const users = await Sale.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$createdBy',
          salesCount: { $sum: 1 },
          totalSales: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
          productsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          salesCount: 1,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          productsSold: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const todaySales = await Sale.aggregate([
      { $match: { dateKey: todayKey, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$createdBy',
          salesCount: { $sum: 1 },
          totalSales: { $sum: '$total' },
        },
      },
    ]);

    const monthSales = await Sale.aggregate([
      { $match: { dateKey: { $gte: monthStart, $lte: todayKey }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$createdBy',
          salesCount: { $sum: 1 },
          totalSales: { $sum: '$total' },
          totalProfit: { $sum: '$profit' },
        },
      },
    ]);

    const result = users.map((u) => {
      const tSales = todaySales.find((t) => t._id.toString() === u._id.toString()) || { salesCount: 0, totalSales: 0 };
      const mSales = monthSales.find((m) => m._id.toString() === u._id.toString()) || { salesCount: 0, totalSales: 0, totalProfit: 0 };
      return {
        ...u,
        todayCount: tSales.salesCount,
        todaySales: tSales.totalSales,
        monthCount: mSales.salesCount,
        monthSales: mSales.totalSales,
        monthProfit: mSales.totalProfit,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client', 'name ruc phone email address city')
      .populate('createdBy', 'name email');
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    
    if (sale.client?.ruc) {
      sale.clientRuc = sale.client.ruc;
    }
    
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { items, clientId, discount = 0, paymentMethod = 'cash', notes } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'La venta debe tener al menos un producto' });

    let subtotal  = 0;
    let totalCost = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: `Producto no encontrado: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` });

      const unitPrice = item.unitPrice ?? product.salePrice;
      const itemSubtotal = item.quantity * unitPrice;
      subtotal  += itemSubtotal;
      totalCost += item.quantity * product.costPrice;

      saleItems.push({
        product:     product._id,
        productName: product.name,
        quantity:    item.quantity,
        unitPrice:   unitPrice,
        costPrice:   product.costPrice,
        subtotal:    itemSubtotal,
      });
    }

    const total  = subtotal - Number(discount);
    const profit = total - totalCost;

    // Obtener nombre y RUC del cliente
    let clientName = 'Cliente General';
    let clientRuc = '';
    if (clientId) {
      const clientDoc = await Client.findById(clientId);
      if (clientDoc) {
        clientName = clientDoc.name;
        clientRuc = clientDoc.ruc || '';
      }
    }

    const sale = await Sale.create({
      dateKey: getPyDateKey(),
      client: clientId || null,
      clientName,
      clientRuc,
      items: saleItems,
      subtotal,
      discount: Number(discount),
      total,
      totalCost,
      profit,
      paymentMethod,
      notes,
      createdBy: req.user._id,
    });

    // Actualizar stock y crear movimientos
    for (const item of items) {
      const product = await Product.findById(item.product);
      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await Movement.create({
        dateKey: getPyDateKey(),
        product:       product._id,
        productName:   product.name,
        type:          'out',
        quantity:      item.quantity,
        previousStock: prevStock,
        newStock:      product.stock,
        reason:        `Venta ${sale.invoiceNumber}`,
        reference:     sale._id.toString(),
        createdBy:     req.user._id,
      });
    }

    // Actualizar estadísticas del cliente
    if (clientId) {
      await Client.findByIdAndUpdate(clientId, {
        $inc: { totalPurchases: 1, totalSpent: total },
      });
    }

    await sale.populate('client', 'name phone');
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    if (sale.status === 'cancelled')
      return res.status(400).json({ message: 'La venta ya está cancelada' });

    sale.status = 'cancelled';
    await sale.save();

    // Revertir stock
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        product.stock += item.quantity;
        await product.save();

        await Movement.create({
          dateKey: getPyDateKey(),
          product:       product._id,
          productName:   product.name,
          type:          'in',
          quantity:      item.quantity,
          previousStock: prevStock,
          newStock:      product.stock,
          reason:        `Cancelación de venta ${sale.invoiceNumber}`,
          reference:     sale._id.toString(),
          createdBy:     req.user._id,
        });
      }
    }

    res.json({ message: 'Venta cancelada y stock restaurado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
    if (sale.status === 'cancelled')
      return res.status(400).json({ message: 'No se puede editar una venta cancelada' });

    const { items, clientId, discount = 0, paymentMethod, notes } = req.body;

    // Revertir stock original
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        product.stock += item.quantity;
        await product.save();

        await Movement.create({
          dateKey: getPyDateKey(),
          product:       product._id,
          productName:   product.name,
          type:          'in',
          quantity:      item.quantity,
          previousStock: prevStock,
          newStock:      product.stock,
          reason:        `Reversión por edición de venta ${sale.invoiceNumber}`,
          reference:     sale._id.toString(),
          createdBy:     req.user._id,
        });
      }
    }

    // Procesar nuevos items
    let subtotal  = 0;
    let totalCost = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: `Producto no encontrado: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` });

      const unitPrice = item.unitPrice ?? product.salePrice;
      const itemSubtotal = item.quantity * unitPrice;
      subtotal  += itemSubtotal;
      totalCost += item.quantity * product.costPrice;

      saleItems.push({
        product:     product._id,
        productName: product.name,
        quantity:    item.quantity,
        unitPrice:   unitPrice,
        costPrice:   product.costPrice,
        subtotal:    itemSubtotal,
      });

      // Actualizar stock con nuevos valores
      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await Movement.create({
        dateKey: getPyDateKey(),
        product:       product._id,
        productName:   product.name,
        type:          'out',
        quantity:      item.quantity,
        previousStock: prevStock,
        newStock:      product.stock,
        reason:        `Venta ${sale.invoiceNumber} (editada)`,
        reference:     sale._id.toString(),
        createdBy:     req.user._id,
      });
    }

    const total  = subtotal - Number(discount);
    const profit = total - totalCost;

    // Obtener nombre del cliente
    let clientName = 'Cliente General';
    if (clientId) {
      const clientDoc = await Client.findById(clientId);
      if (clientDoc) clientName = clientDoc.name;
    }

    // Actualizar venta
    sale.client = clientId || null;
    sale.clientName = clientName;
    sale.items = saleItems;
    sale.subtotal = subtotal;
    sale.discount = Number(discount);
    sale.total = total;
    sale.totalCost = totalCost;
    sale.profit = profit;
    if (paymentMethod) sale.paymentMethod = paymentMethod;
    if (notes !== undefined) sale.notes = notes;
    await sale.save();

    await sale.populate('client', 'name phone');
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
