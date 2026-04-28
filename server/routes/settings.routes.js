const r = require('express').Router();
const c = require('../controllers/settings.controller');
const { protect, admin } = require('../middleware/auth.middleware');

r.get('/', protect, c.get);
r.put('/', protect, admin, c.update);
r.get('/next-invoice', protect, c.getNextInvoiceNumber);

module.exports = r;
