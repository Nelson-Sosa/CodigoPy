const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

router.get('/',              protect, ctrl.getAll);
router.get('/:id',           protect, ctrl.getById);
router.post('/',             protect, adminOrSupervisor, ctrl.create);
router.put('/:id',           protect, adminOrSupervisor, ctrl.update);
router.patch('/:id/stock',   protect, ctrl.adjustStock);
router.delete('/:id',        protect, adminOrSupervisor, ctrl.remove);

module.exports = router;
