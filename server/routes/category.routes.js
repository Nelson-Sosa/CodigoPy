// category.routes.js
const r = require('express').Router();
const c = require('../controllers/category.controller');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');
r.get('/',       protect, c.getAll);
r.post('/',      protect, adminOrSupervisor, c.create);
r.put('/:id',    protect, adminOrSupervisor, c.update);
r.delete('/:id', protect, adminOrSupervisor, c.remove);
module.exports = r;
