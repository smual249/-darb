const express = require('express');
const auth = require('../middleware/auth');
const taskService = require('../services/taskService');
const Task = require('../models/Task');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await taskService.getTasks(req.userId, req.query);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, reminderInterval, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await taskService.createTask(req.userId, {
      title, description, category, priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      reminderInterval, tags,
    });

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.userId, req.body);
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await taskService.completeTask(req.params.id, req.userId);
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/dismiss-reminder', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { autoReminders: false },
    );
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/organize', auth, async (req, res) => {
  try {
    const { taskIds } = req.body;
    if (!taskIds || !taskIds.length) {
      return res.status(400).json({ error: 'Task IDs are required' });
    }

    const result = await taskService.organizeTasksWithAI(req.userId, taskIds);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
