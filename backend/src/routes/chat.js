const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const taskService = require('../services/taskService');
const govService = require('../services/governmentService');
const schedulerService = require('../services/schedulerService');
const docModel = require('../models/Document');
const Task = require('../models/Task');
const mem = require('../services/conversationMemory');
const nlp = require('../services/arabicNLP');

const router = express.Router();

function guessDate(category, batchIndex = 0) {
  const d = new Date();
  const urgent = ['medical', 'important', 'bill', 'exam', 'interview'];
  const soon = ['meeting', 'work', 'appointment', 'rent', 'insurance', 'car_registration', 'driving_license'];
  if (urgent.includes(category)) d.setDate(d.getDate() + 1 + batchIndex);
  else if (soon.includes(category)) d.setDate(d.getDate() + 3 + batchIndex);
  else d.setDate(d.getDate() + 7 + batchIndex);
  d.setHours(9, 0, 0, 0);
  return d;
}

function hasNoDateIntent(item) {
  return /ما\s*عار|ما\s*عرفت|ما\s*اعرف|ما\s*عندي\s*تاريخ|بدون\s*تاريخ|no\s*date|unsure|not\s*sure\s*when/i.test(item);
}

function smartPriority(category, title) {
  const urgent = ['medical', 'exam', 'interview', 'important', 'bill', 'deadline', 'iqama', 'visa', 'passport'];
  const high = ['work', 'meeting', 'appointment', 'travel', 'insurance', 'rent', 'car_registration', 'driving_license', 'salary'];
  if (urgent.some(u => category.includes(u) || title.includes(u))) return 'urgent';
  if (high.some(h => category.includes(h) || title.includes(h))) return 'high';
  return 'medium';
}

function isTaskMessage(msg) {
  const taskIndicators = ['موعد', 'عندي', 'مفروض', 'لازم', 'يجب', 'انا', 'أنا', 'ودي', 'ابي', 'أبي',
    'ذكر', 'remind', 'task', 'appointment', 'meeting', 'schedule',
    'طبيب', 'دكتور', 'سفر', 'سافر', 'اسافر', 'ضيوف', 'عزيمة', 'عزومة', 'وليمة', 'مقابلة', 'اجتماع',
    'must', 'need', 'have', 'should', 'going', 'will', 'would',
    'خص', 'خصص', 'خلص', 'قدم', 'سجل', 'جدد', 'جديد', 'حدث', 'حجز', 'سدد', 'ادفع', 'دفع'];
  return taskIndicators.some(i => msg.includes(i));
}

function splitItems(msg) {
  let text = msg.replace(/[،,]\s*/g, '|').replace(/\n+/g, '|');
  const sepRegex = /\||(?:^|\s)و|ايضا\s|أيضا\s|كمان\s|also\s|\sand\s/i;
  let parts = text.split(sepRegex).map(s => s.trim()).filter(s => s.length > 6);
  parts = parts.filter(isTaskMessage);
  return parts.length > 1 ? parts : [msg];
}

router.post('/parse', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const user = await (require('../models/User')).findById(req.userId);
    const userName = user ? user.name : 'User';

    mem.addMessage(req.userId, 'user', message);
    mem.setContext(req.userId, 'lastIntent', 'parse');

    const parsed = await aiService.parseNaturalLanguage(message, userName);

    if (parsed.title && parsed.dueDate) {
      const dueDate = new Date(parsed.dueDate);
      const task = await taskService.createTask(req.userId, {
        title: parsed.title,
        description: parsed.description || message,
        category: parsed.category || 'general',
        priority: parsed.priority || 'medium',
        dueDate,
        reminderInterval: parsed.reminderInterval || 30,
      });

      mem.addMessage(req.userId, 'assistant', `تم إضافة ${parsed.title}`);
      mem.clearContext(req.userId);
      return res.json({ parsed, task, created: true });
    }

    mem.addMessage(req.userId, 'assistant', 'لم يتم التعرف على موعد محدد');
    res.json({ parsed, created: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { message, messages } = req.body;
    let msgs;
    if (message) msgs = [{ text: message }];
    else if (messages && messages.length) msgs = messages;
    else return res.status(400).json({ error: 'Message is required' });

    const lastText = msgs[msgs.length - 1].text;
    const user = await (require('../models/User')).findById(req.userId);
    const userName = user ? user.name : 'User';
    const lang = lastText.match(/[a-zA-Z]/) ? 'en' : 'ar';

    mem.addMessage(req.userId, 'user', lastText);
    const context = mem.getContext(req.userId);
    const intent = nlp.classifyIntent(lastText);
    const isFollowUp = mem.isFollowUp(lastText);

    mem.setContext(req.userId, 'lastIntent', intent);

    const taskIntents = ['task_create', 'task_create_doc', 'task_create_medical',
      'task_create_travel', 'task_create_social', 'task_create_interview', 'task_create_meeting'];
    const docIntents = ['doc_query_specific', 'doc_query_fines', 'doc_query_platforms', 'doc_query_steps', 'doc_query_fees'];

    let sideEffect = null;
    let createdTasks = [];

    if (taskIntents.includes(intent) || (intent === 'general_chat' && isFollowUp && context.currentTopic === 'task_creation')) {
      const items = splitItems(lastText);
      const created = [];
      const unclear = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const parsed = await aiService.parseNaturalLanguage(item, userName);
        if (parsed && parsed.category && parsed.category !== 'general') {
          let dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
          if (!dueDate && !hasNoDateIntent(item)) {
            dueDate = guessDate(parsed.category, i);
          }
          let priority = parsed.priority;
          if (!priority || priority === 'medium') {
            priority = smartPriority(parsed.category, parsed.title || '');
          }
          const task = await taskService.createTask(req.userId, {
            title: parsed.title || item.substring(0, 40),
            description: parsed.description || item,
            category: parsed.category,
            priority, dueDate, reminderInterval: 60,
          });
          created.push({ title: parsed.title || item.substring(0, 40), category: parsed.category, priority, dueDate, id: task._id });
        } else if (parsed && parsed.title) {
          unclear.push({ title: parsed.title, text: item });
        }
      }
      if (created.length > 0) {
        sideEffect = 'task_created';
        createdTasks = created;
      }
    }

    if (sideEffect !== 'task_created' && (docIntents.includes(intent) || ['إقامة', 'اقامة', 'رخصة', 'استمارة', 'جواز', 'تأمين', 'مخالفة', 'مخالفات', 'غرامة', 'منصة', 'منصات', 'أبشر', 'وثيقة', 'وثائق', 'مستند', 'مستندات'].some(k => lastText.includes(k)) || (intent === 'general_chat' && isFollowUp && context.currentTopic === 'documents'))) {
      sideEffect = 'doc_query';
    }

    const existingTasks = await Task.find({ userId: req.userId, status: { $ne: 'completed' } });

    const aiPrompt = aiService._buildAIPrompt(lastText, existingTasks, mem.getHistory(req.userId), mem.getContext(req.userId), userName);
    let aiReply = null;
    if (aiService.hasAI) {
      const result = await aiService.generateCompletion(
        aiPrompt + (sideEffect === 'task_created'
          ? `\n\nNote: I already created ${createdTasks.length} task(s) for the user. Acknowledge this briefly and naturally.`
          : sideEffect === 'doc_query'
          ? '\n\nOffer to look up government document info if they ask. Otherwise respond normally.'
          : ''),
        600
      );
      if (result) aiReply = result;
    }

    if (sideEffect === 'task_created' && createdTasks.length > 0) {
      let response = aiReply || '';
      if (!response) {
        response = lang === 'en' ? '✅ Done! I organized everything:\n\n' : '✅ تم! نظمتلك كل شيء:\n\n';
        createdTasks.forEach(t => {
          const catIcons = { medical: '🏥', travel: '✈️', social: '🎉', meeting: '🤝', general: '📋', work: '💼', school: '📚', important: '⭐', appointment: '📅', birthday: '🎂', party: '🎊', religious: '🕋', sports: '⚽', shopping: '🛒', bill: '🧾', rent: '🏠', salary: '💵', interview: '👔', exam: '📝', project_deadline: '📌', insurance: '🛡️', visa: '🛂', iqama: '🆔', driving_license: '🚗', car_registration: '🚙', passport: '📘' };
          const due = t.dueDate ? new Date(t.dueDate) : null;
          const dateStr = due && !isNaN(due) ? due.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-SA', { weekday: 'short', month: 'short', day: 'numeric' }) : (lang === 'en' ? '📅 No date set' : '📅 بدون تاريخ');
          response += `${nlp.getPriorityIcon(t.priority)} ${catIcons[t.category] || '📋'} **${t.title}** — ${dateStr}\n`;
        });
        response += lang === 'en' ? '\n\n📋 Check your Tasks page for all details!' : '\n\n📋 شيك على صفحة المواعيد عشان تشوف كل التفاصيل!';
      }

      mem.setContext(req.userId, 'currentTopic', 'task_creation');
      mem.resetFollowUp(req.userId);
      mem.addMessage(req.userId, 'assistant', response);
      return res.json({ response, reply: response, taskCreated: true, tasks: createdTasks });
    }

    if (sideEffect === 'doc_query' && aiReply) {
      const reply = aiReply;
      mem.setContext(req.userId, 'currentTopic', 'documents');
      mem.addMessage(req.userId, 'assistant', reply);
      mem.resetFollowUp(req.userId);
      return res.json({ response: reply, reply, taskCreated: false, documentCheck: true });
    }

    if (!aiReply) {
      aiReply = await aiService.chatResponse(msgs, existingTasks, req.userId);
    }

    mem.addMessage(req.userId, 'assistant', aiReply);
    const followUpContext = context.currentTopic;
    if (followUpContext && !nlp.isNewTopic(lastText)) {
      mem.incrementFollowUp(req.userId);
    }

    res.json({ response: aiReply, reply: aiReply, taskCreated: false });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
