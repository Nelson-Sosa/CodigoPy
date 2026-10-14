/**
 * init-prod.js — Script de inicialización segura para producción
 *
 * ✅ NO borra datos existentes
 * ✅ Solo crea lo que falta (idempotente)
 * ✅ Crea 1 admin si no hay ninguno
 * ✅ Crea categorías base si no hay ninguna
 * ✅ Muestra resumen de lo encontrado y lo creado
 *
 * Uso:
 *   node init-prod.js                  (usa el .env local → BD local/dev)
 *   MONGO_URI=mongodb+srv://... node init-prod.js   (apunta a Atlas producción)
 *
 * IMPORTANTE: cambiar las contraseñas desde el panel admin después de ejecutar.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI no está configurado.');
  process.exit(1);
}

// Categorías base del sistema — solo se insertan si la colección está vacía
const BASE_CATEGORIES = [
  { name: 'General',      description: 'Productos generales',             color: '#6B7280' },
  { name: 'Electrónica',  description: 'Equipos y dispositivos',          color: '#3B82F6' },
  { name: 'Accesorios',   description: 'Cargadores, cables y periféricos',color: '#F59E0B' },
  { name: 'Componentes',  description: 'Partes y repuestos',              color: '#8B5CF6' },
  { name: 'Audio',        description: 'Auriculares y parlantes',         color: '#EC4899' },
];

const run = async () => {
  console.log('\n🔗 Conectando a MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log(`✅ Conectado: ${mongoose.connection.host}`);

  // ── 1. Verificar usuarios existentes ────────────────────────────────────
  const totalUsers = await User.countDocuments();
  const adminExists = await User.findOne({ role: 'admin', isActive: true });

  console.log(`\n👥 Usuarios en la BD: ${totalUsers}`);

  if (adminExists) {
    console.log(`✅ Ya existe un administrador: ${adminExists.email}`);
  } else {
    console.log('⚠️  No hay ningún administrador activo. Creando uno...');
    await User.create({
      name:     'Admin CodigoPy',
      email:    'admin@codigopy.com',
      password: 'Admin2025!',
      role:     'admin',
    });
    console.log('✅ Administrador creado: admin@codigopy.com / Admin2025!');
    console.log('⚠️  IMPORTANTE: Cambia esta contraseña desde el panel admin después de ingresar.');
  }

  // ── 2. Verificar categorías existentes ───────────────────────────────────
  const totalCats = await Category.countDocuments();
  console.log(`\n🏷️  Categorías en la BD: ${totalCats}`);

  if (totalCats > 0) {
    const catNames = await Category.find().select('name').lean();
    console.log(`✅ Categorías existentes: ${catNames.map(c => c.name).join(', ')}`);
  } else {
    console.log('⚠️  No hay categorías. Creando categorías base...');
    await Category.insertMany(BASE_CATEGORIES);
    console.log(`✅ ${BASE_CATEGORIES.length} categorías creadas.`);
  }

  // ── 3. Resumen de la BD ──────────────────────────────────────────────────
  const Product  = require('./models/Product');
  const Sale     = require('./models/Sale');
  const Client   = require('./models/Client');

  const [prods, sales, clients] = await Promise.all([
    Product.countDocuments(),
    Sale.countDocuments(),
    Client.countDocuments(),
  ]);

  console.log('\n📊 Estado actual de la base de datos:');
  console.log(`   Usuarios:   ${await User.countDocuments()}`);
  console.log(`   Categorías: ${await Category.countDocuments()}`);
  console.log(`   Productos:  ${prods}`);
  console.log(`   Clientes:   ${clients}`);
  console.log(`   Ventas:     ${sales}`);
  console.log('\n✅ Inicialización completada.\n');

  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
