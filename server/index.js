require('dotenv').config();

// Validación de seguridad para JWT_SECRET
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET no está configurado en las variables de entorno para producción.');
    process.exit(1);
  } else {
    console.warn('⚠️ [SEGURIDAD] JWT_SECRET no está definido en el archivo .env.');
    console.warn('⚠️ [SEGURIDAD] Usando clave provisional sólo para desarrollo local.');
    process.env.JWT_SECRET = 'dev_jwt_secret_local_only_codigopy_insecure';
  }
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Orígenes permitidos para CORS (desarrollo y dominios autorizados)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://codigo-py-flax.vercel.app',
  'https://codigo-py-frontend.onrender.com'
];

// Si CLIENT_URL está definido (por ejemplo, el dominio de Firebase Hosting en Koyeb), agregarlo
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (curl, pruebas locales, health checks internos)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS no permitido para el origen: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// Health check público (sin auth) - verifica API y DB
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'ok', 
      database: dbStatus,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// RUTAS - primero las rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/movements', require('./routes/movement.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/cash-register', require('./routes/cashRegister.routes'));
app.use('/api/exchange-rate', require('./routes/exchangeRate.routes'));
app.use('/api/commissions', require('./routes/commission.routes'));

// Manejo de rutas no encontradas - al final
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores global - al final
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});