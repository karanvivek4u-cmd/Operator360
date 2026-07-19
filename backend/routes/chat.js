const express = require('express');
const ChatController = require('../controllers/ChatController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Operators need to chat with the AI assistant
router.post('/', authenticate, authorize('OPERATOR'), ChatController.chat);

module.exports = router;
