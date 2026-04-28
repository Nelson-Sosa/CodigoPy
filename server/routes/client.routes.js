const r = require('express').Router();
const c = require('../controllers/client.controller');
const { protect, admin } = require('../middleware/auth.middleware');
r.get('/',       protect, c.getAll);
r.get('/:id',    protect, c.getById);
r.post('/',      protect, c.create);
r.put('/:id',    protect, c.update);
r.delete('/:id', protect, admin, c.remove);
module.exports = r;
