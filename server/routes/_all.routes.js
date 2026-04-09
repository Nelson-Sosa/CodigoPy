// ── category.routes.js ───────────────────────────────────────────────
const express = require('express');
const { protect, adminOrSupervisor } = require('../middleware/auth.middleware');

const catCtrl  = require('../controllers/category.controller');
const cliCtrl  = require('../controllers/client.controller');
const saleCtrl = require('../controllers/sale.controller');
const movCtrl  = require('../controllers/movement.controller');
const repCtrl  = require('../controllers/report.controller');

// Categories
const categoryRouter = express.Router();
categoryRouter.get('/',       protect, catCtrl.getAll);
categoryRouter.post('/',      protect, adminOrSupervisor, catCtrl.create);
categoryRouter.put('/:id',    protect, adminOrSupervisor, catCtrl.update);
categoryRouter.delete('/:id', protect, adminOrSupervisor, catCtrl.remove);

// Clients
const clientRouter = express.Router();
clientRouter.get('/',       protect, cliCtrl.getAll);
clientRouter.get('/:id',    protect, cliCtrl.getById);
clientRouter.post('/',      protect, cliCtrl.create);
clientRouter.put('/:id',    protect, cliCtrl.update);
clientRouter.delete('/:id', protect, adminOrSupervisor, cliCtrl.remove);

// Sales
const saleRouter = express.Router();
saleRouter.get('/',           protect, saleCtrl.getAll);
saleRouter.get('/:id',        protect, saleCtrl.getById);
saleRouter.post('/',          protect, saleCtrl.create);
saleRouter.patch('/:id/cancel', protect, adminOrSupervisor, saleCtrl.cancel);

// Movements
const movementRouter = express.Router();
movementRouter.get('/', protect, movCtrl.getAll);

// Reports
const reportRouter = express.Router();
reportRouter.get('/dashboard',     protect, repCtrl.dashboard);
reportRouter.get('/sales-summary', protect, repCtrl.salesSummary);

module.exports = { categoryRouter, clientRouter, saleRouter, movementRouter, reportRouter };
