'use strict';
const jwt = require('jsonwebtoken');
const {
  ChatbotIntent,
  ChatbotKeyword,
  ChatbotResponse,
  ChatbotSession,
  ChatbotMessage,
  ChatbotUnknownQuestion,
  Product
} = require('../models');
const chatbotService = require('../services/chatbotService');
const { Op } = require('sequelize');

const resolveUserFromAuth = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const cleanedMessage = (message || '').toString().trim();

    if (!cleanedMessage) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const user = resolveUserFromAuth(req);
    const userId = user?.id || null;

    let session = null;
    if (sessionId) {
      session = await ChatbotSession.findByPk(sessionId);
    }

    if (!session) {
      session = await chatbotService.createSession(userId);
    }

    const lastAssistantMessage = await ChatbotMessage.findOne({
      where: { sessionId: session.id, sender: 'bot' },
      order: [['createdAt', 'DESC']]
    });

    await chatbotService.saveMessage(session.id, 'user', cleanedMessage, userId);

    const classification = await chatbotService.classifyMessage(cleanedMessage, lastAssistantMessage?.message || null);
    const { reply, intent, products, matchedIntent } = classification;
    const replyText = reply || 'I am sorry, I did not understand that. Please try asking in a different way, or contact support if you need help.';
    const productData = Array.isArray(products) ? products.slice(0, 3).map((p) => ({ id: p.id, name: p.name })) : [];

    await chatbotService.saveMessage(session.id, 'assistant', replyText, userId, {
      intent: intent || 'fallback',
      products: productData
    });

    if (!matchedIntent) {
      await chatbotService.saveUnknown(userId, cleanedMessage, { sessionId: session.id });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        reply: replyText,
        intent: intent || null,
        products: products || []
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ success: false, message: 'Failed to process message.', error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const user = resolveUserFromAuth(req);
    const userId = user?.id || null;
    const session = await chatbotService.createSession(userId, req.body.sessionName);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('Create session failed:', error);
    res.status(500).json({ success: false, message: 'Could not create chat session.', error: error.message });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const authUser = resolveUserFromAuth(req);
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (String(authUser.id) !== String(userId) && !authUser.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const sessions = await ChatbotSession.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [{ model: ChatbotMessage, as: 'messages', limit: 1, order: [['createdAt', 'DESC']] }]
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Get sessions failed:', error);
    res.status(500).json({ success: false, message: 'Could not load sessions.', error: error.message });
  }
};

exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    const session = await ChatbotSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }

    const authUser = resolveUserFromAuth(req);
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (String(authUser.id) !== String(session.userId) && !authUser.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const messages = await ChatbotMessage.findAll({
      where: { sessionId: session.id },
      order: [['createdAt', 'ASC']]
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get session messages failed:', error);
    res.status(500).json({ success: false, message: 'Could not load session messages.', error: error.message });
  }
};

exports.listIntents = async (req, res) => {
  try {
    const intents = await ChatbotIntent.findAll({
      include: [
        { model: ChatbotKeyword, as: 'keywords', attributes: ['id', 'keyword'] },
        { model: ChatbotResponse, as: 'responses', attributes: ['id', 'responseText', 'responseType', 'priority', 'active'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: intents });
  } catch (error) {
    console.error('List intents failed:', error);
    res.status(500).json({ success: false, message: 'Could not load intents.', error: error.message });
  }
};

exports.createIntent = async (req, res) => {
  try {
    const { name, description, keywords, responses, active } = req.body;
    if (!name || !Array.isArray(keywords) || keywords.length === 0 || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ success: false, message: 'name, keywords, and responses are required.' });
    }

    const intent = await ChatbotIntent.create({ name, description: description || null, active: active !== false });
    await ChatbotKeyword.bulkCreate(keywords.filter(Boolean).map((keyword) => ({ intentId: intent.id, keyword: keyword.trim() })));
    await ChatbotResponse.bulkCreate(responses.filter(Boolean).map((response, index) => ({
      intentId: intent.id,
      responseText: response.trim(),
      responseType: 'text',
      priority: index + 1,
      active: true
    })));

    const createdIntent = await ChatbotIntent.findByPk(intent.id, {
      include: [
        { model: ChatbotKeyword, as: 'keywords', attributes: ['id', 'keyword'] },
        { model: ChatbotResponse, as: 'responses', attributes: ['id', 'responseText', 'responseType', 'priority', 'active'] }
      ]
    });

    res.status(201).json({ success: true, data: createdIntent });
  } catch (error) {
    console.error('Create intent failed:', error);
    res.status(500).json({ success: false, message: 'Could not create intent.', error: error.message });
  }
};

exports.updateIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active, keywords, responses } = req.body;

    const intent = await ChatbotIntent.findByPk(id);
    if (!intent) {
      return res.status(404).json({ success: false, message: 'Intent not found.' });
    }

    await intent.update({
      name: name || intent.name,
      description: description || intent.description,
      active: typeof active === 'boolean' ? active : intent.active
    });

    if (Array.isArray(keywords)) {
      await ChatbotKeyword.destroy({ where: { intentId: id } });
      await ChatbotKeyword.bulkCreate(keywords.filter(Boolean).map((keyword) => ({ intentId: intent.id, keyword: keyword.trim() })));
    }

    if (Array.isArray(responses)) {
      await ChatbotResponse.destroy({ where: { intentId: id } });
      await ChatbotResponse.bulkCreate(responses.filter(Boolean).map((response, index) => ({
        intentId: intent.id,
        responseText: response.trim(),
        responseType: 'text',
        priority: index + 1,
        active: true
      })));
    }

    const updatedIntent = await ChatbotIntent.findByPk(id, {
      include: [
        { model: ChatbotKeyword, as: 'keywords', attributes: ['id', 'keyword'] },
        { model: ChatbotResponse, as: 'responses', attributes: ['id', 'responseText', 'responseType', 'priority', 'active'] }
      ]
    });

    res.json({ success: true, data: updatedIntent });
  } catch (error) {
    console.error('Update intent failed:', error);
    res.status(500).json({ success: false, message: 'Could not update intent.', error: error.message });
  }
};

exports.deleteIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const intent = await ChatbotIntent.findByPk(id);
    if (!intent) {
      return res.status(404).json({ success: false, message: 'Intent not found.' });
    }

    await ChatbotKeyword.destroy({ where: { intentId: id } });
    await ChatbotResponse.destroy({ where: { intentId: id } });
    await intent.destroy();

    res.json({ success: true, message: 'Intent deleted successfully.' });
  } catch (error) {
    console.error('Delete intent failed:', error);
    res.status(500).json({ success: false, message: 'Could not delete intent.', error: error.message });
  }
};

exports.listUnknownQuestions = async (req, res) => {
  try {
    const unknowns = await ChatbotUnknownQuestion.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'email'] }]
    });
    res.json({ success: true, data: unknowns });
  } catch (error) {
    console.error('List unknown questions failed:', error);
    res.status(500).json({ success: false, message: 'Could not load unknown questions.', error: error.message });
  }
};
