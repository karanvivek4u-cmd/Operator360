const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Only ADMIN can create/import customers
router.post('/', authenticate, authorize('ADMIN'), CustomerController.create);
router.post('/import', authenticate, authorize('ADMIN'), CustomerController.importBulk);

module.exports = router;
