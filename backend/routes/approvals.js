const express = require('express');
const ApprovalController = require('../controllers/ApprovalController');

const router = express.Router();

router.get('/approve', ApprovalController.handleApproval);
router.get('/reject', ApprovalController.handleApproval);

module.exports = router;
