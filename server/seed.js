require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User     = require('./models/User');
const Category = require('./models/Category');
const Product  = require('./models/Product');
const Client   = require('./models/Client');
const Sale     = require('./models/Sale');
const Movement = require('./models/Movement');

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Limpiando base de datos...');
  await Promise.all([
    User.deleteMany(), Category.deleteMany(), Product.deleteMany(),
    Client.deleteMany(), Sale.deleteMany(), Movement.deleteMany(),
  ]);

  // ── Usuarios ─────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin CodigoPy', email: 'admin@codigopy.com',
    password: 'admin123', role: 'admin',
  });
  await User.create({
    name: 'Vendedor Demo', email: 'vendedor@codigopy.com',
    password: 'demo123', role: 'vendedor',
  });
  console.log('✅ Usuarios creados');

  // ── Categorías ────────────────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: 'Laptops',      description: 'Portátiles y notebooks',          color: '#3B82F6', icon: '💻' },
    { name: 'Smartphones',  description: 'Celulares y teléfonos',           color: '#10B981', icon: '📲' },
    { name: 'Accesorios',   description: 'Cargadores, cables y periféricos',color: '#F59E0B', icon: '🎧' },
    { name: 'Componentes',  description: 'RAM, SSD, procesadores',          color: '#8B5CF6', icon: '💾' },
    { name: 'Audio',        description: 'Auriculares y parlantes',         color: '#EC4899', icon: '🔊' },
  ]);
  console.log('✅ Categorías creadas');

  // ── Productos ─────────────────────────────────────────────────────
  const products = await Product.insertMany([
    { name: 'MacBook Pro 14"',         sku: 'LAP-001', description: 'Chip M3 Pro, 18GB RAM', category: cats[0]._id, salePrice: 7500000, costPrice: 6000000, stock: 7,  minStock: 3 },
    { name: 'Dell XPS 15',             sku: 'LAP-002', description: 'Intel i7, 16GB, OLED',  category: cats[0]._id, salePrice: 6200000, costPrice: 5000000, stock: 5,  minStock: 2 },
    { name: 'ASUS Vivobook 16',        sku: 'LAP-003', description: 'Ryzen 7, 8GB RAM',       category: cats[0]._id, salePrice: 2800000, costPrice: 2200000, stock: 2,  minStock: 5 },
    { name: 'iPhone 15 Pro',           sku: 'SMR-001', description: 'Titanio, chip A17',      category: cats[1]._id, salePrice: 3800000, costPrice: 2900000, stock: 12, minStock: 3 },
    { name: 'Samsung Galaxy S24 Ultra',sku: 'SMR-002', description: '6.8" con S-Pen',        category: cats[1]._id, salePrice: 4500000, costPrice: 3500000, stock: 8,  minStock: 3 },
    { name: 'iPhone 15 128GB Black',   sku: 'SMR-003', description: 'Chip A16 Bionic',       category: cats[1]._id, salePrice: 3200000, costPrice: 2600000, stock: 15, minStock: 4 },
    { name: 'Cable USB-C 2m',          sku: 'ACC-001', description: 'Carga rápida 65W',       category: cats[2]._id, salePrice: 55000,   costPrice: 25000,   stock: 80, minStock: 15 },
    { name: 'Cargador 65W PD',         sku: 'ACC-002', description: 'Power Delivery',         category: cats[2]._id, salePrice: 180000,  costPrice: 110000,  stock: 3,  minStock: 8 },
    { name: 'Mouse Logitech MX Master',sku: 'ACC-003', description: 'Inalámbrico ergonómico', category: cats[2]._id, salePrice: 380000,  costPrice: 250000,  stock: 11, minStock: 4 },
    { name: 'SSD Kingston 480GB',      sku: 'COM-001', description: 'SATA Kingston A400',     category: cats[3]._id, salePrice: 350000,  costPrice: 220000,  stock: 9,  minStock: 4 },
    { name: 'RAM DDR5 16GB',           sku: 'COM-002', description: 'Corsair Vengeance 5600', category: cats[3]._id, salePrice: 420000,  costPrice: 300000,  stock: 6,  minStock: 3 },
    { name: 'Sony WH-1000XM5',         sku: 'AUD-001', description: 'Cancelación de ruido',   category: cats[4]._id, salePrice: 1400000, costPrice: 950000,  stock: 1,  minStock: 3 },
    { name: 'JBL Tune 510BT',          sku: 'AUD-002', description: 'Bluetooth 5.0',          category: cats[4]._id, salePrice: 185000,  costPrice: 120000,  stock: 20, minStock: 5 },
    { name: 'JBL Go 3',               sku: 'AUD-003', description: 'Parlante resistente agua',category: cats[4]._id, salePrice: 140000,  costPrice: 90000,   stock: 0,  minStock: 3 },
  ]);
  console.log('✅ Productos creados');

  // ── Clientes ──────────────────────────────────────────────────────
  const clients = await Client.insertMany([
    { name: 'María García',    phone: '0981-123456', email: 'maria@gmail.com',    city: 'Asunción',          ruc: '1234567-8' },
    { name: 'Carlos Rodríguez',phone: '0991-234567', email: 'carlos@gmail.com',   city: 'San Lorenzo' },
    { name: 'Ferretería Don Pedro', phone: '021-345678', email: 'donpedro@gmail.com', city: 'Fernando de la Mora', ruc: '9876543-2' },
    { name: 'Laura Martínez',  phone: '0982-456789', city: 'Luque' },
    { name: 'TechShop PY',     phone: '021-567890', email: 'techshop@gmail.com',  city: 'Asunción',          ruc: '5555555-5' },
  ]);
  console.log('✅ Clientes creados');

  // ── Ventas demo ───────────────────────────────────────────────────
  const salesData = [
    {
      client: clients[0]._id, clientName: clients[0].name,
      items: [
        { product: products[3]._id, productName: products[3].name, quantity: 1, unitPrice: 3800000, costPrice: 2900000, subtotal: 3800000 },
        { product: products[6]._id, productName: products[6].name, quantity: 2, unitPrice: 55000,   costPrice: 25000,   subtotal: 110000  },
      ],
      subtotal: 3910000, discount: 0, total: 3910000, totalCost: 2950000, profit: 960000,
      paymentMethod: 'card', createdBy: admin._id,
    },
    {
      client: clients[1]._id, clientName: clients[1].name,
      items: [
        { product: products[12]._id, productName: products[12].name, quantity: 1, unitPrice: 185000, costPrice: 120000, subtotal: 185000 },
        { product: products[6]._id,  productName: products[6].name,  quantity: 3, unitPrice: 55000,  costPrice: 25000,  subtotal: 165000 },
      ],
      subtotal: 350000, discount: 10000, total: 340000, totalCost: 195000, profit: 145000,
      paymentMethod: 'cash', createdBy: admin._id,
    },
    {
      client: clients[4]._id, clientName: clients[4].name,
      items: [
        { product: products[0]._id, productName: products[0].name, quantity: 1, unitPrice: 7500000, costPrice: 6000000, subtotal: 7500000 },
        { product: products[8]._id, productName: products[8].name, quantity: 1, unitPrice: 380000,  costPrice: 250000,  subtotal: 380000  },
      ],
      subtotal: 7880000, discount: 80000, total: 7800000, totalCost: 6250000, profit: 1550000,
      paymentMethod: 'transfer', createdBy: admin._id,
    },
    {
      clientName: 'Cliente General',
      items: [
        { product: products[6]._id, productName: products[6].name, quantity: 5, unitPrice: 55000, costPrice: 25000, subtotal: 275000 },
      ],
      subtotal: 275000, discount: 0, total: 275000, totalCost: 125000, profit: 150000,
      paymentMethod: 'cash', createdBy: admin._id,
    },
    {
      client: clients[2]._id, clientName: clients[2].name,
      items: [
        { product: products[9]._id,  productName: products[9].name,  quantity: 2, unitPrice: 350000, costPrice: 220000, subtotal: 700000 },
        { product: products[10]._id, productName: products[10].name, quantity: 1, unitPrice: 420000, costPrice: 300000, subtotal: 420000 },
      ],
      subtotal: 1120000, discount: 0, total: 1120000, totalCost: 740000, profit: 380000,
      paymentMethod: 'card', createdBy: admin._id,
    },
  ];

  for (const saleData of salesData) {
    await Sale.create(saleData);
  }
  console.log('✅ Ventas demo creadas');

  // Actualizar stats de clientes
  await Client.findByIdAndUpdate(clients[0]._id, { totalPurchases: 1, totalSpent: 3910000 });
  await Client.findByIdAndUpdate(clients[1]._id, { totalPurchases: 1, totalSpent: 340000  });
  await Client.findByIdAndUpdate(clients[4]._id, { totalPurchases: 1, totalSpent: 7800000 });
  await Client.findByIdAndUpdate(clients[2]._id, { totalPurchases: 1, totalSpent: 1120000 });

  // Movimientos históricos de ejemplo
  await Movement.insertMany([
    { product: products[0]._id, productName: products[0].name, type: 'in',  quantity: 10, previousStock: 0,  newStock: 10, reason: 'Stock inicial', createdBy: admin._id },
    { product: products[3]._id, productName: products[3].name, type: 'in',  quantity: 15, previousStock: 0,  newStock: 15, reason: 'Stock inicial', createdBy: admin._id },
    { product: products[7]._id, productName: products[7].name, type: 'out', quantity: 5,  previousStock: 8,  newStock: 3,  reason: 'Venta directa', createdBy: admin._id },
    { product: products[13]._id,productName: products[13].name,type: 'out', quantity: 3,  previousStock: 3,  newStock: 0,  reason: 'Venta en tienda',createdBy: admin._id },
  ]);
  console.log('✅ Movimientos iniciales creados');

  console.log('\n🎉 ¡Base de datos lista para el demo de CodigoPy!\n');
  console.log('┌──────────────────────────────────────────────┐');
  console.log('│  👤 USUARIOS DE ACCESO                       │');
  console.log('│  Admin:    admin@codigopy.com / admin123      │');
  console.log('│  Operador: operador@codigopy.com / demo123    │');
  console.log('└──────────────────────────────────────────────┘\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
