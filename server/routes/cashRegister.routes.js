const r = require('express').Router();
const c = require('../controllers/cashRegister.controller');
const { protect, admin } = require('../middleware/auth.middleware');

r.get('/today', protect, c.getToday);
r.get('/history', protect, c.getHistory);
r.get('/summary', protect, c.getSummary);
r.post('/open', protect, c.open);
r.post('/close', protect, c.close);
r.post('/reopen', protect, c.reopen);
r.get('/fix-indexes', protect, c.fixIndexes);

module.exports = r;
