const r = require('express').Router();
const c = require('../controllers/purchase.controller');
const { protect, admin } = require('../middleware/auth.middleware');

r.get('/',             protect, c.getAll);
r.get('/summary',      protect, c.getSummary);
r.get('/:id',          protect, c.getById);
r.post('/',             protect, admin, c.create);
r.patch('/:id/receive', protect, admin, c.receive);
r.patch('/:id/cancel',  protect, admin, c.cancel);
r.patch('/:id/payment', protect, admin, c.updatePayment);

module.exports = r;
