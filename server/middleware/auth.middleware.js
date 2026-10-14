const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer'))
    return res.status(401).json({ message: 'Sin token de autenticación' });

  try {
    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Usuario no autorizado' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Solo administradores pueden hacer esto' });
};

exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Solo administradores pueden hacer esto' });
};

exports.optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer')) return next();

  try {
    const token = auth.split(' ')[1];
    if (process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Si el token es inválido o expiró, se continúa como público sin req.user
  }
  next();
};
