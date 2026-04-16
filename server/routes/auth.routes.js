// routes/auth.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/login',        ctrl.login);
router.post('/register',     ctrl.register);
router.get('/me',            protect, ctrl.getMe);
router.get('/users',         protect, adminOnly, ctrl.getUsers);
router.put('/users/:id',    protect, adminOnly, ctrl.updateUser);
router.put('/users/:id/password', protect, adminOnly, ctrl.changePassword);
router.delete('/users/:id', protect, adminOnly, ctrl.deleteUser);

module.exports = router;
