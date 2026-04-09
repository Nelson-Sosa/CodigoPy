const r = require('express').Router();
const c = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
r.get('/dashboard',     protect, c.dashboard);
r.get('/sales-summary', protect, c.salesSummary);
module.exports = r;
