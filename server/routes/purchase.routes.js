const r = require('express').Router();
const c = require('../controllers/purchase.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

r.get('/',             protect, c.getAll);
r.get('/summary',      protect, c.getSummary);
r.get('/:id',          protect, c.getById);
r.post('/',             protect, adminOrSupervisor, c.create);
r.patch('/:id/receive', protect, adminOrSupervisor, c.receive);
r.patch('/:id/cancel',  protect, adminOrSupervisor, c.cancel);
r.patch('/:id/payment', protect, adminOrSupervisor, c.updatePayment);

module.exports = r;
