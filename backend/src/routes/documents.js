const express = require('express');
const auth = require('../middleware/auth');
const docModel = require('../models/Document');
const govService = require('../services/governmentService');
const taskService = require('../services/taskService');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const docs = await docModel.find({ userId: req.userId });
    const enriched = docs.map(d => {
      const rules = govService.getDocumentRules(d.docType);
      const remaining = govService.getRemainingDays(d.expiryDate);
      const overdue = govService.getOverdueDays(d.expiryDate);
      const status = govService.getRenewalStatus(d.docType, d.expiryDate);
      return {
        ...d,
        remainingDays: remaining,
        overdueDays: overdue,
        status,
        icon: rules?.icon || '📋',
        label: rules?.labelAr || d.docType,
      };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { docType, expiryDate, issueDate, labelAr, notes, remindersEnabled } = req.body;
    if (!docType) return res.status(400).json({ error: 'docType is required' });

    const doc = await docModel.create({
      userId: req.userId,
      docType,
      expiryDate: expiryDate || null,
      issueDate: issueDate || null,
      labelAr: labelAr || null,
      notes: notes || '',
      remindersEnabled: remindersEnabled !== false,
    });

    const rules = govService.getDocumentRules(docType);
    const status = govService.getRenewalStatus(docType, doc.expiryDate);
    const steps = govService.getRenewalSteps(docType);

    if (status.status === 'can_renew' || status.status === 'expiring_soon') {
      await taskService.createTask(req.userId, {
        title: `تجديد ${rules?.labelAr || docType}`,
        description: `متبقي ${status.remainingDays} يوم على انتهاء ${rules?.labelAr || docType}`,
        category: 'important',
        priority: status.status === 'expiring_soon' ? 'urgent' : 'high',
        dueDate: doc.expiryDate,
        reminderInterval: 1440,
      });
    }

    res.json({ doc, status, steps, rules: rules ? { label: rules.labelAr, icon: rules.icon, fees: rules.feesAr, platform: rules.platform } : null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await docModel.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const rules = govService.getDocumentRules(doc.docType);
    const status = govService.getRenewalStatus(doc.docType, doc.expiryDate);
    const steps = govService.getRenewalSteps(doc.docType);
    const documents = govService.getRequiredDocuments(doc.docType);
    const fines = govService.getFines(doc.docType);
    const tips = govService.getTips(doc.docType);
    const platformLink = govService.getLink(doc.docType);
    const suggestedDate = await govService.suggestRenewalDate(doc.docType, doc.expiryDate);

    res.json({
      doc,
      status,
      renewal: {
        steps,
        requiredDocuments: documents,
        fines,
        tips,
        platform: rules?.platform || null,
        platformLink,
        fees: rules?.feesAr || null,
      },
      suggestedDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await docModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body }
    );
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await docModel.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/summary', auth, async (req, res) => {
  try {
    const docs = await docModel.find({ userId: req.userId });
    const now = new Date();
    let expired = 0, expiringSoon = 0, active = 0;

    docs.forEach(d => {
      if (!d.expiryDate) return;
      const diff = new Date(d.expiryDate) - now;
      const days = Math.ceil(diff / (86400000));
      if (days < 0) expired++;
      else if (days < 60) expiringSoon++;
      else active++;
    });

    const platforms = govService.getAllPlatforms();
    res.json({ total: docs.length, expired, expiringSoon, active, platforms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/types', auth, async (req, res) => {
  const rules = govService.getRules();
  const types = Object.entries(rules.documents).map(([key, val]) => ({
    id: key,
    labelAr: val.labelAr,
    labelEn: val.labelEn,
    icon: val.icon,
  }));
  res.json(types);
});

router.get('/platforms', auth, async (req, res) => {
  res.json(govService.getAllPlatforms());
});

router.post('/check-expiry', auth, async (req, res) => {
  try {
    const docs = await docModel.find({ userId: req.userId });
    const alerts = [];

    for (const doc of docs) {
      if (!doc.expiryDate || !doc.remindersEnabled) continue;
      const status = govService.getRenewalStatus(doc.docType, doc.expiryDate);
      const rules = govService.getDocumentRules(doc.docType);

      if (status.status === 'expired') {
        alerts.push({
          type: 'danger',
          docType: doc.docType,
          label: rules?.labelAr || doc.docType,
          message: `⚠️ ${rules?.labelAr || doc.docType} منتهية! متأخر ${status.overdueDays} يوم. الغرامة: ${status.estimatedFine} ريال`,
          icon: rules?.icon || '📋',
          docId: doc._id,
        });
      } else if (status.status === 'expiring_soon') {
        alerts.push({
          type: 'warning',
          docType: doc.docType,
          label: rules?.labelAr || doc.docType,
          message: `⚡ ${rules?.labelAr || doc.docType} على وشك الانتهاء! متبقي ${status.remainingDays} يوم`,
          icon: rules?.icon || '📋',
          docId: doc._id,
        });
      } else if (status.status === 'can_renew') {
        alerts.push({
          type: 'info',
          docType: doc.docType,
          label: rules?.labelAr || doc.docType,
          message: `📌 ${rules?.labelAr || doc.docType} يمكن تجديدها الآن. متبقي ${status.remainingDays} يوم`,
          icon: rules?.icon || '📋',
          docId: doc._id,
        });
      }
    }

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
