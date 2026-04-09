const r = require('express').Router();
const c = require('../controllers/sale.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');
r.get('/',              protect, c.getAll);
r.get('/:id',           protect, c.getById);
r.post('/',             protect, c.create);
r.put('/:id',           protect, adminOrSupervisor, c.update);
r.patch('/:id/cancel',  protect, adminOrSupervisor, c.cancel);
module.exports = r;
