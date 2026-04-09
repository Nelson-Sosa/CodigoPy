// routes/auth.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/login',        ctrl.login);
router.post('/register',     ctrl.register);
router.get('/me',            protect, ctrl.getMe);
router.get('/users',         protect, adminOnly, ctrl.getUsers);
router.put('/users/:id',     protect, adminOnly, ctrl.updateUser);

module.exports = router;
