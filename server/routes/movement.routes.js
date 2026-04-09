// movement.routes.js
const r1 = require('express').Router();
const mc = require('../controllers/movement.controller');
const { protect } = require('../middleware/auth.middleware');
r1.get('/', protect, mc.getAll);
module.exports = r1;
