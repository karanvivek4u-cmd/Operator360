const express = require('express');
const OperatorController = require('../controllers/OperatorController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Both ADMIN and CUSTOMER can create operators
router.post('/', authenticate, authorize(['ADMIN', 'CUSTOMER']), OperatorController.create);
router.post('/import', authenticate, authorize(['ADMIN', 'CUSTOMER']), OperatorController.importBulk);

module.exports = router;
