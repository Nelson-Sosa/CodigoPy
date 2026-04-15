const r = require('express').Router();
const c = require('../controllers/cashRegister.controller');
const { protect, admin } = require('../middleware/auth.middleware');

r.get('/today', protect, c.getToday);
r.get('/history', protect, c.getHistory);
r.get('/summary', protect, c.getSummary);
r.post('/open', protect, c.open);
r.post('/close', protect, c.close);
r.post('/reopen', protect, c.reopen);
r.get('/fix-indexes', c.fixIndexes);
r.get('/force-close', c.forceCloseAll);
r.get('/force-close-all', c.forceCloseAllAny);
r.delete('/delete-register', protect, c.admin, c.deleteRegister);
r.post('/delete-by-user', protect, c.admin, c.deleteByUserName);
r.post('/clean-duplicates', protect, admin, c.cleanDuplicates);

module.exports = r;
