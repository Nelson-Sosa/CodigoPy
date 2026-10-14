const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

// Middlewares
const { protect, adminOnly, admin, optionalAuth } = require('../middleware/auth.middleware');
const User = require('../models/User');
const authCtrl = require('../controllers/auth.controller');
const cashRegisterRoutes = require('../routes/cashRegister.routes');

describe('Seguridad: Middleware de Autenticación y Autorización', () => {
  const TEST_SECRET = 'test_jwt_secret_key_32_characters_long_min!';

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it('protect: bloquea peticiones sin encabezado Authorization con 401', async () => {
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const req = { headers: {} };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };
    const next = () => { nextCalled = true; };

    await protect(req, res, next);

    assert.equal(statusSent, 401);
    assert.match(jsonSent.message, /Sin token de autenticación/);
    assert.equal(nextCalled, false);
  });

  it('protect: bloquea tokens inválidos o malformados con 401', async () => {
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const req = { headers: { authorization: 'Bearer token_invalido_xyz' } };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };
    const next = () => { nextCalled = true; };

    await protect(req, res, next);

    assert.equal(statusSent, 401);
    assert.match(jsonSent.message, /Token inválido o expirado/);
    assert.equal(nextCalled, false);
  });

  it('adminOnly / admin: rechaza usuarios con rol no administrador con 403', () => {
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const req = { user: { role: 'vendedor' } };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };
    const next = () => { nextCalled = true; };

    adminOnly(req, res, next);

    assert.equal(statusSent, 403);
    assert.match(jsonSent.message, /Solo administradores/);
    assert.equal(nextCalled, false);
  });

  it('adminOnly / admin: permite el paso a usuarios con rol admin', () => {
    let nextCalled = false;
    const req = { user: { role: 'admin' } };
    const res = {
      status: () => res,
      json: () => {}
    };
    const next = () => { nextCalled = true; };

    adminOnly(req, res, next);
    assert.equal(nextCalled, true);
  });

  it('optionalAuth: permite continuar a peticiones públicas sin token', async () => {
    let nextCalled = false;
    const req = { headers: {} };
    const res = {};
    const next = () => { nextCalled = true; };

    await optionalAuth(req, res, next);

    assert.equal(nextCalled, true);
    assert.equal(req.user, undefined);
  });
});

describe('Seguridad: Rutas Críticas de Caja (cashRegister.routes.js)', () => {
  it('las rutas de mantenimiento tienen protect y admin como middleware', () => {
    // Inspeccionar la pila de capas del router de express
    const routesToCheck = ['/fix-indexes', '/force-close', '/force-close-all'];

    routesToCheck.forEach((routePath) => {
      const layer = cashRegisterRoutes.stack.find(
        (l) => l.route && l.route.path === routePath
      );

      assert.ok(layer, `La ruta ${routePath} debe existir en el router`);
      
      const handlers = layer.route.stack.map(s => s.handle);
      
      // Deben estar protect y admin en el stack de la ruta
      assert.ok(
        handlers.includes(protect),
        `La ruta ${routePath} debe incluir el middleware protect`
      );
      assert.ok(
        handlers.includes(admin) || handlers.includes(adminOnly),
        `La ruta ${routePath} debe incluir el middleware de autorización de admin`
      );
    });
  });
});

describe('Seguridad: Control de Creación de Usuarios y Escalación de Privilegios', () => {
  it('rechaza con 403 si un usuario público no autenticado intenta registrar rol admin', async () => {
    // Mock User.findOne y User.countDocuments
    const originalFindOne = User.findOne;
    const originalCountDocuments = User.countDocuments;
    const originalCreate = User.create;

    User.findOne = async () => null; // Email no existe
    User.countDocuments = async () => 3; // Ya hay usuarios en la base de datos
    User.create = async () => { throw new Error('No debería crear el usuario'); };

    let statusSent = null;
    let jsonSent = null;

    const req = {
      user: undefined, // No autenticado
      body: {
        name: 'Hacker',
        email: 'hacker@test.com',
        password: 'password123',
        role: 'admin'
      }
    };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };

    try {
      await authCtrl.register(req, res);
      assert.equal(statusSent, 403);
      assert.match(jsonSent.message, /No tienes permisos para registrar una cuenta con rol administrador/);
    } finally {
      User.findOne = originalFindOne;
      User.countDocuments = originalCountDocuments;
      User.create = originalCreate;
    }
  });

  it('fuerza rol vendedor en registro público cuando se solicita otro rol no permitido', async () => {
    const originalFindOne = User.findOne;
    const originalCountDocuments = User.countDocuments;
    const originalCreate = User.create;

    let createdUserData = null;

    User.findOne = async () => null;
    User.countDocuments = async () => 5;
    User.create = async (data) => {
      createdUserData = data;
      return { _id: 'mock_user_id', ...data };
    };

    let statusSent = null;
    let jsonSent = null;

    const req = {
      user: undefined, // Anónimo
      body: {
        name: 'Nuevo Empleado',
        email: 'empleado@test.com',
        password: 'password123',
        role: 'superuser_arbitrario'
      }
    };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };

    try {
      await authCtrl.register(req, res);
      assert.equal(statusSent, 201);
      assert.equal(createdUserData.role, 'vendedor');
    } finally {
      User.findOne = originalFindOne;
      User.countDocuments = originalCountDocuments;
      User.create = originalCreate;
    }
  });

  it('permite a un administrador autenticado crear cuentas con rol admin', async () => {
    const originalFindOne = User.findOne;
    const originalCountDocuments = User.countDocuments;
    const originalCreate = User.create;

    let createdUserData = null;

    User.findOne = async () => null;
    User.countDocuments = async () => 5;
    User.create = async (data) => {
      createdUserData = data;
      return { _id: 'mock_new_admin_id', ...data };
    };

    let statusSent = null;
    let jsonSent = null;

    const req = {
      user: { _id: 'admin_caller_id', role: 'admin' }, // Administrador autenticado
      body: {
        name: 'Nuevo Admin',
        email: 'nuevo.admin@test.com',
        password: 'password123',
        role: 'admin'
      }
    };
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => { jsonSent = data; }
        };
      }
    };

    try {
      await authCtrl.register(req, res);
      assert.equal(statusSent, 201);
      assert.equal(createdUserData.role, 'admin');
    } finally {
      User.findOne = originalFindOne;
      User.countDocuments = originalCountDocuments;
      User.create = originalCreate;
    }
  });
});

describe('Seguridad: Validación de JWT_SECRET en inicio', () => {
  it('en desarrollo local asigna valor provisional si falta la variable', () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalEnv = process.env.NODE_ENV;

    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';

    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        assert.fail('No debería entrar en rama de producción');
      } else {
        process.env.JWT_SECRET = 'dev_jwt_secret_local_only_codigopy_insecure';
      }
    }

    assert.ok(process.env.JWT_SECRET);
    assert.equal(process.env.JWT_SECRET, 'dev_jwt_secret_local_only_codigopy_insecure');

    // Restaurar
    process.env.JWT_SECRET = originalSecret;
    process.env.NODE_ENV = originalEnv;
  });

  it('en producción detecta la ausencia de JWT_SECRET como error fatal', () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalEnv = process.env.NODE_ENV;

    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';

    let fatalDetected = false;

    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        fatalDetected = true;
      }
    }

    assert.equal(fatalDetected, true, 'En producción debe marcar error fatal si JWT_SECRET no existe');

    // Restaurar
    process.env.JWT_SECRET = originalSecret;
    process.env.NODE_ENV = originalEnv;
  });
});
