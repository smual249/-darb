const cron = require('node-cron');
const taskService = require('./taskService');

class NotificationService {
  constructor() {
    this.jobs = [];
    this.userIntensity = {};
    this.lastUserActivity = {};
  }

  start() {
    this.jobs.push(cron.schedule('* * * * *', async () => { await this.checkReminders(); }));
    this.jobs.push(cron.schedule('*/5 * * * *', async () => { await this.checkPendingApprovals(); }));
    this.jobs.push(cron.schedule('*/2 * * * *', async () => { await this.escalateNagging(); }));
    console.log('Notification service started');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('Notification service stopped');
  }

  recordUserActivity(userId) {
    this.lastUserActivity[userId] = Date.now();
    this.userIntensity[userId] = 0;
  }

  getIntensity(userId) {
    return this.userIntensity[userId] || 0;
  }

  async escalateNagging() {
    try {
      const Task = require('../models/Task');
      const tasks = await Task.find({ status: { $ne: 'completed' }, dueDate: { $lte: new Date() } });
      const userTaskMap = {};
      for (const task of tasks) {
        const uid = task.userId ? task.userId.toString() : null;
        if (!uid) continue;
        if (!userTaskMap[uid]) userTaskMap[uid] = [];
        userTaskMap[uid].push(task);
      }

      for (const [userId, userTasks] of Object.entries(userTaskMap)) {
        if (this.lastUserActivity[userId] && (Date.now() - this.lastUserActivity[userId]) < 60000) continue;
        const currentIntensity = this.userIntensity[userId] || 0;
        const newIntensity = Math.min(currentIntensity + 1, 3);
        this.userIntensity[userId] = newIntensity;

        const io = require('../index').getIO();
        if (io) {
          io.to(userId.toString()).emit('nag', {
            tasks: userTasks.map(t => ({
              _id: t._id, title: t.title, priority: t.priority,
              dueDate: t.dueDate, overdueDays: Math.ceil((Date.now() - new Date(t.dueDate)) / 86400000),
            })),
            intensity: newIntensity,
            messageAr: this.getNagMessage(newIntensity),
          });
        }
      }
    } catch (error) {
      console.error('Error escalating nagging:', error.message);
    }
  }

  getNagMessage(intensity) {
    switch (intensity) {
      case 0: return '🔔 عندك مواعيد مستحقة!';
      case 1: return '🔔🔔 تذكير: في مواعيد متأخرة!';
      case 2: return '🔴🔴🔴 يا حبيبي المواعيد متأخرة! تعال شيك!';
      case 3: return '🚨🚨🚨🚨 قم الله يسامحك! المواعيد تأخرت! ادخل التطبيق الحين!';
      default: return '🔔 عندك مواعيد!';
    }
  }

  async checkReminders() {
    try {
      const tasks = await taskService.getDueReminders();
      for (const task of tasks) {
        const user = task.userId;
        if (!user || !user._id) continue;

        for (const reminder of task.reminders) {
          if (reminder.sent) continue;
          if (new Date(reminder.time) > new Date()) continue;

          const timeLeft = task.dueDate ? this.formatTimeLeft(task.dueDate) : 'No specific deadline';
          const message = `🔔 <b>Reminder: ${task.title}</b>\n\n${task.description ? task.description + '\n\n' : ''}⏰ Time remaining: ${timeLeft}\n📅 Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'Not set'}\n🏷 Priority: ${task.priority}`;

          const io = require('../index').getIO();
          if (io) {
            io.to(user._id.toString()).emit('reminder', {
              title: task.title, message, taskId: task._id, timeLeft,
            });
          }

          await taskService.markReminderSent(task._id, reminder.time);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error.message);
    }
  }

  async checkPendingApprovals() {
    try {
      const Email = require('../models/Email');
      const Message = require('../models/Message');
      const User = require('../models/User');

      const pendingEmails = await Email.find({ replyPending: true, replyApproved: false });
      for (const email of pendingEmails.slice(0, 20)) {
        const user = await User.findById(email.userId);
        if (!user) continue;

        const io = require('../index').getIO();
        if (io) {
          io.to(user._id.toString()).emit('approval_request', {
            type: 'email', id: email._id, from: email.from,
            subject: email.subject, aiReply: email.aiGeneratedReply, receivedAt: email.receivedAt,
          });
        }
      }

      const pendingMessages = await Message.find({ replyPending: true, replyApproved: false });
      for (const msg of pendingMessages.slice(0, 20)) {
        const user = await User.findById(msg.userId);
        if (!user) continue;

        const io = require('../index').getIO();
        if (io) {
          io.to(user._id.toString()).emit('approval_request', {
            type: msg.platform, id: msg._id, from: msg.fromName || msg.from,
            text: msg.text, aiReply: msg.aiGeneratedReply, platform: msg.platform,
          });
        }
      }
    } catch (error) {
      console.error('Error checking pending approvals:', error.message);
    }
  }

  formatTimeLeft(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    if (diff <= 0) return 'Overdue!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  }
}

module.exports = new NotificationService();
