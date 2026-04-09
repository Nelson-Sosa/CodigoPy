const router = require('express').Router();
const ctrl = require('../controllers/supplier.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',          ctrl.getAll);
router.get('/:id',       ctrl.getById);
router.post('/',          ctrl.create);
router.put('/:id',       ctrl.update);
router.delete('/:id',    ctrl.delete);
router.post('/:id/products', ctrl.addProduct);

module.exports = router;
