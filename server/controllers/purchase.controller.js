const Purchase  = require('../models/Purchase');
const Product   = require('../models/Product');
const Movement  = require('../models/Movement');
const Supplier = require('../models/Supplier');

exports.getAll = async (req, res) => {
  try {
    const { status, supplier, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    const total = await Purchase.countDocuments(filter);
    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ purchases, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('createdBy', 'name');
    if (!purchase) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { supplierId, items, subtotal = 0, tax = 0, total = 0, paymentMethod = 'credit', notes, expectedDate } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'La orden debe tener al menos un producto' });

    const purchaseItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const itemSubtotal = item.quantity * item.unitCost;
      calculatedSubtotal += itemSubtotal;

      const isNewProduct = !item.productId || item.productId.startsWith('new-') || item.isNewProduct;

      let productData = {
        productName: item.productName || item.name,
        description: item.description || '',
        sku: item.sku || '',
        categoryId: item.categoryId || null,
        quantity: item.quantity,
        unitCost: item.unitCost,
        salePrice: item.salePrice || 0,
        subtotal: itemSubtotal,
        isNewProduct,
      };

      if (!isNewProduct && item.productId) {
        const product = await Product.findById(item.productId);
        if (product) {
          productData.product = product._id;
          productData.productName = product.name;
        } else {
          productData.isNewProduct = true;
        }
      }

      purchaseItems.push(productData);
    }

    const calculatedTotal = calculatedSubtotal + Number(tax);

    let supplierName = 'Proveedor General';
    if (supplierId) {
      const supplierDoc = await Supplier.findById(supplierId);
      if (supplierDoc) supplierName = supplierDoc.name;
    }

    const purchase = await Purchase.create({
      supplier: supplierId || null,
      supplierName,
      items: purchaseItems,
      subtotal: calculatedSubtotal,
      tax: Number(tax),
      total: calculatedTotal,
      paymentMethod,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      createdBy: req.user._id,
    });

    await purchase?.populate('supplier', 'name phone');
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.receive = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Orden no encontrada' });
    if (purchase.status === 'received')
      return res.status(400).json({ message: 'Esta orden ya fue recibida' });
    if (purchase.status === 'cancelled')
      return res.status(400).json({ message: 'Esta orden fue cancelada' });

    const newProductsCreated = [];

    for (const item of purchase.items) {
      let product;
      
      if (item.isNewProduct || !item.product) {
        product = await Product.create({
          name: item.productName,
          description: item.description || '',
          sku: item.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          costPrice: item.unitCost,
          salePrice: item.salePrice || item.unitCost * 1.3,
          stock: item.quantity,
          minStock: 5,
          category: item.categoryId || null,
        });
        newProductsCreated.push(product);
        
        item.product = product._id;
      } else {
        product = await Product.findById(item.product);
        if (product) {
          const prevStock = product.stock;
          product.stock += item.quantity;
          if (item.unitCost > 0) {
            product.costPrice = item.unitCost;
          }
          if (item.description) {
            product.description = item.description;
          }
          await product.save();
        }
      }

      if (product) {
        await Movement.create({
          product: product._id,
          productName: product.name,
          type: 'in',
          quantity: item.quantity,
          previousStock: product.stock - item.quantity,
          newStock: product.stock,
          reason: `Entrada por compra ${purchase.purchaseNumber}`,
          reference: purchase._id.toString(),
      createdBy: req.user?._id || null,
        });
      }
    }

    purchase.status = 'received';
    purchase.receivedDate = new Date();
    await purchase.save();

    await purchase.populate('supplier', 'name phone');
    res.json({ 
      purchase, 
      newProductsCreated,
      message: newProductsCreated.length > 0 
        ? `Se crearon ${newProductsCreated.length} productos nuevos`
        : 'Mercancía recibida correctamente'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Orden no encontrada' });
    if (purchase.status === 'received')
      return res.status(400).json({ message: 'No se puede cancelar una orden ya recibida' });
    if (purchase.status === 'cancelled')
      return res.status(400).json({ message: 'Esta orden ya fue cancelada' });

    purchase.status = 'cancelled';
    await purchase.save();

    res.json({ message: 'Orden cancelada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Orden no encontrada' });

    purchase.amountPaid = Number(amountPaid);
    if (purchase.amountPaid >= purchase.total) {
      purchase.paymentStatus = 'paid';
    } else if (purchase.amountPaid > 0) {
      purchase.paymentStatus = 'partial';
    } else {
      purchase.paymentStatus = 'pending';
    }

    await purchase.save();
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const totalPurchases = await Purchase.countDocuments({ status: 'received' });
    const pendingPurchases = await Purchase.countDocuments({ status: 'pending' });
    const totalSpent = await Purchase.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalPurchases,
      pendingPurchases,
      totalSpent: totalSpent[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
