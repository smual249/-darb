const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const telegramService = require('../services/telegramService');
const config = require('../config');

const router = express.Router();

router.get('/bot-info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const globalToken = config.telegram.botToken;
    const hasGlobalBot = globalToken && globalToken !== 'your-telegram-bot-token';
    res.json({
      connected: user.telegramSettings?.connected || hasGlobalBot,
      hasGlobalBot,
      globalToken: hasGlobalBot,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/connect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      'telegramSettings.connected': true,
      'telegramSettings.botToken': config.telegram.botToken || req.body.botToken,
    });
    res.json({ success: true, message: 'Telegram bot connected!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disconnect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      'telegramSettings.connected': false,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    if (!update.message) return res.sendStatus(200);

    const message = update.message;
    const chatId = message.chat.id;
    const token = req.query.token;

    const user = await User.findOne({ 'telegramSettings.botToken': token });
    if (!user) return res.sendStatus(200);

    if (!message.text) return res.sendStatus(200);

    const isBusiness = telegramService.detectBusinessMessage(message);
    const isUnknown = telegramService.detectUnknownContact(message, null);

    const msgDoc = await Message.create({
      userId: user._id, platform: 'telegram', conversationId: chatId.toString(),
      messageId: message.message_id.toString(), from: message.from?.id?.toString() || 'unknown',
      fromName: message.from?.first_name || 'Unknown', text: message.text,
      isBusiness, isUnknown, senderInfo: { username: message.from?.username, isContact: false },
      receivedAt: new Date(),
    });

    const shouldAutoReply = user.telegramSettings.autoReply &&
      (!user.telegramSettings.replyOnlyUnknown || isUnknown || isBusiness);

    if (shouldAutoReply) {
      const reply = await telegramService.generateReply(message, user);
      if (user.telegramSettings.requireApproval) {
        await Message.model.store.update({ _id: msgDoc._id }, { $set: { aiGeneratedReply: reply, replyPending: true } });
      } else {
        await telegramService.sendMessage(chatId, reply);
        await Message.model.store.update({ _id: msgDoc._id }, {
          $set: { isReplied: true, replyApproved: true, finalReply: reply, autoReply: true }
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Telegram webhook error:', error.message);
    res.sendStatus(200);
  }
});

router.get('/messages', auth, async (req, res) => {
  try {
    const query = { userId: req.userId, platform: 'telegram' };
    if (req.query.status === 'pending') query.replyPending = true;
    if (req.query.status === 'business') query.isBusiness = true;
    if (req.query.status === 'unknown') query.isUnknown = true;

    const messages = await Message.find(query);
    messages.sort((a, b) => new Date(b.receivedAt || b.createdAt) - new Date(a.receivedAt || a.createdAt));
    const limited = messages.slice(0, parseInt(req.query.limit) || 50);

    res.json({ messages: limited });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages/:id/approve', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const msg = await Message.findOne({ _id: req.params.id, userId: req.userId });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    const replyText = req.body.reply || msg.aiGeneratedReply;
    if (!replyText) return res.status(400).json({ error: 'No reply to send' });

    await telegramService.sendMessage(msg.conversationId, replyText);

    await Message.model.store.update({ _id: msg._id }, {
      $set: { isReplied: true, replyPending: false, replyApproved: true, finalReply: replyText, autoReply: true }
    });

    res.json({ message: { ...msg, isReplied: true, replyPending: false } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { autoReply, replyOnlyUnknown, requireApproval } = req.body;
    const updates = {};
    if (autoReply !== undefined) updates['telegramSettings.autoReply'] = autoReply;
    if (replyOnlyUnknown !== undefined) updates['telegramSettings.replyOnlyUnknown'] = replyOnlyUnknown;
    if (requireApproval !== undefined) updates['telegramSettings.requireApproval'] = requireApproval;

    const user = await User.findByIdAndUpdate(req.userId, updates);
    res.json({ telegramSettings: user.telegramSettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
