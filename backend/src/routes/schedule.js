const express = require('express');
const auth = require('../middleware/auth');
const schedulerService = require('../services/schedulerService');
const Task = require('../models/Task');
const docModel = require('../models/Document');
const govService = require('../services/governmentService');

const router = express.Router();

router.get('/plan', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, status: { $ne: 'completed' } });
    const docs = await docModel.find({ userId: req.userId });
    const plan = await schedulerService.generateDailyPlan(tasks, docs);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suggest-time', auth, async (req, res) => {
  try {
    const { taskId } = req.query;
    let task;
    if (taskId) {
      task = await Task.findOne({ _id: taskId, userId: req.userId });
      if (!task) return res.status(404).json({ error: 'Task not found' });
    } else {
      const tasks = await Task.find({ userId: req.userId, status: { $ne: 'completed' } });
      task = tasks[0] || null;
      if (!task) return res.json({ suggestion: null, message: 'لا توجد مهام' });
    }
    const suggestion = schedulerService.suggestTaskTime(task);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reschedule', auth, async (req, res) => {
  try {
    const { taskId, newDate } = req.body;
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const task = await Task.findByIdAndUpdate(taskId, {
      dueDate: new Date(newDate),
      rescheduled: true,
      rescheduledAt: new Date(),
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const suggestion = schedulerService.suggestTaskTime(task);
    res.json({ task, suggestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/checkin', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, status: { $ne: 'completed' } });
    const docs = await docModel.find({ userId: req.userId });
    const plan = await schedulerService.generateDailyPlan(tasks, docs);

    const priorities = plan.topPriorities.slice(0, 5);
    const docAlerts = plan.urgentDocuments;

    let responseAr = `صباح الخير ☀️\n\n`;
    responseAr += `📊 عندك **${plan.summary.total}** مهمة`;
    if (plan.summary.overdue > 0) responseAr += `، منها **${plan.summary.overdue}** متأخرة!`;
    if (plan.summary.urgentDocs > 0) responseAr += `\n⚠️ **${plan.summary.urgentDocs}** وثيقة على وشك الانتهاء`;
    responseAr += `\n\n`;

    if (priorities.length > 0) {
      responseAr += `**الأولويات اليومية:**\n`;
      priorities.forEach((p, i) => {
        const icons = { urgent: '⛔', high: '🔴', medium: '🟡', low: '🟢' };
        responseAr += `${icons[p.priority] || '📌'} ${p.title}${p.timeSuggestion ? ` — ${p.timeSuggestion.suggestion}` : ''}\n`;
      });
    }

    if (docAlerts.length > 0) {
      responseAr += `\n**⚠️ تنبيهات الوثائق:**\n`;
      docAlerts.forEach(d => {
        responseAr += `${d.severity === 'critical' ? '🔴' : '🟡'} ${d.labelAr}: متبقي ${d.remainingDays} يوم\n`;
      });
    }

    responseAr += `\nهل عندك إضافات اليوم؟ 💬`;

    let responseEn = `Good morning ☀️\n\n`;
    responseEn += `📊 You have **${plan.summary.total}** tasks`;
    if (plan.summary.overdue > 0) responseEn += `, **${plan.summary.overdue}** overdue!`;
    responseEn += `\n\n**Today's priorities:**\n`;
    priorities.forEach(p => {
      const icons = { urgent: '⛔', high: '🔴', medium: '🟡', low: '🟢' };
      responseEn += `${icons[p.priority] || '📌'} ${p.title}${p.timeSuggestion ? ` — ${p.timeSuggestion.suggestion}` : ''}\n`;
    });
    responseEn += `\nAnything new today? 💬`;

    res.json({
      plan,
      responseAr,
      responseEn,
      summary: plan.summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/acknowledge', auth, async (req, res) => {
  try {
    const notificationService = require('../services/notificationService');
    notificationService.recordUserActivity(req.userId);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/nag', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    let tasks;
    if (taskId) {
      tasks = await Task.find({ _id: taskId, userId: req.userId, status: { $ne: 'completed' } });
    } else {
      tasks = await Task.find({ userId: req.userId, status: { $ne: 'completed' } });
    }

    const now = new Date();
    const nagging = tasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.priority !== 'low')
      .map(t => ({
        taskId: t._id,
        title: t.title,
        priority: t.priority,
        overdueDays: Math.ceil((now - new Date(t.dueDate)) / (86400000)),
        messageAr: `⚠️ **${t.title}** متأخرة! مضى ${Math.ceil((now - new Date(t.dueDate)) / (86400000))} يوم`,
        messageEn: `⚠️ **${t.title}** is overdue! ${Math.ceil((now - new Date(t.dueDate)) / (86400000))} days late`,
      }));

    res.json({ nagging, count: nagging.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { tasks, preference, busyTimes } = req.body;
    if (!tasks) return res.status(400).json({ error: 'tasks is required' });

    const prompt = `أنت مساعد جدولة ذكي. المستخدم كتب قائمة مهامه التالية:
"${tasks}"

تفضيلاته: ${preference || 'لا تفضيلات'}
أوقات مشغولة: ${busyTimes || 'لا يوجد'}

المطلوب: رتب هذه المهام في جدول زمني مناسب (صباحاً أو مساءً حسب التفضيل).
أعد النتيجة كـ JSON array فقط، كل عنصر يحتوي:
- title: عنوان المهمة
- time: الوقت المقترح (مثال: "9:00 صباحاً")
- priority: "urgent" أو "high" أو "medium" أو "low"
- category: تصنيف المهمة
- description: وصف مختصر

مثال:
[{"title":"موعد طبي","time":"9:00 صباحاً","priority":"urgent","category":"medical","description":"كشف دوري"}]

لاتضف أي نص خارج JSON.`;

    const aiService = require('../services/aiService');
    const result = await aiService.generateCompletion(prompt);
    
    let schedule = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        schedule = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      return res.json({ error: 'لم يتمكن الذكاء الاصطناعي من تنظيم الجدول', raw: result });
    }

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
