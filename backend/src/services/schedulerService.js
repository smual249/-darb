class SchedulerService {
  suggestTaskTime(task, existingTasks = [], userPrefs = {}) {
    const urgency = task.priority === 'urgent' ? 0 : task.priority === 'high' ? 1 : 2;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = task.dueDate ? new Date(task.dueDate) : null;

    const workStart = userPrefs.workStart || 8;
    const workEnd = userPrefs.workEnd || 18;
    const preferMorning = userPrefs.morningPerson !== false;

    const slots = [
      { label: 'الصباح الباكر', labelEn: 'Early Morning', start: 6, end: 8 },
      { label: 'الصباح', labelEn: 'Morning', start: workStart, end: Math.min(workStart + 4, 14) },
      { label: 'الظهر', labelEn: 'Noon', start: 12, end: 15 },
      { label: 'العصر', labelEn: 'Afternoon', start: 15, end: 18 },
      { label: 'المساء', labelEn: 'Evening', start: 18, end: Math.min(workEnd + 2, 22) },
      { label: 'الليل', labelEn: 'Night', start: 21, end: 23 },
    ];

    if (!taskDate) {
      const preferred = urgency === 0 ? slots[1] : urgency === 1 ? (preferMorning ? slots[1] : slots[2]) : slots[3];
      return {
        date: today,
        timeSlot: preferred,
        suggestion: `اليوم في ${preferred.label}`,
        detail: `من ${preferred.start}:00 إلى ${preferred.end}:00`,
      };
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = taskDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;
    const isToday = taskDate.getTime() === today.getTime();
    const isTomorrow = taskDate.getTime() === tomorrow.getTime();

    if (isToday || urgency === 0) {
      const nowHour = now.getHours();
      const available = slots.filter(s => s.start > nowHour && s.end > nowHour && !(isFriday && s.start >= 12 && s.start < 14));
      const best = available.length > 0 ? available[0] : (isFriday ? slots[3] : slots[slots.length - 1]);
      return {
        date: taskDate,
        timeSlot: best,
        suggestion: `اليوم الساعة ${best.start}:00`,
        detail: `من ${best.start}:00 إلى ${best.end}:00`,
      };
    }

    if (isTomorrow) {
      const best = urgency === 0 ? slots[1] : urgency === 1 ? (preferMorning ? slots[1] : slots[2]) : slots[2];
      return {
        date: taskDate,
        timeSlot: best,
        suggestion: `بكرة الساعة ${best.start}:00`,
        detail: `من ${best.start}:00 إلى ${best.end}:00`,
      };
    }

    let best;
    if (urgency === 0) best = isFriday ? slots[3] : slots[1];
    else if (urgency === 1) best = isFriday ? slots[4] : (preferMorning ? slots[1] : slots[2]);
    else best = isFriday ? slots[4] : slots[3];

    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return {
      date: taskDate,
      timeSlot: best,
      suggestion: `${taskDate.toLocaleDateString('ar-SA')} الساعة ${best.start}:00`,
      detail: `يوم ${dayNames[dayOfWeek]} من ${best.start}:00 إلى ${best.end}:00`,
    };
  }

  reorderByPriority(tasks) {
    const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => {
      const pa = priorityWeight[a.priority] ?? 3;
      const pb = priorityWeight[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const da = a.dueDate ? new Date(a.dueDate) : new Date(864e13);
      const db = b.dueDate ? new Date(b.dueDate) : new Date(864e13);
      return da - db;
    });
  }

  async generateDailyPlan(tasks, documents = []) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 };
    const overdue = [];
    const todayTasks = [];
    const upcoming = [];
    const urgentMatters = [];

    for (const task of tasks) {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (dueDate && dueDate < todayStart) {
        overdue.push(task);
      } else if (dueDate && dueDate >= todayStart && dueDate < todayEnd) {
        todayTasks.push(task);
      } else {
        upcoming.push(task);
      }
    }

    for (const doc of documents) {
      const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
      if (expiryDate) {
        const diff = expiryDate - today;
        const days = Math.ceil(diff / 86400000);
        if (days < 30) {
          urgentMatters.push({
            type: 'document',
            docType: doc.docType,
            labelAr: doc.labelAr || doc.docType,
            expiryDate,
            remainingDays: days,
            severity: days < 7 ? 'critical' : 'warning',
          });
        }
      }
    }

    const all = [...tasks].sort((a, b) => {
      const pa = priorityWeight[a.priority] ?? 3;
      const pb = priorityWeight[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const da = a.dueDate ? new Date(a.dueDate) : new Date(864e13);
      const db = b.dueDate ? new Date(b.dueDate) : new Date(864e13);
      return da - db;
    });

    const suggestions = all.slice(0, 5).map(t => this.suggestTaskTime(t));

    return {
      today: today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      summary: {
        total: tasks.length,
        overdue: overdue.length,
        today: todayTasks.length,
        urgentDocs: urgentMatters.length,
      },
      overdue,
      todayTasks: todayTasks.map(t => ({ ...t, timeSuggestion: this.suggestTaskTime(t) })),
      urgentDocuments: urgentMatters,
      topPriorities: all.slice(0, 8).map(t => ({
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate,
        category: t.category,
        timeSuggestion: this.suggestTaskTime(t),
      })),
      suggestions,
    };
  }

  suggestDailyCheckinTime(userPreferences = {}) {
    const time = userPreferences.preferredCheckin || '08:00';
    const h = parseInt(time.split(':')[0]);
    const period = h < 12 ? 'صباحاً' : 'مساءً';
    return {
      preferredTime: time,
      messageAr: `${period === 'صباحاً' ? 'صباح الخير ☀️' : 'مساء الخير 🌙'}\nكيف يومك اليوم؟ خلينا نرتب جدولك سوا`,
      messageEn: `Good ${period === 'صباحاً' ? 'morning' : 'evening'} ☀️\nHow's your day? Let's organize your schedule together`,
    };
  }

  getNextNagTime(lastInteraction, taskPriority) {
    const intervals = { urgent: 15, high: 60, medium: 180, low: 480 };
    const baseMinutes = intervals[taskPriority] || intervals.medium;
    if (!lastInteraction) return new Date(Date.now() + baseMinutes * 60000);
    const elapsed = (Date.now() - new Date(lastInteraction).getTime()) / 60000;
    const wait = Math.max(baseMinutes, Math.ceil(elapsed * 2));
    return new Date(Date.now() + Math.min(wait, 1440) * 60000);
  }
}

module.exports = new SchedulerService();
