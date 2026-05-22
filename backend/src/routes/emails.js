const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Email = require('../models/Email');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/connect', auth, async (req, res) => {
  try {
    const { email, appPassword } = req.body;
    if (!email || !appPassword) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبين' });
    }
    await User.findByIdAndUpdate(req.userId, {
      'emailSettings.connected': true,
      'emailSettings.gmailUser': email,
      'emailSettings.gmailAppPassword': appPassword,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fetch', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.emailSettings.connected) {
      return res.status(400).json({ error: 'Email not connected' });
    }

    const emails = await emailService.fetchUnreadEmails(user);
    const saved = [];

    for (const email of emails) {
      try {
        const existing = await Email.findOne({ userId: req.userId, messageId: email.messageId });
        if (!existing) {
          const doc = await Email.create({ userId: req.userId, ...email });
          saved.push(doc);
        }
      } catch (e) {
        console.error('Error saving email:', e.message);
      }
    }

    res.json({ emails: saved, count: saved.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const query = { userId: req.userId };
    if (req.query.status) {
      if (req.query.status === 'pending') query.replyPending = true;
      if (req.query.status === 'replied') query.isReplied = true;
      if (req.query.status === 'unread') query.isRead = false;
    }

    const emails = await Email.find(query);
    emails.sort((a, b) => new Date(b.receivedAt || b.createdAt) - new Date(a.receivedAt || a.createdAt));
    const limited = emails.slice(0, parseInt(req.query.limit) || 50);

    res.json({ emails: limited });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    res.json({ email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/read', auth, async (req, res) => {
  try {
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    res.json({ email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/generate-reply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
    if (!email) return res.status(404).json({ error: 'Email not found' });

    const reply = await emailService.generateReply(email, user);
    if (!reply) return res.status(500).json({ error: 'Failed to generate reply' });

    await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { aiGeneratedReply: reply, replyPending: true },
    );

    res.json({ reply, email: { ...email, aiGeneratedReply: reply, replyPending: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/approve-reply', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
    if (!email) return res.status(404).json({ error: 'Email not found' });

    const replyText = req.body.reply || email.aiGeneratedReply;
    if (!replyText) return res.status(400).json({ error: 'No reply to send' });

    const sent = await emailService.sendReply(user, email, replyText);
    if (!sent) return res.status(500).json({ error: 'Failed to send reply' });

    const updated = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        isReplied: true, replyPending: false, replyApproved: true,
        finalReply: replyText, autoReply: true,
      },
    );

    res.json({ email: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { autoReply, replyOnlyBusiness, requireApproval } = req.body;
    const updates = {};
    if (autoReply !== undefined) updates['emailSettings.autoReply'] = autoReply;
    if (replyOnlyBusiness !== undefined) updates['emailSettings.replyOnlyBusiness'] = replyOnlyBusiness;
    if (requireApproval !== undefined) updates['emailSettings.requireApproval'] = requireApproval;

    const user = await User.findByIdAndUpdate(req.userId, updates);
    res.json({ emailSettings: user.emailSettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
