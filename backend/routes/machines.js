const express = require('express');
const MachineController = require('../controllers/MachineController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.patch('/:id/status', authenticate, MachineController.updateStatus);

module.exports = router;
