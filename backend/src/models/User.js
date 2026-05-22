const bcrypt = require('bcryptjs');
const { Model } = require('../database/db');

const model = new Model('users');

async function createUser(data) {
  const doc = {
    name: data.name,
    email: (data.email || '').toLowerCase(),
    password: await bcrypt.hash(data.password, 12),
    phone: data.phone || '',
    avatar: data.avatar || '',
    emailSettings: {
      connected: false, gmailUser: '', gmailAppPassword: '', autoReply: false, replyOnlyBusiness: true, requireApproval: true,
    },
    telegramSettings: {
      connected: false, botToken: '', chatId: '', autoReply: false, replyOnlyUnknown: true, requireApproval: true,
    },
    whatsappSettings: {
      connected: false, phoneNumber: '', autoReply: false, replyOnlyBusiness: true, requireApproval: true,
    },
    notificationSettings: { email: true, push: true, reminderInterval: 15, maxReminders: 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const inserted = await model.create(doc);
  return sanitize(inserted);
}

async function findByEmail(email) {
  const user = await model.findOne({ email: (email || '').toLowerCase() });
  return user || null;
}

async function findById(id) {
  const user = await model.findById(id);
  return user || null;
}

async function findOne(query) {
  const user = await model.findOne(query);
  return user || null;
}

async function findByIdAndUpdate(id, updates, options) {
  const user = await model.findByIdAndUpdate(id, updates, options);
  return user ? sanitize(user) : null;
}

async function comparePassword(user, candidatePassword) {
  return bcrypt.compare(candidatePassword, user.password);
}

function sanitize(user) {
  if (!user) return null;
  const obj = { ...user };
  delete obj.password;
  if (obj.emailSettings) delete obj.emailSettings.gmailAppPassword;
  return obj;
}

module.exports = {
  createUser, findByEmail, findById, findByIdAndUpdate, findOne, comparePassword, sanitize, model,
};
