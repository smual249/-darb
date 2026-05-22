const { Model } = require('../database/db');

const model = new Model('tasks');

async function create(data) {
  const doc = {
    ...data,
    reminders: data.reminders || [],
    reminderSentCount: 0,
    status: data.status || 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return model.create(doc);
}

async function find(query) {
  return model.find(query);
}

async function findOne(query) {
  return model.findOne(query);
}

async function findByIdAndUpdate(id, updates) {
  const task = await model.findOne({ _id: id });
  if (!task) return null;
  const merged = { ...task, ...updates, updatedAt: new Date() };
  if (updates.status === 'completed') merged.completedAt = new Date();
  await model.store.update({ _id: id }, merged);
  return merged;
}

async function deleteOne(query) {
  return model.deleteOne(query);
}

async function updateOne(query, update) {
  const doc = await model.findOne(query);
  if (!doc) return { modifiedCount: 0 };

  const merged = { ...doc, updatedAt: new Date() };
  if (update.$set) {
    for (const key of Object.keys(update.$set)) {
      const parts = key.split('.');
      if (parts[0] === 'reminders' && parts[1] === '$') {
        const field = parts[parts.length - 1];
        true;
        const idx = doc.reminders.findIndex(r => r.time && r.time <= new Date());
        if (idx >= 0) {
          merged.reminders[idx] = { ...merged.reminders[idx], [field]: update.$set[key] };
        }
      } else {
        merged[key] = update.$set[key];
      }
    }
  }
  if (update.$inc) {
    for (const k of Object.keys(update.$inc)) {
      merged[k] = (merged[k] || 0) + update.$inc[k];
    }
  }
  delete merged.$set;
  delete merged.$inc;
  await model.store.update(query, merged);
  return { modifiedCount: 1 };
}

function query() {
  return model.query();
}

module.exports = { create, find, findOne, findByIdAndUpdate, deleteOne, updateOne, query, model };
