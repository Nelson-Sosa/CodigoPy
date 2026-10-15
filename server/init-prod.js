/**
 * init-prod.js — Script de inicialización segura para producción
 *
 * ✅ NO borra datos existentes
 * ✅ Solo crea lo que falta (idempotente)
 * ✅ Crea 1 admin si no hay ninguno
 * ✅ Crea categorías base si no hay ninguna
 * ✅ Muestra resumen de lo encontrado y lo creado
 *
 * Uso (cambia ADMIN_EMAIL y ADMIN_PASS por tus valores reales):
 *   node init-prod.js                  (usa el .env local → BD local/dev)
 * Variables opcionales para sobrescribir el admin por defecto:
 *   ADMIN_EMAIL  →  email del admin a crear  (default: admin@codigopy.com)
 *   ADMIN_PASS   →  contraseña del admin      (default: Admin2025!)
 *   ADMIN_NAME   →  nombre del admin          (default: Admin CodigoPy)
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
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@codigopy.com';
    const adminPass  = process.env.ADMIN_PASS  || 'Admin2025!';
    const adminName  = process.env.ADMIN_NAME  || 'Admin CodigoPy';
    await User.create({
      name:     adminName,
      email:    adminEmail,
      password: adminPass,
      role:     'admin',
    });
    console.log(`✅ Administrador creado: ${adminEmail}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña desde el panel admin después de ingresar.');
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
