const KHALEEJI_VERBS = [
  { root: 'ذكر', patterns: ['ذكر', 'اذكر', 'تذكر', 'يذكر', 'ذكرني', 'ذكريني', 'تذكير', 'ذكروني', 'اذكروني', 'فكرني', 'نبه', 'نبّه'] },
  { root: 'ضيف', patterns: ['ضيف', 'أضف', 'اضف', 'يضيف', 'إضافة', 'اضافة', 'ضيفني', 'زيد', 'يزيد'] },
  { root: 'حضر', patterns: ['حضر', 'احضر', 'يحضر', 'حضور', 'تحضير', 'جهز', 'يجهز'] },
  { root: 'شوف', patterns: ['شوف', 'أظهر', 'اظهر', 'يظهر', 'عرض', 'يعرض', 'عطيني', 'أعطيني', 'اعطيني', 'وريني', 'أرني', 'ارني'] },
  { root: 'سوي', patterns: ['سوي', 'اسوي', 'عمل', 'اعمل', 'أعمل', 'يعمل', 'سو', 'سوها', 'سوها', 'اسويها'] },
  { root: 'طلب', patterns: ['طلب', 'اطلب', 'يطلب', 'مطلوب', 'يحتاج', 'بغيت', 'بغى', 'يبغى', 'ابغى', 'أبغى', 'نبغى'] },
  { root: 'قل', patterns: ['قل', 'يقول', 'قول', 'احكي', 'حك', 'يحكي', 'احك', 'اقول', 'اقولك'] },
  { root: 'خلص', patterns: ['خلص', 'ينتهي', 'انتهاء', 'انتهى', 'خلاص'] },
  { root: 'جدد', patterns: ['جدد', 'يجدد', 'تجديد', 'استبدل', 'يستبدل', 'جدد', 'جددها'] },
  { root: 'سدد', patterns: ['سدد', 'يسدد', 'سداد', 'ادفع', 'أدفع', 'يدفع', 'دفع', 'سددها'] },
  { root: 'سجل', patterns: ['سجل', 'يسجل', 'تسجيل', 'سجلني'] },
  { root: 'رسل', patterns: ['رسل', 'يرسل', 'إرسال', 'ارسال', 'ابعث', 'يبعث'] },
  { root: 'رتب', patterns: ['رتب', 'يرتب', 'ترتيب', 'نظم', 'ينظم', 'تنظيم'] },
  { root: 'فطر', patterns: ['فطر', 'افطر', 'يفطر', 'فطور'] },
  { root: 'غدى', patterns: ['غدى', 'يتغدى', 'غداء'] },
  { root: 'عشى', patterns: ['عشى', 'يعشى', 'عشاء'] },
  { root: 'قعد', patterns: ['قعد', 'يقعد', 'قعدة', 'ديوانية'] },
  { root: 'زار', patterns: ['زار', 'يزور', 'زيارة'] },
  { root: 'خطط', patterns: ['خطط', 'يخطط', 'تخطيط', 'خططنا'] },
  { root: 'وعد', patterns: ['وعد', 'يواعد', 'موعد'] },
  { root: 'صلى', patterns: ['صلى', 'يصلي', 'صلاة', 'صلواة'] },
  { root: 'نادى', patterns: ['نادى', 'ينادي', 'اتصل', 'يتصل'] },
];

const AR_QUESTION_WORDS = {
  'وش': { en: 'what', type: 'what' },
  'شو': { en: 'what', type: 'what' },
  'ماذا': { en: 'what', type: 'what' },
  'ما ': { en: 'what', type: 'what' },
  'وشو': { en: 'what', type: 'what' },
  'كيف': { en: 'how', type: 'how' },
  'شلون': { en: 'how', type: 'how' },
  'كيفك': { en: 'how', type: 'how' },
  'شلونك': { en: 'how', type: 'how' },
  'ليه': { en: 'why', type: 'why' },
  'ليش': { en: 'why', type: 'why' },
  'متى': { en: 'when', type: 'when' },
  'وين': { en: 'where', type: 'where' },
  'من': { en: 'who', type: 'who' },
  'مين': { en: 'who', type: 'who' },
  'كم': { en: 'how_much', type: 'quantity' },
  'قديش': { en: 'how_much', type: 'quantity' },
  'هل': { en: 'is', type: 'yes_no' },
  'هَل': { en: 'is', type: 'yes_no' },
  'ايش': { en: 'what', type: 'what' },
  'ايه': { en: 'yes', type: 'confirmation' },
  'ايوه': { en: 'yes', type: 'confirmation' },
};

const AR_OBJECTS = [
  { word: 'الإقامة', aliases: ['اقامة', 'إقامة', 'اقامه', 'iqama', 'الإقامه', 'الاقامة'], docType: 'iqama' },
  { word: 'الرخصة', aliases: ['رخصة', 'الرخصه', 'رخصه', 'رخصة القيادة', 'القيادة'], docType: 'driving_license' },
  { word: 'الاستمارة', aliases: ['استمارة', 'الاستماره', 'استماره', 'سيارة', 'السيارة', 'المركبة', 'مركبة', 'الفزعة'], docType: 'car_registration' },
  { word: 'الجواز', aliases: ['جواز', 'جواز سفر', 'الجواز', 'السفر', 'passport'], docType: 'passport' },
  { word: 'التأمين', aliases: ['تأمين', 'تامين', 'التامين', 'التأمين الصحي'], docType: 'insurance' },
  { word: 'الإيجار', aliases: ['إيجار', 'ايجار', 'الايجار', 'العقد', 'الايجار'], docType: 'tenancy' },
  { word: 'أبشر', aliases: ['أبشر', 'ابشر'], docType: 'absher' },
  { word: 'الخدمات', aliases: ['خدمات', 'خدمة', 'الخدمة'], docType: 'service' },
];

const TIME_EXPRESSIONS = [
  { regex: /بكره|بكرا|باجر|غداً|غدا|tomorrow/i, offset: 1, unit: 'day' },
  { regex: /بعد\s*غد|بعد\s*بكره|بعد\s*بكرا|بعد\s*باجر/i, offset: 2, unit: 'day' },
  { regex: /اليوم|today|النهاردة/i, offset: 0, unit: 'day' },
  { regex: /بعد\s*أسبوع|بعد\s*اسبوع|الأسبوع\s*الجاي|الأسبوع\s*القادم|الاسبوع\s*الجاي|next\s*week/i, offset: 1, unit: 'week' },
  { regex: /بعد\s*شهر|الشهر\s*الجاي|الشهر\s*القادم|الشهر\s*الجاي|next\s*month/i, offset: 1, unit: 'month' },
  { regex: /بعد\s*سنة|بعد\s*عام|السنة\s*الجاية|السنة\s*القادمة|السنة\s*الجاية|السنه\s*الجايه|next\s*year/i, offset: 1, unit: 'year' },
  { regex: /هذا\s*الأسبوع|هالاسبوع|ذا\s*الاسبوع|this\s*week/i, offset: 0, unit: 'week', startOf: 'week' },
  { regex: /هذا\s*الشهر|هالشهر|ذا\s*الشهر|this\s*month/i, offset: 0, unit: 'month', startOf: 'month' },
  { regex: /الاثنين|الإثنين|Monday|mon\b/i, day: 1 },
  { regex: /الثلاثاء|Tuesday|tue\b/i, day: 2 },
  { regex: /الأربعاء|الاربعاء|Wednesday|wed\b/i, day: 3 },
  { regex: /الخميس|Thursday|thu\b/i, day: 4 },
  { regex: /الجمعة|Friday|fri\b/i, day: 5 },
  { regex: /السبت|Saturday|sat\b/i, day: 6 },
  { regex: /الأحد|الاحد|Sunday|sun\b/i, day: 0 },
  { regex: /بعد\s*(\d+)\s*(يوم|ايام|أيام|شهر|شهور|سنة|سنين|سنوات|week|month|year|day)/i, offset: 'capture' },
  { regex: /(\d+)\s*(day|week|month|year)s?\s+(from now|later|after|بعد|قادم|جاي)/i, offset: 'capture' },
  { regex: /عقب\s*(\d+)\s*(يوم|ايام|شهر|شهور|سنة)/i, offset: 'capture' },
  { regex: /هذا\s*اليوم|هاليوم/i, offset: 0, unit: 'day' },
  { regex: /عقب\s*اسبوع|عقب\s*أسبوع/i, offset: 7, unit: 'day' },
];

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AR_PRONOUNS = {
  references: ['ها', 'ه', 'هم', 'هن', 'هذا', 'هذه', 'ذلك', 'تلك', 'ذا', 'ذي', 'هذي', 'هذول', 'هذولي', 'it', 'its', 'they', 'them', 'this', 'that', 'these', 'those', 'ذول', 'ذولي'],
  possessive: ['ها', 'ه', 'هم', 'هن', 'ك', 'كم', 'كن', 'ي', 'نا'],
};

const AR_TOPIC_CHANGERS = [
  /^(طيب|خلاص|تمام|ok|okay|حسنا\s*|هذا\s*غير|غير\s*هذا|سؤال\s*ثاني|شي\s*ثاني|شيء\s*آخر|عندي\s*(سؤال|طلب))/i,
  /^(مرحبا|هلا|اهلا|اهلين|السلام|مساء|صباح|حياك|يا هلا)/i,
  /^(دعنا\s*نتكلم|خلينا\s*نتكلم|ابي\s*اسأل|ودي\s*اسأل|بغيت\s*اسأل|ابغى\s*اسأل)/i,
  /^(والله|يا\s*ولد|يا\s*رجال|يا\s*اخوي)/i,
];

class ArabicNLP {
  detectLanguage(text) {
    const ar = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    const en = (text.match(/[a-zA-Z]/g) || []).length;
    if (ar > en * 2) return 'ar';
    if (en > ar * 2) return 'en';
    if (ar > 0 && en > 0) return 'mixed';
    if (ar > 0) return 'ar';
    if (en > 0) return 'en';
    return 'unknown';
  }

  extractQuestion(text) {
    const clean = text.trim();
    for (const [qw, info] of Object.entries(AR_QUESTION_WORDS)) {
      const idx = clean.indexOf(qw);
      if (idx === 0 || (idx > 0 && /\s/.test(clean[idx - 1]))) {
        const after = clean.substring(idx + qw.length).trim();
        return { word: qw, type: info.type, en: info.en, rest: after };
      }
    }
    return null;
  }

  isQuestion(text) {
    return this.extractQuestion(text) !== null;
  }

  extractVerbs(text) {
    const found = [];
    for (const verb of AR_VERBS) {
      for (const p of verb.patterns) {
        if (text.includes(p)) {
          found.push({ root: verb.root, pattern: p });
          break;
        }
      }
    }
    return found;
  }

  extractObject(text) {
    for (const obj of AR_OBJECTS) {
      for (const alias of obj.aliases) {
        if (text.includes(alias)) return { word: obj.word, docType: obj.docType };
      }
    }
    return null;
  }

  parseTimeExpression(text) {
    const now = new Date();
    let targetDate = null;

    for (const expr of TIME_EXPRESSIONS) {
      const match = text.match(expr.regex);
      if (!match) continue;

      if (expr.offset === 'capture') {
        const num = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        targetDate = new Date(now);
        if (unit.includes('يوم') || unit.includes('day')) targetDate.setDate(targetDate.getDate() + num);
        else if (unit.includes('شهر') || unit.includes('month')) targetDate.setMonth(targetDate.getMonth() + num);
        else if (unit.includes('سنة') || unit.includes('year')) targetDate.setFullYear(targetDate.getFullYear() + num);
        else if (unit.includes('اسبوع') || unit.includes('week')) targetDate.setDate(targetDate.getDate() + num * 7);
        break;
      }

      if (expr.day !== undefined) {
        targetDate = new Date(now);
        const currentDay = targetDate.getDay();
        let diff = expr.day - currentDay;
        if (diff <= 0) diff += 7;
        targetDate.setDate(targetDate.getDate() + diff);
        break;
      }

      targetDate = new Date(now);
      if (expr.unit === 'day') targetDate.setDate(targetDate.getDate() + expr.offset);
      else if (expr.unit === 'week') targetDate.setDate(targetDate.getDate() + expr.offset * 7);
      else if (expr.unit === 'month') targetDate.setMonth(targetDate.getMonth() + expr.offset);
      else if (expr.unit === 'year') targetDate.setFullYear(targetDate.getFullYear() + expr.offset);

      if (expr.startOf === 'week') {
        const d = targetDate.getDay();
        targetDate.setDate(targetDate.getDate() - d);
      } else if (expr.startOf === 'month') {
        targetDate.setDate(1);
      }
      break;
    }

    const timeMatch = text.match(/الساعة\s*(\d{1,2})(?:\s*[:.]?\s*(\d{2})\s*)?(?:\s*(صباحاً|مساءً|ص|م|صباح|مساء|am|pm))?/i)
      || text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i)
      || text.match(/(\d{1,2})\s*(am|pm)/i);

    if (targetDate && timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const mins = timeMatch[2] && !isNaN(timeMatch[2]) ? parseInt(timeMatch[2]) : 0;
      const period = (timeMatch[3] || '').toLowerCase();
      if (period.includes('م') || period.includes('مساء') || period === 'pm') { if (hours < 12) hours += 12; }
      else if (period.includes('ص') || period.includes('صباح') || period === 'am') { if (hours === 12) hours = 0; }
      else if (hours < 5) hours += 12;
      targetDate.setHours(hours, mins, 0, 0);
    } else if (targetDate) {
      targetDate.setHours(9, 0, 0, 0);
    }

    return targetDate;
  }

  detectFollowUp(text, lastTopic) {
    const clean = text.trim();
    const isFollowUp = AR_PRONOUNS.references.some(p => {
      const re = new RegExp(`(^|\\s)${p}(\\s|$|،|,|\\.|\\?)`, 'i');
      return re.test(clean);
    }) || /^(و|ف)?(شو|وش|ماذا|كيف|ليه|ليش|متى|وين|من|كم|هل|هَل)\s*(عنه|عنها|عنك|بها|به|فيها|فيه|لها|له)?/i.test(clean)
      || /^(و|ف)?(زيدني|عطني|أعطني|اعطني|قل لي|قلي|احكي|حك لي|وشو|ايش|ايه)\s/i.test(clean)
      || (/^(و|ف)/i.test(clean) && clean.length < 50);

    if (isFollowUp && lastTopic) return lastTopic;
    return null;
  }

  isNewTopic(text) {
    return AR_TOPIC_CHANGERS.some(p => p.test(text.trim()));
  }

  classifyIntent(text) {
    const t = text.trim();

    const isGreeting = /^(مرحبا|هلا|اهلا|اهلين|السلام|مساء|صباح|يا هلا|حياك|حي الله|hi\b|hello|hey\b|good\s*(morning|evening))/i.test(t);
    if (isGreeting) return 'greeting';

    const isFarewell = /^(مع السلامه|مع السلامة|باي|تصبح|طيب خلاص|معاصة|معاصي|مع السلامة|فينا خير|bye|goodbye|see you|later)/i.test(t);
    if (isFarewell) return 'farewell';

    const isThanks = /^(شكر|تسلم|يعطيك|مشكور|الله يجزاك|بارك الله|الله يعافيك|يسلمو|يسلموا|يسلم راسك|thank|thanks|appreciate)/i.test(t);
    if (isThanks) return 'thanks';

    const q = this.extractQuestion(t);

    if (q) {
      const obj = this.extractObject(q.rest || t);
      if (obj) return 'doc_query_specific';
      if (/مخالفة|مخالفات|غرامة|غرامات|fine|violation/i.test(q.rest || t)) return 'doc_query_fines';
      if (/منصة|منصات|روابط|platform|link/i.test(q.rest || t)) return 'doc_query_platforms';
      if (/خطوة|خطوات|طريقة|كيفية|كيف|طريقه/i.test(q.rest || t) || q.type === 'how') return 'doc_query_steps';
      if (/سعر|ثمن|قيمة|رسوم|كم\s*(تكلف|سعر|قيمة|رسوم)/i.test(q.rest || t) || q.type === 'quantity') return 'doc_query_fees';
      if (/متى|time|date/i.test(q.rest || t) || q.type === 'when') return 'schedule_query';
      if (/مهامي|جدولي|عندي|مهمات|مواعيد/i.test(q.rest || t)) return 'task_list';
      if (/help|مساعدة|تقدر|what can|how to|وش تقدر/i.test(t)) return 'help';
      return 'general_question';
    }

    if (/عندي|ودي|ابي|أبي|أريد|لدي|ذكرني|ذكريني|بغيت|ابغى|أبغى|نبغى/i.test(t)) {
      const obj = this.extractObject(t);
      if (obj) return 'task_create_doc';
      if (/طبي|دكتور|مستشفى|عيادة/i.test(t)) return 'task_create_medical';
      if (/سفر|سافر|اسافر|رحلة|طيران|trip|travel/i.test(t)) return 'task_create_travel';
      if (/عزيمة|عزومة|وليمة|ضيوف|حفلة|عزايم/i.test(t)) return 'task_create_social';
      if (/مقابلة|interview/i.test(t)) return 'task_create_interview';
      if (/اجتماع|ديوانية|قعدة/i.test(t)) return 'task_create_meeting';
      if (/قهوة|تميس|cafe|starbucks/i.test(t)) return 'task_create_social';
      return 'task_create';
    }

    if (/مهامي|عندي مهام|جدولي|وش عندي|وش على|what tasks|my tasks|my schedule|what do i have/i.test(t)) return 'task_list';
    if (/تصنيف|أقسام|اقسام|categories/i.test(t)) return 'categories';

    const obj = this.extractObject(t);
    if (obj) return 'doc_query_specific';

    if (/مخالفة|مخالفات|غرامة|غرامات|ساهر|رادار/i.test(t)) return 'doc_query_fines';
    if (/منصة|منصات|روابط|platform|link/i.test(t)) return 'doc_query_platforms';
    if (/صباح|مساء|good morning|good evening/i.test(t)) {
      if (/كيف/i.test(t)) return 'greeting';
      return 'morning_checkin';
    }
    if (/كيف حال|how are you|شلون|شلونك|كيفك|عامل/i.test(t)) return 'how_are_you';
    if (/اسمك|your name|what are you|who are you/i.test(t)) return 'who_are_you';
    if (/مزح|joke|نكتة|ضحك|funny|هبل/i.test(t)) return 'joke';
    if (/help|مساعدة|وش تقدر|what can you|وش تسوي|الخدمات|services|ماذا تفعل|ماذا تقدم|ايش تسوي|ايش تقدر/i.test(t)) return 'help';
    if (/تذكير|remind|reminder|نبه|alert|فكرني/i.test(t)) return 'task_create';
    if (/عايز|أحتاج|احتاج|need|must|should/i.test(t)) return 'task_create';

    if (/نظم|رتب|اولوية|أولوية|priority|organize/i.test(t)) return 'organize';
    if (/متلخبط|حيرة|حائر|overwhelmed|confused|lost|دوشة|دوخة/i.test(t)) return 'help_organize';

    return 'general_chat';
  }

  extractEntities(text) {
    const entities = { date: null, time: null, amount: null, person: null, place: null, docTypes: [] };

    entities.date = this.parseTimeExpression(text);

    const timeMatch = text.match(/الساعة\s*(\d{1,2})(?:\s*[:.]?\s*(\d{2})\s*)?(?:\s*(صباحاً|مساءً|ص|م|صباح|مساء|am|pm))?/i)
      || text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i)
      || text.match(/(\d{1,2})\s*(am|pm)/i);
    if (timeMatch) {
      entities.time = { hour: parseInt(timeMatch[1]), minute: timeMatch[2] ? parseInt(timeMatch[2]) : 0, period: timeMatch[3] || null };
    }

    const amountMatch = text.match(/(\d+)\s*(ريال|﷼|دولار|sar|usd|جنيه)/i);
    if (amountMatch) {
      entities.amount = { value: parseInt(amountMatch[1]), currency: amountMatch[2] };
    }

    for (const obj of AR_OBJECTS) {
      for (const alias of obj.aliases) {
        if (text.includes(alias)) {
          entities.docTypes.push(obj.docType);
          break;
        }
      }
    }

    return entities;
  }

  extractTitle(text) {
    let title = text
      .replace(/ذكرني\s+(في\s+)?/gi, '').replace(/remind\s+(me\s+)?(about|of|to|that\s+)?/gi, '')
      .replace(/عندي\s+/i, '').replace(/i\s+have\s+/i, '').replace(/i\s+have\s+a\s+/i, '')
      .replace(/ودي\s+/i, '').replace(/i\s+want\s+/i, '').replace(/i\s+want\s+a\s+/i, '').replace(/i\s+want\s+to\s+/i, '')
      .replace(/أريد\s+/i, '').replace(/i\s+need\s+/i, '').replace(/i\s+would\s+/i, '')
      .replace(/ابي\s+/i, '').replace(/لدي\s+/i, '')
      .replace(/that\s+/i, '').replace(/me\s+(at|for|about|to)\s+/gi, '')
      .replace(/add\s+/i, '').replace(/create\s+/i, '').replace(/set\s+(a\s+|an\s+)?/gi, '')
      .replace(/الساعة\s*\d{1,2}[:.]?\d{0,2}\s*(صباحاً|مساءً|ص|م|صباح|مساء|am|pm)?/gi, '')
      .replace(/(at|by)\s+\d{1,2}[:.]?\d{0,2}\s*(am|pm)?/gi, '')
      .replace(/يوم\s*\d{1,2}\s*/g, '').replace(/on\s+(the\s+)?\d{1,2}(st|nd|rd|th)?/gi, '')
      .replace(/(الشهر الجاي|الشهر القادم|الشهر المقبل|بكره|بكرا|غداً|غدا|اليوم|بعد\s*غد|بعد\s*أسبوع|بعد\s*شهر|هذا الأسبوع|هذا الشهر)/g, '')
      .replace(/(tomorrow|next\s+\w+|today|in\s+\d+\s+\w+)/gi, '').trim();

    return title || null;
  }

  parsePriority(text) {
    if (/عاجل|urgent|مهم جدا|ضروري|asap|فوراً|فورا|مستعجل/i.test(text)) return 'urgent';
    if (/مهم|high|هاي|important|هام/i.test(text)) return 'high';
    return 'medium';
  }

  getCategoryIcon(category) {
    const icons = {
      general: '📋', visa: '🛂', iqama: '🆔', driving_license: '🚗',
      car_registration: '🚙', passport: '📘', insurance: '🛡️',
      bill: '🧾', loan: '💰', installment: '💳', rent: '🏠',
      salary: '💵', meeting: '🤝', medical: '🏥', work: '💼',
      school: '📚', exam: '📝', interview: '👔', birthday: '🎂',
      anniversary: '💍', occasion: '🎉', party: '🎊', travel: '✈️',
      booking: '📋', maintenance: '🔧', shopping: '🛒', sports: '⚽',
      religious: '🕋', project_deadline: '📌', appointment: '📅', important: '⭐',
    };
    return icons[category] || '📌';
  }

  getPriorityIcon(priority) {
    return { urgent: '⛔', high: '🔴', medium: '🟡', low: '🟢' }[priority] || '📌';
  }
}

module.exports = new ArabicNLP();
