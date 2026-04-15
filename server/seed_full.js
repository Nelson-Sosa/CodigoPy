const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Client = require('./models/Client');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Movement = require('./models/Movement');
const Sale = require('./models/Sale');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Client.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Movement.deleteMany({});
    await Sale.deleteMany({});
    console.log('🗑️ Datos existentes eliminados');

    // Crear usuarios
    const users = await User.create([
      { name: 'Nelson', email: 'nelson@admin.com', password: '123456', role: 'admin' },
      { name: 'Carlos', email: 'carlos@vendedor.com', password: '123456', role: 'vendedor' },
      { name: 'María', email: 'maria@vendedor.com', password: '123456', role: 'vendedor' },
    ]);
    console.log('✅ Usuarios creados:', users.length);

    // Crear clientes
    const clients = await Client.create([
      { name: 'Juan Pérez', email: 'juan@perez.com', phone: '555-0101', address: 'Calle 123, Ciudad' },
      { name: 'Ana García', email: 'ana@garcia.com', phone: '555-0102', address: 'Av. Principal 456' },
      { name: 'Roberto López', email: 'roberto@lopez.com', phone: '555-0103', address: 'Blvd. Central 789' },
      { name: 'Laura Martínez', email: 'laura@martinez.com', phone: '555-0104' },
    ]);
    console.log('✅ Clientes creados:', clients.length);

    // Crear categorías
    const categories = await Category.create([
      { name: 'Laptops', description: 'Computadoras portátiles', color: '#3b82f6', icon: 'laptop' },
      { name: 'Smartphones', description: 'Teléfonos móviles', color: '#10b981', icon: 'smartphone' },
      { name: 'Accesorios', description: 'Accesorios electrónicos', color: '#f59e0b', icon: 'headphones' },
      { name: 'Tablets', description: 'Tablets y pads', color: '#8b5cf6', icon: 'tablet' },
    ]);
    console.log('✅ Categorías creadas:', categories.length);

    // Crear productos
    const products = await Product.create([
      { 
        sku: 'NBK-001', 
        name: 'Notebook Dell XPS 15 9530', 
        description: 'Laptop Dell XPS 15 con Intel Core i7, 16GB RAM, 512GB SSD',
        category: categories[0]._id, 
        salePrice: 1599.00, 
        costPrice: 1100.00, 
        stock: 10, 
        minStock: 5, 
        maxStock: 50,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'NBK-002', 
        name: 'MacBook Pro 14"', 
        description: 'Apple MacBook Pro con chip M3, 16GB RAM, 512GB SSD',
        category: categories[0]._id, 
        salePrice: 2499.00, 
        costPrice: 1800.00, 
        stock: 5, 
        minStock: 3, 
        maxStock: 20,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'SPH-001', 
        name: 'iPhone 15 Pro', 
        description: 'Apple iPhone 15 Pro, 256GB, Titanio',
        category: categories[1]._id, 
        salePrice: 1199.00, 
        costPrice: 850.00, 
        stock: 15, 
        minStock: 10, 
        maxStock: 100,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'SPH-002', 
        name: 'Samsung Galaxy S24 Ultra', 
        description: 'Samsung Galaxy S24 Ultra, 512GB',
        category: categories[1]._id, 
        salePrice: 1099.00, 
        costPrice: 780.00, 
        stock: 3, 
        minStock: 5, 
        maxStock: 50,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'ACC-001', 
        name: 'AirPods Pro 2', 
        description: 'Apple AirPods Pro de segunda generación con USB-C',
        category: categories[2]._id, 
        salePrice: 249.00, 
        costPrice: 150.00, 
        stock: 25, 
        minStock: 10, 
        maxStock: 100,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'ACC-002', 
        name: 'Cargador MagSafe', 
        description: 'Cargador magnético Apple MagSafe 15W',
        category: categories[2]._id, 
        salePrice: 39.00, 
        costPrice: 20.00, 
        stock: 0, 
        minStock: 15, 
        maxStock: 200,
        unit: 'unidad',
        status: 'active'
      },
      { 
        sku: 'TBL-001', 
        name: 'iPad Pro 12.9"', 
        description: 'Apple iPad Pro 12.9" con chip M2',
        category: categories[3]._id, 
        salePrice: 1299.00, 
        costPrice: 900.00, 
        stock: 8, 
        minStock: 5, 
        maxStock: 30,
        unit: 'unidad',
        status: 'active'
      },
    ]);
    console.log('✅ Productos creados:', products.length);

    // Crear movimientos
    const movements = await Movement.create([
      { product: products[0]._id, productName: products[0].name, type: 'in', quantity: 15, previousStock: 0, newStock: 15, reason: 'Compra a proveedor', createdBy: users[0]._id },
      { product: products[0]._id, productName: products[0].name, type: 'out', quantity: 5, previousStock: 15, newStock: 10, reason: 'Venta a cliente', createdBy: users[0]._id },
      { product: products[2]._id, productName: products[2].name, type: 'in', quantity: 20, previousStock: 0, newStock: 20, reason: 'Compra a proveedor', createdBy: users[1]._id },
      { product: products[2]._id, productName: products[2].name, type: 'out', quantity: 5, previousStock: 20, newStock: 15, reason: 'Venta a cliente', createdBy: users[1]._id },
      { product: products[1]._id, productName: products[1].name, type: 'in', quantity: 8, previousStock: 0, newStock: 8, reason: 'Compra a proveedor', createdBy: users[0]._id },
      { product: products[1]._id, productName: products[1].name, type: 'out', quantity: 3, previousStock: 8, newStock: 5, reason: 'Venta a cliente', createdBy: users[2]._id },
    ]);
    console.log('✅ Movimientos creados:', movements.length);

    // Crear ventas
    const now = new Date();
    const sales = await Sale.create([
      {
        client: clients[0]._id,
        clientName: clients[0].name,
        items: [
          { product: products[0]._id, productName: products[0].name, quantity: 1, unitPrice: 1599.00, costPrice: 1100.00, subtotal: 1599.00 },
          { product: products[4]._id, productName: products[4].name, quantity: 2, unitPrice: 249.00, costPrice: 150.00, subtotal: 498.00 },
        ],
        subtotal: 2097.00,
        total: 2097.00,
        totalCost: 1400.00,
        profit: 697.00,
        paymentMethod: 'cash',
        status: 'completed',
        createdBy: users[0]._id,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[1]._id,
        clientName: clients[1].name,
        items: [
          { product: products[2]._id, productName: products[2].name, quantity: 1, unitPrice: 1199.00, costPrice: 850.00, subtotal: 1199.00 },
        ],
        subtotal: 1199.00,
        total: 1199.00,
        totalCost: 850.00,
        profit: 349.00,
        paymentMethod: 'card',
        status: 'completed',
        createdBy: users[1]._id,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[2]._id,
        clientName: clients[2].name,
        items: [
          { product: products[1]._id, productName: products[1].name, quantity: 1, unitPrice: 2499.00, costPrice: 1800.00, subtotal: 2499.00 },
          { product: products[4]._id, productName: products[4].name, quantity: 1, unitPrice: 249.00, costPrice: 150.00, subtotal: 249.00 },
        ],
        subtotal: 2748.00,
        total: 2748.00,
        totalCost: 1950.00,
        profit: 798.00,
        paymentMethod: 'transfer',
        status: 'completed',
        createdBy: users[0]._id,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[3]._id,
        clientName: clients[3].name,
        items: [
          { product: products[6]._id, productName: products[6].name, quantity: 2, unitPrice: 1299.00, costPrice: 900.00, subtotal: 2598.00 },
        ],
        subtotal: 2598.00,
        total: 2598.00,
        totalCost: 1800.00,
        profit: 798.00,
        paymentMethod: 'credit',
        status: 'completed',
        createdBy: users[2]._id,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        client: clients[0]._id,
        clientName: clients[0].name,
        items: [
          { product: products[2]._id, productName: products[2].name, quantity: 3, unitPrice: 1199.00, costPrice: 850.00, subtotal: 3597.00 },
        ],
        subtotal: 3597.00,
        total: 3597.00,
        totalCost: 2550.00,
        profit: 1047.00,
        paymentMethod: 'cash',
        status: 'completed',
        createdBy: users[1]._id,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log('✅ Ventas creadas:', sales.length);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 Datos creados:');
    console.log('   - Usuarios: 3 (nelson@admin.com, carlos@vendedor.com, maria@vendedor.com)');
    console.log('   - Clientes: 4');
    console.log('   - Categorías: 4');
    console.log('   - Productos: 7');
    console.log('   - Movimientos: 6');
    console.log('   - Ventas: 5');
    console.log('\n🔐 Contraseña para todos: 123456');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
