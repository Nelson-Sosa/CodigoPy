const r = require('express').Router();
const c = require('../controllers/commission.controller');
const { protect, admin } = require('../middleware/auth.middleware');

r.get('/stats', protect, c.getMyStats);
r.get('/all', protect, admin, c.getAll);
r.get('/user/:userId', protect, admin, c.getByUser);
r.get('/history/:userId', protect, admin, c.getHistory);
r.post('/upsert', protect, admin, c.upsert);

module.exports = r;