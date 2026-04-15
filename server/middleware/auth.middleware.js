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

exports.adminOrSupervisor = (req, res, next) => {
  if (['admin', 'supervisor'].includes(req.user?.role)) return next();
  return res.status(403).json({ message: 'Acceso denegado' });
};

exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Solo administradores pueden hacer esto' });
};
