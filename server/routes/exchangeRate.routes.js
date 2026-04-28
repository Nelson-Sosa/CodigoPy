const router = require('express').Router();
const ctrl = require('../controllers/exchangeRate.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/', ctrl.getCurrent);

router.get('/all', ctrl.getAll);

router.post('/manual', protect, admin, ctrl.saveManual);

module.exports = router;
