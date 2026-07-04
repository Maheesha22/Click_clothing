'use strict';
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/chat', chatbotController.chat);
router.post('/sessions', chatbotController.createSession);
router.get('/sessions/user/:userId', authenticate, chatbotController.getUserSessions);
router.get('/sessions/:sessionId/messages', authenticate, chatbotController.getSessionMessages);

router.get('/intents', authenticate, requireAdmin, chatbotController.listIntents);
router.post('/intents', authenticate, requireAdmin, chatbotController.createIntent);
router.put('/intents/:id', authenticate, requireAdmin, chatbotController.updateIntent);
router.delete('/intents/:id', authenticate, requireAdmin, chatbotController.deleteIntent);

router.get('/unknown', authenticate, requireAdmin, chatbotController.listUnknownQuestions);

module.exports = router;
