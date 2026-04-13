const router = require('express').Router();
const ctrl = require('../controllers/exchangeRate.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

router.get('/', ctrl.getCurrent);
router.post('/sync', protect, adminOrSupervisor, ctrl.syncFromExternal);
router.post('/', protect, adminOrSupervisor, ctrl.update);

module.exports = router;
