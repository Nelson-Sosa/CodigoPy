const mongoose = require('mongoose');
const Sale = require('./models/Sale');

mongoose.connect('mongodb+srv://admin:nelson123@cluster0.kx8jy.mongodb.net/inventorypro').then(async () => {
  const noDateKey = await Sale.countDocuments({
    dateKey: { $exists: false },
    createdAt: { $gte: new Date('2026-04-01'), $lte: new Date('2026-04-30') },
    status: { $ne: 'cancelled' }
  });
  console.log('Ventas sin dateKey en abril:', noDateKey);

  const withDateKey = await Sale.countDocuments({
    dateKey: { $gte: 20260401, $lte: 20260430 },
    status: { $ne: 'cancelled' }
  });
  console.log('Ventas con dateKey en abril:', withDateKey);

  const allApril = await Sale.countDocuments({
    createdAt: { $gte: new Date('2026-04-01'), $lte: new Date('2026-04-30') },
    status: { $ne: 'cancelled' }
  });
  console.log('Total ventas abril (createdAt):', allApril);

  mongoose.disconnect();
});