const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Error fatal: Ni MONGO_URI ni MONGODB_URI están configuradas en las variables de entorno.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ DB conectada: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
