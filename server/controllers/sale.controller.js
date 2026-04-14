const Sale     = require('../models/Sale');
const Product  = require('../models/Product');
const Movement = require('../models/Movement');
const Client   = require('../models/Client');

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, status, client, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
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

      const itemSubtotal = item.quantity * product.salePrice;
      subtotal  += itemSubtotal;
      totalCost += item.quantity * product.costPrice;

      saleItems.push({
        product:     product._id,
        productName: product.name,
        quantity:    item.quantity,
        unitPrice:   product.salePrice,
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
      const product = await Product.findById(item.productId);
      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await Movement.create({
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

      const itemSubtotal = item.quantity * product.salePrice;
      subtotal  += itemSubtotal;
      totalCost += item.quantity * product.costPrice;

      saleItems.push({
        product:     product._id,
        productName: product.name,
        quantity:    item.quantity,
        unitPrice:   product.salePrice,
        costPrice:   product.costPrice,
        subtotal:    itemSubtotal,
      });

      // Actualizar stock con nuevos valores
      const prevStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await Movement.create({
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
