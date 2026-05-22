const config = require('../config');
const nlp = require('./arabicNLP');
const mem = require('./conversationMemory');

class AIService {
  constructor() {
    this.openrouterKey = config.openrouter.apiKey;
    this.openrouterModel = config.openrouter.model;
    this.geminiKey = config.gemini.apiKey;
    this.openaiKey = config.openai.apiKey;
    this.hasOpenRouter = this.openrouterKey && this.openrouterKey.startsWith('sk-or-v1-');
    this.hasGemini = this.geminiKey && this.geminiKey.startsWith('AIza') && !this.geminiKey.includes(' ');
    this.hasOpenAI = this.openaiKey && this.openaiKey.startsWith('sk-') && !this.openaiKey.includes(' ');
    this.hasAI = this.hasOpenRouter || this.hasGemini || this.hasOpenAI;
  }

  async _callOpenRouter(prompt, systemPrompt, maxTokens) {
    if (!this.hasOpenRouter) return null;
    try {
      const axios = require('axios');
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: this.openrouterModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens || 500,
        temperature: 0.8,
      }, {
        headers: {
          Authorization: `Bearer ${this.openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'درب - سكرتير خاص فيك',
        },
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter error:', error.message, error.response?.data);
      return null;
    }
  }

  async _callGemini(prompt, systemPrompt) {
    if (!this.hasGemini) return null;
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini error:', error.message);
      return null;
    }
  }

  _systemPrompt(userName = '') {
    const nameContext = userName ? ` The user's name is ${userName}. Address them by name naturally, or call them "يا سيدي" (for male) or "يا سيدتي" (for female).` : '';
    return `You are "درب" (Darb), a smart male personal secretary. You always speak as a male using masculine Arabic forms (أنا، أسوي، أقول).
Key rules:
- ONLY greet with "مرحباً" or similar on the FIRST message of a conversation, never in follow-ups.
- Always use MASCULINE Arabic forms when referring to yourself (أنا, أريد, أقدر, أسوي, أضيف — never أنا/أقدر/أسوي with feminine taa).
- Address the user respectfully: call males "يا سيدي" or "يا أخ", females "يا سيدتي" or "يا أخت".
- If the user gives their name, use it naturally in conversation.
- Be warm, helpful, and conversational. Respond in the same language the user speaks.${nameContext}`;
  }

  async generateCompletion(prompt, maxTokens = 500) {
    const or = await this._callOpenRouter(prompt, this._systemPrompt(), maxTokens);
    if (or) return or;

    const gemini = await this._callGemini(prompt, this._systemPrompt());
    if (gemini) return gemini;

    if (!this.hasOpenAI) return null;
    try {
      const axios = require('axios');
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this._systemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }, {
        headers: { Authorization: `Bearer ${this.openaiKey}`, 'Content-Type': 'application/json' },
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI service error:', error.message);
      return null;
    }
  }

  async parseNaturalLanguage(message, userName) {
    if (this.hasAI) {
      const prompt = `Parse this message for a task/reminder. Return ONLY JSON with: title, description, category, priority (low/medium/high/urgent), dueDate (ISO or ""), reminderInterval (minutes or 30).
Categories: general, visa, iqama, driving_license, car_registration, passport, insurance, bill, loan, installment, rent, salary, meeting, medical, work, school, exam, interview, birthday, anniversary, occasion, party, travel, booking, maintenance, shopping, sports, religious, project_deadline, appointment, important, other.

Message: "${message}"
User: ${userName}

Return ONLY valid JSON.`;
      const result = await this.generateCompletion(prompt, 300);
      if (result) {
        try { return JSON.parse(result); } catch {
          const m = result.match(/\{[\s\S]*\}/);
          if (m) try { return JSON.parse(m[0]); } catch {}
        }
      }
    }

    const category = nlp.classifyIntent(message) || 'general';
    const dueDate = nlp.parseTimeExpression(message);
    const priority = nlp.parsePriority(message);
    const title = nlp.extractTitle(message) || message.substring(0, 40);
    return { title, description: message, category, priority, dueDate: dueDate ? dueDate.toISOString() : '', reminderInterval: 30 };
  }

  async chatResponse(messages, tasks, userId) {
    const lastMsg = messages[messages.length - 1].text;
    const history = mem.getHistory(userId);
    const context = mem.getContext(userId);
    const lang = nlp.detectLanguage(lastMsg);
    let userName = '';
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user) userName = user.name || '';
    } catch {}

    if (this.hasAI) {
      const prompt = this._buildAIPrompt(lastMsg, tasks, history, context, userName);
      const result = await this.generateCompletion(prompt, 800);
      if (result) return result;
    }

    return this._smartChat(lastMsg, tasks, history, context, lang, userId);
  }

  _buildAIPrompt(msg, tasks, history, context, userName = '') {
    const recentHistory = history.slice(-4).map(h => `${h.role}: ${h.text}`).join('\n');
    const isFirst = history.length <= 1;
    const taskSummary = tasks.length > 0
      ? `\nCurrent tasks:\n${tasks.map((t, i) => `${i + 1}. ${t.title}${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`).join('\n')}`
      : '\nNo tasks yet.';

    const topicInfo = context.currentTopic ? `\nCurrent topic: ${context.currentTopic}` : '';

    return `${this._systemPrompt(userName)}
${isFirst ? '\n(First message — brief greeting allowed)' : '\n(Follow-up message — NO greeting, respond directly)'}
Recent conversation:${recentHistory}${topicInfo}
Current tasks:${taskSummary}

User: ${msg}

Respond naturally as a male speaker (masculine forms). If they want a task, confirm details. Be genuinely helpful.`;
  }

  _smartChat(msg, tasks, history, context, lang, userId) {
    const trimmed = msg.trim();
    const followUpTopic = nlp.detectFollowUp(trimmed, context.currentTopic);
    const intent = nlp.classifyIntent(trimmed);

    if (followUpTopic && intent === 'general_chat') {
      return this._handleFollowUp(msg, followUpTopic, context, lang, userId);
    }

    if (intent === 'general_question' || intent === 'general_chat') {
      const prevResponse = history.slice(-1).find(h => h.role === 'assistant');
      if (prevResponse && nlp.isFollowUp(trimmed)) {
        return this._handleFollowUp(msg, context.currentTopic || context.lastTopic, context, lang, userId);
      }
    }

    switch (intent) {
      case 'greeting': return this._greeting(msg, lang, userId, context);
      case 'morning_checkin': return this._morningCheckin(msg, tasks, context, lang, userId);
      case 'farewell': return this._farewell(lang);
      case 'thanks': return this._thanks(lang);
      case 'how_are_you': return this._howAreYou(lang);
      case 'who_are_you': return this._whoAreYou(lang);
      case 'help': return this._help(lang);
      case 'categories': return this._categories(lang);
      case 'joke': return this._joke(lang);
      case 'task_list': return this._taskListResponse(tasks, lang);
      case 'schedule_query': return this._scheduleQueryResponse(tasks, lang);
      case 'organize':
      case 'help_organize': return this._organizeOffer(lang);
      default: {
        if (this._isDocRelated(trimmed)) {
          mem.setContext(userId, 'currentTopic', 'documents');
          mem.incrementFollowUp(userId);
          return this._docQuery(msg, lang, userId);
        }
        if (this._isTaskRelated(trimmed, intent)) {
          mem.setContext(userId, 'currentTopic', 'task_creation');
          mem.resetFollowUp(userId);
          return this._taskCreateResponse(msg, lang, userId);
        }
        return this._generalResponse(lang);
      }
    }
  }

  _isDocRelated(text) {
    const docWords = ['إقامة', 'اقامة', 'رخصة', 'قيادة', 'استمارة', 'سيارة', 'جواز', 'تأمين', 'تامين',
      'مخالفة', 'مخالفات', 'غرامة', 'غرامات', 'منصة', 'منصات', 'روابط', 'وثيقة', 'وثائق', 'مستند',
      'تجديد', 'انتهاء', 'صلاحية', 'أبشر', 'ابشر', 'منصة'];
    return docWords.some(w => text.includes(w));
  }

  _isTaskRelated(text, intent) {
    const taskIntents = ['task_create', 'task_create_doc', 'task_create_medical', 'task_create_travel',
      'task_create_social', 'task_create_interview', 'task_create_meeting'];
    if (taskIntents.includes(intent)) return true;
    const taskWords = ['موعد', 'عندي', 'ودي', 'ابي', 'أبي', 'ذكرني', 'تذكير', 'remind', 'schedule', 'appointment'];
    return taskWords.some(w => text.includes(w));
  }

  _handleFollowUp(msg, topic, context, lang, userId) {
    mem.incrementFollowUp(userId);

    if (topic === 'documents') {
      const entities = nlp.extractEntities(msg);
      if (entities.docTypes.length > 0) {
        mem.setContext(userId, 'currentTopic', 'documents');
        return this._docSpecificQuery(msg, lang, entities.docTypes[0], userId);
      }
      if (/مخالفة|مخالفات|غرامة|غرامات/i.test(msg)) return this._finesResponse(lang);
      if (/منصة|منصات|روابط|platform|link/i.test(msg)) return this._platformsResponse(lang);
      if (/كم|سعر|قيمة|رسوم|تكلف/i.test(msg)) return this._feesFollowUp(lang, userId);
      if (/طريقة|كيف|خطوة|خطوات/i.test(msg)) return this._stepsFollowUp(lang, userId);
      return this._docFollowUpGeneral(lang, userId);
    }

    if (topic === 'task_creation') {
      const pending = mem.getPendingTask(userId);
      if (pending) {
        const confirm = mem.isConfirmation(msg);
        if (confirm === 'yes') {
          mem.clearPendingTask(userId);
          return lang === 'en'
            ? 'Perfect! I\'ll create that task for you now ✅\n\nYou can check it in your Tasks page.'
            : 'تمام! بأضيف الموعد لك الآن ✅\n\nتقدر تتأكد منه في صفحة المواعيد.';
        }
        if (confirm === 'no') {
          mem.clearPendingTask(userId);
          mem.setContext(userId, 'currentTopic', null);
          return lang === 'en'
            ? 'No problem! Tell me what you\'d like to change or start over.'
            : 'ما عندك مشكلة! قلي وش تبي تغير أو ابدأ من جديد.';
        }
      }
      return this._taskCreateResponse(msg, lang, userId);
    }

    mem.setContext(userId, 'currentTopic', null);
    mem.resetFollowUp(userId);
    return this._generalResponse(lang);
  }

  _greeting(msg, lang, userId, context) {
    const isCheckin = /صباح|morning/i.test(msg) && !/كيف/i.test(msg);
    mem.setContext(userId, 'currentTopic', 'greeting');
    mem.resetFollowUp(userId);

    if (isCheckin) return this._morningCheckin(msg, [], context, lang, userId);

    const greetingsAr = [
      'مرحباً يا سيدي! 👋 أنا درب، سكرتيرك الخاص.\n\nأقدر أساعدك في:\n📅 إضافة مواعيد وتذكيرات\n🗂️ تنظيم جدولك\n✅ متابعة مهامك\n\nجرب تقول:\n• "ذكرني بتجديد رخصة السيارة"\n• "عندي اجتماع بكره الساعة 10"\n• "وش عندي من مهام؟"',
      'يا هلا وسهلا يا سيدي! 🤖✨\n\nدرب معك. أتكلم عربي وإنجليزي، وأفهم أي كلام طبيعي.\nجرب تقول:\n📅 "موعد دكتور يوم 15"\n📌 "ذكرني بعيد ميلاد أختي"\n🗂️ "أظهر لي جدولي"',
      'أهلاً بك يا سيدي! 👋\n\nأنا درب، هنا عشان أسهل حياتك. تقدر تتكلم معاي بشكل طبيعي:\n• "عندي مقابلة وظيفة بكره"\n• "ذكرني بدفع الإيجار"\n• "أضف موعد تجديد الاستمارة"\n\nوش تبي أسوي لك؟',
    ];
    const greetingsEn = [
      "Hey there! I'm Darb, your personal AI secretary 🤖\n\nI can help you with:\n• 📅 Creating reminders & appointments\n• 🗂️ Organizing your schedule\n• ✅ Tracking tasks\n\nTry saying something like:\n\"Remind me to renew my car registration on the 15th\"\n\"Schedule a meeting tomorrow at 10am\"\n\"What's on my schedule?\"",
      "Hello! Great to see you 👋 I'm Darb.\n\nI'm here to help you stay organized. Just tell me what you need:\n\n• \"Remind me about the team meeting Friday\"\n• \"Schedule dentist appointment next week\"\n• \"What tasks do I have?\"",
    ];
    return lang === 'en'
      ? greetingsEn[Math.floor(Math.random() * greetingsEn.length)]
      : greetingsAr[Math.floor(Math.random() * greetingsAr.length)];
  }

  _morningCheckin(msg, tasks, context, lang, userId) {
    mem.setContext(userId, 'currentTopic', 'morning');
    mem.resetFollowUp(userId);
    return null;
  }

  _farewell(lang) {
    if (lang === 'en') {
      const r = [
        "Goodbye! Take care 😊 Remember, I'm always here when you need me.",
        "See you later! Have a great day ✨ Don't forget to check your tasks!",
        "Bye for now! I'll be right here whenever you need me 👋",
      ];
      return r[Math.floor(Math.random() * r.length)];
    }
    const r = [
      'مع السلامة يا سيدي! 🤚 كان معك درب. إذا احتجتني أنا موجود.',
      'الله يسلمك يا سيدي! ✨ في أمان الله.\nلا تنسى تشيك على جدولك قبل لا تروح.',
      'طيب يا سيدي، نشوفك على خير 🤚 تقدر ترجع لأي وقت.',
    ];
    return r[Math.floor(Math.random() * r.length)];
  }

  _thanks(lang) {
    if (lang === 'en') {
      return ["You're very welcome! 😊 Happy to help. Let me know if there's anything else!",
        "Anytime! That's what I'm here for 🫡 Need anything else?",
        "Glad I could help! 🙌 Don't hesitate to ask if you need anything."][Math.floor(Math.random() * 3)];
    }
    return ['العفو يا سيدي! هذا أقل واجب 🫡\n\nإذا احتجت شيء ثاني أنا موجود.',
      'الله يعافيك يا سيدي! 🤍 فخور إني أساعدك.\nتقدر تطلب أي وقت.',
      'لا شكر على واجب يا سيدي! 😊\nإذا عندك أي طلب ثاني، أنا هنا.'][Math.floor(Math.random() * 3)];
  }

  _howAreYou(lang) {
    return lang === 'en'
      ? "I'm doing great, thanks for asking! 😊 Ready and energized to help you out. What's on your mind?"
      : 'الحمدلله تمام يا سيدي! 💪 جاهز أساعدك. كيف حالك؟ وش تبي؟';
  }

  _whoAreYou(lang) {
    return lang === 'en'
      ? "My name is **Darb** (درب)! It means 'path' in Arabic — because I'm here to guide you on the right path with your tasks and schedule 😊"
      : 'اسمي **درب**! 🤖 معناها الطريق، لأني هنا أرشدك وتنظم لك جدولك 😊';
  }

  _help(lang) {
    return lang === 'en'
      ? "I'm Darb, your personal AI secretary! 🤖 Here's what I can do:\n\n📅 **Tasks & Reminders** — Say \"Remind me to...\" or \"Schedule...\"\n🗂️ **View Schedule** — Ask \"What tasks do I have?\"\n🔔 **Smart Reminders** — I'll notify you before important tasks\n🏛️ **Documents** — Ask about visa, iqama, driving license...\n🌐 **Bilingual** — I speak Arabic AND English!\n\nJust talk to me naturally and I'll handle the rest! ✨"
      : 'أنا درب، سكرتيرك الخاص! 🤖 إليك وش أقدر أسوي:\n\n📅 **مواعيد وتذكيرات** — قول "ذكرني بـ..." أو "عندي..."\n🗂️ **عرض الجدول** — اسأل "وش عندي من مهام؟"\n🔔 **تذكيرات ذكية** — أنبهك قبل المواعيد المهمة\n🏛️ **الوثائق** — اسأل عن الإقامة، الرخصة، الجواز...\n🌐 **ثنائي اللغة** — أتكلم عربي وإنجليزي!\n\nفقط تكلم معاي طبيعي والباقي علي! ✨';
  }

  _categories(lang) {
    return lang === 'en'
      ? "Available categories:\n🛂 Visa | 🆔 Iqama | 🚗 Driver's License\n🚙 Registration | 📘 Passport | 🛡️ Insurance\n🧾 Bill | 💰 Loan | 💳 Installment\n🏠 Rent | 🤝 Meeting | 🏥 Medical\n🎂 Birthday | 💍 Anniversary | ✈️ Travel\n🎉 Occasions & more!"
      : 'التصنيفات المتوفرة:\n🛂 فيزا | 🆔 إقامة | 🚗 رخصة قيادة\n🚙 استمارة | 📘 جواز | 🛡️ تأمين\n🧾 فاتورة | 💰 قرض | 💳 قسط\n🏠 إيجار | 🤝 اجتماع | 🏥 طبي\n🎂 عيد ميلاد | 💍 ذكرى | ✈️ سفر\n🎉 مناسبات | والكثير...';
  }

  _joke(lang) {
    if (lang === 'en') {
      return ["Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why don't scientists trust atoms? Because they make up everything! ⚛️"][Math.floor(Math.random() * 3)];
    }
    return ["مرة واحد سأل التكييف: ليه بتبرد؟ قال: عشان أبرد جوي 😄",
      "مرة واحد دخل على درب وقال: شو تسوي؟ قلت له: أنظم جدولك 😄",
      "وش قال التذكير للموعد؟ قال: توني أذكرك قبل لا تنسى 😄"][Math.floor(Math.random() * 3)];
  }

  _taskListResponse(tasks, lang) {
    if (tasks.length > 0) {
      const upcoming = tasks.filter(t => !t.completed)
        .sort((a, b) => new Date(a.dueDate || '2099') - new Date(b.dueDate || '2099'));
      let response = lang === 'en'
        ? `📋 You have **${upcoming.length}** task${upcoming.length > 1 ? 's' : ''}:\n\n`
        : `📋 عندك **${upcoming.length}** مواعيد:\n\n`;
      upcoming.slice(0, 8).forEach(t => {
        const date = t.dueDate ? new Date(t.dueDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-SA', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
        response += `${nlp.getPriorityIcon(t.priority)} ${t.title}${date ? ` — ${date}` : ''}\n`;
      });
      if (upcoming.length > 8) response += `\n...و ${upcoming.length - 8} مواعيد أخرى`;
      response += lang === 'en'
        ? '\n\nCheck the Tasks page for full details!'
        : '\n\nتقدر تروح لصفحة المواعيد عشان تشوف التفاصيل كاملة.';
      return response;
    }
    return lang === 'en'
      ? "You don't have any tasks yet! 📭\nWant to add one? Just tell me something like:\n\"Remind me about the meeting tomorrow\"\n\"Schedule a dentist appointment\""
      : 'ما عندك أي مواعيد حالياً 📭\n\nودك تضيف موعد؟ قول:\n• "ذكرني بالاجتماع بكره"\n• "عندي موعد دكتور يوم الجمعة"';
  }

  _scheduleQueryResponse(tasks, lang) {
    const today = new Date();
    const todayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.toDateString() === today.toDateString();
    });

    let r = lang === 'en' ? '📅 **Today\'s Schedule**\n\n' : '📅 **جدول اليوم**\n\n';
    if (todayTasks.length === 0) {
      r += lang === 'en'
        ? 'No tasks scheduled for today! Enjoy your day ☀️'
        : 'ما عندك مواعيد اليوم! استمتع بيومك ☀️';
    } else {
      todayTasks.forEach(t => {
        const d = new Date(t.dueDate);
        const time = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
        r += `${nlp.getPriorityIcon(t.priority)} **${time}** — ${t.title}\n`;
      });
    }
    return r;
  }

  _organizeOffer(lang) {
    mem.setContext(null, 'currentTopic', 'organizing');
    if (lang === 'en') {
      return "I hear you! It sounds like you have several things to organize. Let's break it down together 🧠\n\nTell me everything you have in mind — list them all out however you want. Then I'll help you:\n1️⃣ Sort by priority\n2️⃣ Assign dates\n3️⃣ Create tasks for each one\n\nGo ahead, tell me what's on your plate! 📝";
    }
    return 'تمام فهمتك! 🧠 عندك عدة برامج ومحتار كيف ترتبها.\n\nقل لي كل شيء عندك — اكتب كل البرامج اللي في بالك بدون ترتيب. أنا:\n1️⃣ بسمعك كامل (بدون استعجال!)\n2️⃣ بساعدك تصنف كل شيء\n3️⃣ نحدد الأولويات سوا\n4️⃣ ونضيف المواعيد بس لما تقول أنت\n\nابدأ اكتب اللي عندك 👇';
  }

  _taskCreateResponse(msg, lang, userId) {
    const entities = nlp.extractEntities(msg);
    const obj = nlp.extractObject(msg);

    mem.setContext(userId, 'currentTopic', 'task_creation');

    const pending = {
      text: msg,
      hasDate: !!entities.date,
      hasObject: !!obj,
      objectType: obj?.docType || null,
    };
    mem.setPendingTask(userId, pending);

    if (!pending.hasDate && !pending.hasObject) {
      return lang === 'en'
        ? "Sure! I'd love to create a task for you 📅\nJust need a few details:\n\n1️⃣ What's the task about?\n2️⃣ When is it?\n\nOr just tell me naturally like:\n\"Dentist appointment next Tuesday at 3pm\"📝"
        : 'تمام! أبي أضيف موعد لك 📅\nقل لي التفاصيل:\n\n• وش اسم الموعد؟\n• متى؟ (تاريخ ووقت)\n\nأو قول بالعربي مثل:\n"عندي موعد دكتور الثلاثاء الجاي 📝"';
    }

    if (pending.hasDate) {
      const dateStr = entities.date.toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' });
      if (entities.docTypes.length > 0) {
        const docType = entities.docTypes[0];
        mem.addMentionedDoc(userId, docType);
        return lang === 'en'
          ? `Perfect! I see you want to set up a **${docType}** task for **${dateStr}** ✅\n\nShall I go ahead and create this? Just say "yes" or "go ahead"!`
          : `تمام! فهمت انك تبي تتابع **${entities.docTypes.map(d => d).join(' و')}** بتاريخ **${dateStr}** ✅\n\nأمشي في الإضافة؟ قول "تمام" أو "امشي"!`;
      }
      const title = nlp.extractTitle(msg) || msg.substring(0, 30);
      return lang === 'en'
        ? `Got it! I'll create a task for **${title}** on **${dateStr}** 📅\n\nConfirm? Say "yes" to proceed!`
        : `فهمت! بأضيف **${title}** بتاريخ **${dateStr}** 📅\n\nأمشي؟ قول "تمام" أو "اي"`;
    }

    return lang === 'en'
      ? "Tell me when you'd like this task — e.g., \"tomorrow\", \"next week\", or a specific date 🗓️"
      : "قل لي متى تبي الموعد — مثلاً \"بكره\"، \"الأسبوع الجاي\"، أو تاريخ محدد 🗓️";
  }

  _docQuery(msg, lang, userId) {
    const entities = nlp.extractEntities(msg);
    const q = nlp.extractQuestion(msg);

    if (q) {
      if (/مخالفة|مخالفات|غرامة|غرامات|fine|violation/i.test(q.rest || msg)) return this._finesResponse(lang);
      if (/منصة|منصات|روابط|platform|link/i.test(q.rest || msg)) return this._platformsResponse(lang);
      if (/خطوة|خطوات|كيف|طريقة/i.test(q.rest || msg)) return this._stepsFollowUp(lang, userId);
      if (/كم|سعر|قيمة|رسوم|تكلف/i.test(q.rest || msg)) return this._feesFollowUp(lang, userId);
    }

    if (entities.docTypes.length > 0) {
      mem.addMentionedDoc(userId, entities.docTypes[0]);
      return this._docSpecificQuery(msg, lang, entities.docTypes[0], userId);
    }

    if (/مخالفة|مخالفات|غرامة|غرامات/i.test(msg)) return this._finesResponse(lang);
    if (/منصة|منصات|روابط|platform|link/i.test(msg)) return this._platformsResponse(lang);

    return this._docGeneralResponse(lang);
  }

  _docSpecificQuery(msg, lang, docType, userId) {
    const govService = require('./governmentService');
    const rules = govService.getDocumentRules(docType);
    if (!rules) return this._docGeneralResponse(lang);

    const q = nlp.extractQuestion(msg);
    if (!q || q.type === 'what' || q.type === 'how') {
      if (lang === 'en') {
        return `${rules.icon} **${rules.labelEn}**\n\n📅 Renewal: ${rules.renewalPeriodDays} days\n💰 Fee: ${rules.feesEn}\n${rules.fineDescriptionEn ? `⚠️ ${rules.fineDescriptionEn}\n` : ''}\n\n✅ **Steps:**\n${rules.stepsEn.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📋 **Required:**\n${rules.requiredDocumentsEn.map(d => `• ${d}`).join('\n')}\n\n🔗 ${rules.platform.nameEn}: ${rules.platform.url}\n\n💡 _${rules.tipsEn[0] || ''}_\n\n📋 Need me to add a renewal reminder?`;
      }
      return `${rules.icon} **${rules.labelAr}**\n\n📅 مدة التجديد: ${rules.renewalPeriodDays} يوم\n💰 الرسوم: ${rules.feesAr}\n${rules.fineDescriptionAr ? `⚠️ ${rules.fineDescriptionAr}\n` : ''}\n\n✅ **الخطوات:**\n${rules.stepsAr.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📋 **المستندات المطلوبة:**\n${rules.requiredDocumentsAr.map(d => `• ${d}`).join('\n')}\n\n🔗 ${rules.platform.nameAr}: ${rules.platform.url}\n\n💡 _${rules.tipsAr[0] || ''}_\n\n📋 تبي أضيف تذكير تجديد؟`;
    }

    if (q.type === 'quantity') {
      return lang === 'en'
        ? `💰 **${rules.labelEn} Fees:** ${rules.feesEn}\n${rules.fines.length > 0 ? `⚠️ Late fines: ${rules.fines.map(f => `${f.reasonEn}: ${f.amount} SAR`).join(', ')}` : ''}`
        : `💰 **رسوم ${rules.labelAr}:** ${rules.feesAr}\n${rules.fines.length > 0 ? `⚠️ غرامات التأخير: ${rules.fines.map(f => `${f.reasonAr}: ${f.amount} ﷼`).join('، ')}` : ''}`;
    }

    return null;
  }

  _finesResponse(lang) {
    const govService = require('./governmentService');
    const violations = govService.getTrafficViolations();
    if (lang === 'en') {
      let r = '⚠️ **Traffic Violations in Saudi Arabia:**\n';
      violations.commonFines.forEach(f => { r += `• ${f.reasonEn}: ${f.amount} SAR\n`; });
      r += '\n🔍 Check & pay via Absher → Traffic Services → violations';
      return r;
    }
    let r = '⚠️ **المخالفات المرورية في المملكة:**\n';
    violations.commonFines.forEach(f => { r += `• ${f.reasonAr}: ${f.amount} ﷼\n`; });
    r += '\n🔍 استعلام وسداد عبر أبشر → خدمات المرور → المخالفات';
    return r;
  }

  _platformsResponse(lang) {
    const govService = require('./governmentService');
    const platforms = govService.getAllPlatforms();
    if (lang === 'en') {
      let r = '🔗 **Official Platforms in Saudi Arabia:**\n';
      platforms.forEach(p => { r += `\n${p.nameEn}\n${p.url}\n${p.descEn}\n`; });
      return r;
    }
    let r = '🔗 **المنصات الرسمية في المملكة:**\n';
    platforms.forEach(p => { r += `\n🏛️ **${p.nameAr}**\n${p.url}\n${p.descAr}\n`; });
    return r;
  }

  _feesFollowUp(lang, userId) {
    const docs = mem.getMentionedDocs(userId);
    if (docs.length === 0) {
      return lang === 'en'
        ? "Which document are you asking about? (e.g., iqama, driving license, passport...)"
        : "أي وثيقة تقصد؟ (مثلاً: الإقامة، رخصة القيادة، جواز السفر...)";
    }
    return this._docSpecificQuery(`كم رسوم ${docs[docs.length - 1]}`, lang, docs[docs.length - 1], userId);
  }

  _stepsFollowUp(lang, userId) {
    const docs = mem.getMentionedDocs(userId);
    if (docs.length === 0) {
      return lang === 'en'
        ? "Which document are you asking about? (e.g., iqama, driving license, passport...)"
        : "أي وثيقة تقصد؟ (مثلاً: الإقامة، رخصة القيادة، جواز السفر...)";
    }
    return this._docSpecificQuery(`كيف اجدد ${docs[docs.length - 1]}`, lang, docs[docs.length - 1], userId);
  }

  _docFollowUpGeneral(lang, userId) {
    const docs = mem.getMentionedDocs(userId);
    if (docs.length > 0) {
      const docNames = docs.map(d => {
        const names = { iqama: 'الإقامة', driving_license: 'رخصة القيادة', passport: 'جواز السفر', car_registration: 'استمارة السيارة', insurance: 'التأمين', tenancy: 'الإيجار' };
        return names[d] || d;
      }).join(', ');
      return lang === 'en'
        ? `You were asking about: **${docNames}** 🏛️\n\nWhat would you like to know?\n• Fees 💰\n• Renewal steps ✅\n• Required documents 📋\n• Late fines ⚠️`
        : `كنت تسأل عن: **${docNames}** 🏛️\n\nوش تبي تعرف بالضبط؟\n• الرسوم 💰\n• خطوات التجديد ✅\n• الأوراق المطلوبة 📋\n• غرامات التأخير ⚠️`;
    }
    return this._docGeneralResponse(lang);
  }

  _docGeneralResponse(lang) {
    if (lang === 'en') {
      return "🏛️ **Government Documents I can help with:**\n\n🆔 **Iqama** — Residence permit renewal\n🚗 **Driving License** — Renewal steps\n🚙 **Car Registration** — Istimara renewal\n📘 **Passport** — Renewal info\n🛡️ **Insurance** — Tameeni info\n\nJust ask like:\n\"How to renew my iqama?\"\n\"What are the traffic fines?\"\n\"Show me official platforms\"";
    }
    return "🏛️ **الوثائق الحكومية اللي أقدر أساعدك فيها:**\n\n🆔 **الإقامة** — تجديد الإقامة\n🚗 **رخصة القيادة** — خطوات التجديد\n🚙 **استمارة السيارة** — تجديد الاستمارة\n📘 **جواز السفر** — معلومات التجديد\n🛡️ **التأمين** — معلومات تأميني\n\nفقط اسأل:\n\"كيف أجدد الإقامة؟\"\n\"كم غرامة المخالفات؟\"\n\"أظهر المنصات الرسمية\"";
  }

  _generalResponse(lang) {
    const q = nlp.extractQuestion(lang === 'en' ? '' : '');
    const responses = lang === 'en' ? [
      "Hmm, I'm not quite sure what you mean! Could you rephrase that? 😊 I can help with tasks, documents, and scheduling.",
      "I want to help! Can you tell me more? Like schedule a task, check a document, or ask about something specific?",
      "Sorry, I didn't catch that! Try asking me something like:\n📅 \"Schedule a meeting\"\n🏛️ \"Iqama renewal steps\"\n🗂️ \"Show my tasks\"",
      "I'm here to assist! Just tell me what you need in plain Arabic or English. I handle tasks, documents, questions, and more!"
    ][Math.floor(Math.random() * 4)] : [
      "وش تقصد بالضبط يا سيدي؟ 😊 وضح لي أكثر عشان أساعدك.\nأقدر أساعدك في:\n📅 إضافة مواعيد\n🏛️ استفسارات حكومية\n🗂️ عرض جدولك",
      "ما فهمت طلبك يا سيدي! 🧐 عيد صياغته أو وضح أكثر.\nمثلاً:\n• \"وش خطوات تجديد الإقامة؟\"\n• \"عندي موعد بكره\"\n• \"كم غرامة المخالفات؟\"",
      "آسف ما استوعبت يا سيدي! 😅 قلي وش تبي بالضبط.\nأنا معك عشان:\n📅 أضيف مهام\n🏛️ أجاوب على أسئلة حكومية\n🗂️ أنظم جدولك",
      "أنا درب مساعدك الشخصي يا سيدي 👋\nتقدر تسألني عن:\n📅 جدولك ومهامك\n🏛️ الوثائق الحكومية\n⚠️ المخالفات والغرامات\n🔗 المنصات الرسمية\n\nوش تبي؟",
      "مستعد أساعدك يا سيدي! 💪\nقل لي وش تبي تسوي:\n• تبي تذكرني بشيء؟\n• تبي تعرف خطوات تجديد وثيقة؟\n• تبي تشوف جدولك؟"
    ][Math.floor(Math.random() * 5)];
    return responses;
  }

  async generateEmailReply(data) {
    const prompt = `Generate a professional email reply:\nFrom: ${data.fromName || data.from}\nSubject: ${data.subject}\nBody: ${(data.body || '').substring(0, 500)}\nReply from: ${data.userName}\n${data.isBusiness ? 'Formal' : 'Friendly'} tone.`;
    const r = await this.generateCompletion(prompt);
    return r || 'شكراً لرسالتك. تم استلامها وسيتم الرد قريباً. Thank you for your message. It has been received and will be replied to shortly.';
  }

  async generateTelegramReply(data) {
    const r = await this.generateCompletion(`Reply to Telegram from ${data.from}: "${data.text}". Name: ${data.userName}. Concise and friendly.`);
    return r || 'شكراً لرسالتك. سأرد عليك قريباً.';
  }

  async generateWhatsAppReply(data) {
    const r = await this.generateCompletion(`Reply to WhatsApp from ${data.from}: "${data.text}". Name: ${data.userName}. Concise and friendly.`);
    return r || 'شكراً لرسالتك. سأرد عليك قريباً.';
  }

  async organizeTasks(tasks) {
    const r = await this.generateCompletion(`Organize these tasks by priority:\n${tasks.map((t, i) => `${i + 1}. ${t.title}${t.dueDate ? ` (Due: ${t.dueDate})` : ''}`).join('\n')}\n\nGroup: urgent, high, medium, low.`, 800);
    if (r) return r;

    const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...tasks].sort((a, b) => {
      const pa = priorityWeight[a.priority] ?? 3;
      const pb = priorityWeight[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      return (new Date(a.dueDate || '2099')) - (new Date(b.dueDate || '2099'));
    });

    let result = '📋 **تنظيم المهام حسب الأولوية:**\n\n';
    const groups = { urgent: [], high: [], medium: [], low: [] };
    sorted.forEach(t => { (groups[t.priority] || groups.low).push(t); });
    for (const [level, label] of [['urgent', '⛔ عاجل'], ['high', '🔴 عالية'], ['medium', '🟡 متوسطة'], ['low', '🟢 منخفضة']]) {
      if (groups[level].length > 0) {
        result += `**${label}:**\n${groups[level].map(t => `  • ${t.title}${t.dueDate ? ` (${new Date(t.dueDate).toLocaleDateString('ar-SA')})` : ''}`).join('\n')}\n\n`;
      }
    }
    return result;
  }
}

module.exports = new AIService();
