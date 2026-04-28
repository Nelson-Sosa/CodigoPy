const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/',              protect, ctrl.getAll);
router.get('/:id',           protect, ctrl.getById);
router.post('/',             protect, admin, ctrl.create);
router.put('/:id',           protect, admin, ctrl.update);
router.patch('/:id/stock',   protect, ctrl.adjustStock);
router.delete('/:id',        protect, admin, ctrl.remove);

module.exports = router;
