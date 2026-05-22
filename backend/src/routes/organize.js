const express = require('express');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

function splitItems(msg) {
  let text = msg.replace(/[،,]\s*/g, '|').replace(/\n+/g, '|');
  const sepRegex = /\||(?:^|\s)و|ايضا\s|أيضا\s|كمان\s|also\s|\sand\s/i;
  let parts = text.split(sepRegex).map(s => s.trim()).filter(s => s.length > 3);
  const taskIndicators = ['موعد', 'عندي', 'مفروض', 'لازم', 'يجب', 'ودي', 'ابي', 'أبي',
    'ذكر', 'remind', 'task', 'appointment', 'meeting', 'schedule',
    'طبيب', 'دكتور', 'سفر', 'سافر', 'ضيوف', 'عزيمة', 'عزومة', 'وليمة', 'مقابلة', 'اجتماع',
    'must', 'need', 'have', 'should', 'going', 'will',
    'خص', 'خلص', 'قدم', 'سجل', 'جدد', 'جديد', 'حجز', 'سدد', 'ادفع', 'دفع',
    'تسليم', 'مشروع', 'موعد', 'ذكرني'];
  parts = parts.filter(p => taskIndicators.some(i => p.includes(i)));
  return parts.length > 1 ? parts : [msg];
}

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

function smartPriority(category) {
  const urgent = ['medical', 'exam', 'interview', 'important', 'bill', 'deadline', 'iqama', 'visa', 'passport'];
  const high = ['work', 'meeting', 'appointment', 'travel', 'insurance', 'rent', 'car_registration', 'driving_license', 'salary'];
  if (urgent.includes(category)) return 'urgent';
  if (high.includes(category)) return 'high';
  return 'medium';
}

function formatDate(d) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]}`;
}

const CAT_ICONS = {
  general: '📋', visa: '🛂', iqama: '🆔', driving_license: '🚗',
  car_registration: '🚙', passport: '📘', insurance: '🛡️',
  bill: '🧾', loan: '💰', installment: '💳', rent: '🏠',
  salary: '💵', meeting: '🤝', medical: '🏥', work: '💼',
  school: '📚', exam: '📝', interview: '👔', birthday: '🎂',
  anniversary: '💍', occasion: '🎉', party: '🎊', travel: '✈️',
  booking: '📋', maintenance: '🔧', shopping: '🛒', sports: '⚽',
  religious: '🕋', project_deadline: '📌', appointment: '📅', important: '⭐',
};

const PRIORITY_ICONS = { urgent: '⛔', high: '🔴', medium: '🟡', low: '🟢' };
const PRIORITY_LABELS = { urgent: 'عاجل', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };

const CAT_GROUPS = {
  urgent: { label: '⛔ عاجل', categories: ['medical', 'exam', 'interview', 'important', 'bill', 'deadline', 'iqama', 'visa', 'passport'] },
  high: { label: '🔴 عالية', categories: ['work', 'meeting', 'appointment', 'travel', 'insurance', 'rent', 'car_registration', 'driving_license', 'salary'] },
  medium: { label: '🟡 متوسطة', categories: ['general', 'party', 'birthday', 'anniversary', 'occasion', 'shopping', 'sports', 'booking', 'maintenance', 'religious', 'school'] },
};

router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'النص مطلوب' });

    const items = splitItems(text);
    const organized = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parsed = await aiService.parseNaturalLanguage(item, req.user?.name || 'User');

      const category = parsed.category || 'general';
      let dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
      if (!dueDate && !hasNoDateIntent(item)) {
        dueDate = guessDate(category, i);
      }
      const priority = smartPriority(category);

      organized.push({
        index: i,
        title: (parsed.title || item).substring(0, 60),
        description: parsed.description || item,
        category,
        priority,
        icon: CAT_ICONS[category] || '📋',
        priorityIcon: PRIORITY_ICONS[priority],
        priorityLabel: PRIORITY_LABELS[priority],
        dueDate: dueDate ? dueDate.toISOString() : null,
        dueDateFormatted: dueDate ? formatDate(dueDate) : 'بدون تاريخ',
        hasNoDate: hasNoDateIntent(item),
      });
    }

    const sorted = [...organized].sort((a, b) => {
      const w = { urgent: 0, high: 1, medium: 2, low: 3 };
      const pa = w[a.priority] || 3;
      const pb = w[b.priority] || 3;
      if (pa !== pb) return pa - pb;
      const da = a.dueDate ? new Date(a.dueDate) : new Date(864e13);
      const db = b.dueDate ? new Date(b.dueDate) : new Date(864e13);
      return da - db;
    });

    const summary = {
      total: organized.length,
      urgent: organized.filter(i => i.priority === 'urgent').length,
      high: organized.filter(i => i.priority === 'high').length,
      medium: organized.filter(i => i.priority === 'medium').length,
      noDate: organized.filter(i => i.hasNoDate).length,
    };

    const categorized = {};
    for (const [, group] of Object.entries(CAT_GROUPS)) {
      const items = organized.filter(i => group.categories.includes(i.category) ||
        (i.priority === 'urgent' && group.label.includes('عاجل')) ||
        (i.priority === 'high' && group.label.includes('عالية')));
      if (items.length > 0) {
        categorized[group.label] = items;
      }
    }

    if (Object.keys(categorized).length === 0) {
      categorized['📋 أخرى'] = organized;
    }

    res.json({ items: organized, sorted, summary, categorized });
  } catch (error) {
    console.error('Organize error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/confirm', auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'لا يوجد برامج للتأكيد' });

    const taskService = require('../services/taskService');
    const created = [];

    for (const item of items) {
      const task = await taskService.createTask(req.userId, {
        title: item.title || item.description?.substring(0, 40) || 'برنامج',
        description: item.description || item.title,
        category: item.category || 'general',
        priority: item.priority || 'medium',
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        reminderInterval: 60,
      });
      created.push(task);
    }

    res.json({ success: true, count: created.length, tasks: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
