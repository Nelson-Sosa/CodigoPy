const router = require('express').Router();
const ctrl = require('../controllers/exchangeRate.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

// GET /exchange-rate - Público (para todos)
router.get('/', ctrl.getCurrent);

// GET /exchange-rate/all - Público
router.get('/all', ctrl.getAll);

// POST /exchange-rate/sync - Admin/Supervisor
router.post('/sync', protect, adminOrSupervisor, ctrl.syncExternal);

// POST /exchange-rate/manual - Admin/Supervisor
router.post('/manual', protect, adminOrSupervisor, ctrl.saveManual);

module.exports = router;
