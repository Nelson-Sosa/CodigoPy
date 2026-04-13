const router = require('express').Router();
const ctrl = require('../controllers/exchangeRate.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

router.get('/', ctrl.getCurrent);

router.get('/all', ctrl.getAll);

router.post('/manual', protect, adminOrSupervisor, ctrl.saveManual);

module.exports = router;
