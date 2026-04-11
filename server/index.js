require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'https://codigo-py-flax.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Health check público (sin auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Error interno del servidor'
  });
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});