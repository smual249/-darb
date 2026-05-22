const Task = require('../models/Task');

class TaskService {
  async createTask(userId, data) {
    const reminders = [];
    if (data.dueDate && data.autoReminders !== false) {
      const dueDate = new Date(data.dueDate);
      const interval = data.reminderInterval || 15;
      const reminderCount = Math.min(data.maxReminders || 3, 10);
      for (let i = 1; i <= reminderCount; i++) {
        const reminderTime = new Date(dueDate.getTime() - i * interval * 60 * 1000);
        if (reminderTime > new Date()) {
          reminders.push({ time: reminderTime, sent: false, type: 'both' });
        }
      }
    }

    return Task.create({ userId, ...data, reminders });
  }

  async getTasks(userId, filters = {}) {
    const query = { userId };
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;

    const sortField = filters.sortBy || 'dueDate';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const limit = parseInt(filters.limit) || 50;

    const qb = Task.query().find(query).sort({ [sortField]: sortOrder, createdAt: -1 });
    return qb._exec ? qb._exec() : qb;
  }

  async updateTask(taskId, userId, updates) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new Error('Task not found');

    if (updates.dueDate && updates.dueDate !== (task.dueDate ? task.dueDate.toISOString?.() || task.dueDate : undefined)) {
      updates.reminders = [];
      const dueDate = new Date(updates.dueDate);
      const interval = updates.reminderInterval || task.reminderInterval || 15;
      const reminderCount = Math.min(updates.maxReminders || task.maxReminders || 3, 10);
      for (let i = 1; i <= reminderCount; i++) {
        const reminderTime = new Date(dueDate.getTime() - i * interval * 60 * 1000);
        if (reminderTime > new Date()) {
          updates.reminders.push({ time: reminderTime, sent: false, type: 'both' });
        }
      }
    }

    return Task.findByIdAndUpdate(taskId, updates);
  }

  async deleteTask(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new Error('Task not found');
    return Task.deleteOne({ _id: taskId, userId });
  }

  async completeTask(taskId, userId) {
    return this.updateTask(taskId, userId, { status: 'completed', completedAt: new Date() });
  }

  async getDueReminders() {
    const now = new Date();
    const tasks = await Task.find({
      status: { $ne: 'completed' },
      'reminders.sent': false,
      'reminders.time': { $lte: now },
      autoReminders: true,
    });

    for (const task of tasks) {
      const user = await (require('../models/User')).model.store.findOne({ _id: task.userId });
      task.userId = user || task.userId;
    }

    return tasks;
  }

  async markReminderSent(taskId, reminderTime) {
    return Task.updateOne(
      { _id: taskId, 'reminders.time': reminderTime },
      { $set: { 'reminders.$.sent': true }, $inc: { reminderSentCount: 1 } }
    );
  }

  async organizeTasksWithAI(userId, taskIds) {
    const tasks = await Task.find({ _id: { $in: taskIds }, userId });
    const { aiService } = require('./aiService');
    return aiService.organizeTasks(tasks);
  }
}

module.exports = new TaskService();
