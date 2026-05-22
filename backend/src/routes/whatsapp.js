const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

router.post('/connect', auth, async (req, res) => {
  try {
    const io = require('../index').getIO();
    await whatsappService.initUserClient(req.userId, io);

    await User.findByIdAndUpdate(req.userId, {
      'whatsappSettings.connected': true,
      'whatsappSettings.phoneNumber': req.body.phoneNumber || '',
    });

    res.json({ success: true, message: 'WhatsApp connecting... Scan the QR code in the app.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/qr', auth, async (req, res) => {
  try {
    const qr = await whatsappService.getQR();
    res.json({ qr, ready: whatsappService.isReady() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disconnect', auth, async (req, res) => {
  try {
    await whatsappService.destroy();
    await User.findByIdAndUpdate(req.userId, { 'whatsappSettings.connected': false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/webhook', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const result = whatsappService.verifyWebhook(mode, token, challenge);
    res.status(200).send(result.toString());
  } catch (error) {
    res.status(403).send(error.message);
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const incoming = await whatsappService.processIncomingMessage(req.body);
    for (const msg of incoming) {
      const user = await User.findOne({ 'whatsappSettings.connected': true });
      if (!user) continue;
      const isBusiness = whatsappService.detectBusinessNumber(msg.from, null);
      const msgDoc = await Message.create({
        userId: user._id, platform: 'whatsapp', conversationId: msg.from,
        messageId: msg.messageId, from: msg.from, fromName: msg.fromName,
        text: msg.text, isBusiness, isUnknown: !isBusiness, receivedAt: msg.timestamp,
      });
      const shouldAutoReply = user.whatsappSettings.autoReply &&
        (!user.whatsappSettings.replyOnlyBusiness || isBusiness);
      if (shouldAutoReply) {
        const reply = await whatsappService.generateReply(msgDoc, user);
        if (user.whatsappSettings.requireApproval) {
          await Message.model.store.update({ _id: msgDoc._id }, { $set: { aiGeneratedReply: reply, replyPending: true } });
        } else {
          await whatsappService.sendMessage(msg.from, reply);
          await Message.model.store.update({ _id: msgDoc._id }, {
            $set: { isReplied: true, replyApproved: true, finalReply: reply, autoReply: true }
          });
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error.message);
    res.sendStatus(200);
  }
});

router.get('/messages', auth, async (req, res) => {
  try {
    const query = { userId: req.userId, platform: 'whatsapp' };
    if (req.query.status === 'pending') query.replyPending = true;
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
    const msg = await Message.findOne({ _id: req.params.id, userId: req.userId, platform: 'whatsapp' });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    const replyText = req.body.reply || msg.aiGeneratedReply;
    if (!replyText) return res.status(400).json({ error: 'No reply to send' });
    await whatsappService.sendMessage(msg.from, replyText);
    await Message.model.store.update({ _id: msg._id }, {
      $set: { isReplied: true, replyPending: false, replyApproved: true, finalReply: replyText, autoReply: true }
    });
    res.json({ message: { ...msg, isReplied: true, replyPending: false } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send', auth, async (req, res) => {
  try {
    const { to, text } = req.body;
    if (!to || !text) return res.status(400).json({ error: 'Phone number and text are required' });
    const result = await whatsappService.sendMessage(to, text);
    res.json({ success: !!result, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { autoReply, replyOnlyBusiness, requireApproval } = req.body;
    const updates = {};
    if (autoReply !== undefined) updates['whatsappSettings.autoReply'] = autoReply;
    if (replyOnlyBusiness !== undefined) updates['whatsappSettings.replyOnlyBusiness'] = replyOnlyBusiness;
    if (requireApproval !== undefined) updates['whatsappSettings.requireApproval'] = requireApproval;
    const user = await User.findByIdAndUpdate(req.userId, updates);
    res.json({ whatsappSettings: user.whatsappSettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
