// category.routes.js
const r = require('express').Router();
const c = require('../controllers/category.controller');
const { protect, admin } = require('../middleware/auth.middleware');
r.get('/',       protect, c.getAll);
r.post('/',      protect, admin, c.create);
r.put('/:id',    protect, admin, c.update);
r.delete('/:id', protect, admin, c.remove);
module.exports = r;
