class ConversationMemory {
  constructor() {
    this.conversations = new Map();
    this.MAX_HISTORY = 50;
    this.MAX_CONTEXT_AGE = 30;
  }

  _ensure(userId) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        history: [],
        context: {
          currentTopic: null,
          lastTopic: null,
          mentionedDocs: [],
          pendingTask: null,
          followUpCount: 0,
          lastIntent: null,
          lastEntities: [],
          userPrefs: { lang: 'ar', timeFormat: '24h', nagEnabled: true },
          lastInteraction: new Date(),
        },
      });
    }
    return this.conversations.get(userId);
  }

  addMessage(userId, role, text) {
    const session = this._ensure(userId);
    session.history.push({ role, text, timestamp: new Date() });
    session.context.lastInteraction = new Date();
    if (session.history.length > this.MAX_HISTORY) {
      session.history = session.history.slice(-this.MAX_HISTORY);
    }
  }

  getHistory(userId, limit = 10) {
    const session = this._ensure(userId);
    return session.history.slice(-limit);
  }

  getRecentMessages(userId, count = 5) {
    const session = this._ensure(userId);
    return session.history.slice(-count).map(h => h.text);
  }

  setContext(userId, key, value) {
    const session = this._ensure(userId);
    if (key === 'currentTopic' && value) {
      session.context.lastTopic = session.context.currentTopic;
    }
    session.context[key] = value;
  }

  getContext(userId) {
    return this._ensure(userId).context;
  }

  isFollowUp(text) {
    const followUpPatterns = [
      /^(و|ف)?(شو|وش|ماذا|كيف|ليه|ليش|متى|وين|من|كم|هل|هَل)\s*(عنه|عنها|عنك|عني|بها|به|فيها|فيه|لها|له)?/i,
      /^(و|ف)?(هذا|هذه|ذا|ذي|ذلك|تلك|ها)\s/,
      /^(و|ف)?(زيدني|عطني|أعطني|اعطني|قل لي|قلي|احكي|حك لي)\s/,
      /^(تمام|طيب|ok|yes|no|اي|لا|نعم|آه|اها)\s*.{0,30}$/i,
      /^(شرح|فسر|وضح|افهمني|فهمني|ايه|وشو|يعني)\s/i,
      /^(كم|قد|قدر|سعر|ثمن|قيمة)\s/,
    ];
    return followUpPatterns.some(p => p.test(text.trim()));
  }

  isConfirmation(text) {
    const yes = /^(اي|نعم|آه|اها|طيب|تمام|ok|yes|yeah|sure|go ahead|امشي|تم|خلاص|صحيح|هذا اللي ابغاه|هذا اللي ابيها)/i;
    const no = /^(لا|لا مو|no|nah|nope|مش|مو|غلط|لا مو|لا هذا)/i;
    if (yes.test(text.trim())) return 'yes';
    if (no.test(text.trim())) return 'no';
    return null;
  }

  getPendingTask(userId) {
    return this._ensure(userId).context.pendingTask;
  }

  setPendingTask(userId, task) {
    this._ensure(userId).context.pendingTask = task;
  }

  clearPendingTask(userId) {
    this._ensure(userId).context.pendingTask = null;
  }

  getLastTopic(userId) {
    const ctx = this._ensure(userId).context;
    return ctx.currentTopic || ctx.lastTopic;
  }

  getMentionedDocs(userId) {
    return this._ensure(userId).context.mentionedDocs;
  }

  addMentionedDoc(userId, docType) {
    const session = this._ensure(userId);
    if (!session.context.mentionedDocs.includes(docType)) {
      session.context.mentionedDocs.push(docType);
      if (session.context.mentionedDocs.length > 10) {
        session.context.mentionedDocs.shift();
      }
    }
  }

  setUserPref(userId, key, value) {
    this._ensure(userId).context.userPrefs[key] = value;
  }

  getUserPref(userId, key) {
    return this._ensure(userId).context.userPrefs[key];
  }

  clearContext(userId) {
    const session = this._ensure(userId);
    session.context = {
      currentTopic: null,
      lastTopic: null,
      mentionedDocs: [],
      pendingTask: null,
      followUpCount: 0,
      lastIntent: null,
      lastEntities: [],
      userPrefs: session.context?.userPrefs || { lang: 'ar', timeFormat: '24h', nagEnabled: true },
      lastInteraction: new Date(),
    };
  }

  getRelevantHistory(userId, currentMsg, maxMessages = 6) {
    const session = this._ensure(userId);
    const history = session.history.slice(-maxMessages);

    if (this.isFollowUp(currentMsg) && session.context.currentTopic) {
      return history;
    }

    if (history.length > 0 && this._isNewTopic(currentMsg, session.context)) {
      return [];
    }

    return history;
  }

  _isNewTopic(msg, context) {
    const topicPatterns = [
      /^(عندي|ودي|ابي|أبي|أريد|لدي|ذكرني|حضر|جهز|أضف|ضيف|خلينا نتكلم|خليني اسأل|عندي سؤال|سؤال)/i,
      /^(مرحبا|هلا|اهلين|السلام|صباح|مساء|يا هلا)/i,
    ];
    if (topicPatterns.some(p => p.test(msg.trim()))) return true;

    if (context.followUpCount >= 3) return true;

    return false;
  }

  incrementFollowUp(userId) {
    const session = this._ensure(userId);
    session.context.followUpCount = (session.context.followUpCount || 0) + 1;
  }

  resetFollowUp(userId) {
    this._ensure(userId).context.followUpCount = 0;
  }

  getSummary(userId) {
    const ctx = this._ensure(userId).context;
    return {
      totalMessages: ctx.history?.length || 0,
      currentTopic: ctx.currentTopic,
      lastTopic: ctx.lastTopic,
      followUpCount: ctx.followUpCount,
      mentionedDocs: ctx.mentionedDocs,
      pendingTask: !!ctx.pendingTask,
    };
  }
}

module.exports = new ConversationMemory();
