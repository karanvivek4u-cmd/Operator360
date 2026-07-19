const express = require('express');
const ServiceRequestController = require('../controllers/ServiceRequestController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// CUSTOMER & ADMIN can create requests
router.post('/', authenticate, authorize(['ADMIN', 'CUSTOMER']), ServiceRequestController.create);

// INSURANCE can approve/reject insurance step
router.post('/:id/approve-insurance', authenticate, authorize('INSURANCE'), ServiceRequestController.approveInsurance);
router.post('/:id/reject-insurance', authenticate, authorize('INSURANCE'), ServiceRequestController.rejectInsurance);

// ADMIN can approve/reject admin step and complete
router.post('/:id/approve-admin', authenticate, authorize('ADMIN'), ServiceRequestController.approveAdmin);
router.post('/:id/reject-admin', authenticate, authorize('ADMIN'), ServiceRequestController.rejectAdmin);
router.post('/:id/complete', authenticate, authorize('ADMIN'), ServiceRequestController.complete);

module.exports = router;
