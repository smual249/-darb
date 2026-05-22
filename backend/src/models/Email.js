const { Model } = require('../database/db');

const model = new Model('emails');

async function create(data) {
  const doc = { ...data, createdAt: new Date() };
  return model.create(doc);
}

async function find(query) {
  return model.find(query);
}

async function findOne(query) {
  return model.findOne(query);
}

async function findOneAndUpdate(query, updates, options) {
  return model.findOneAndUpdate(query, updates, options);
}

module.exports = { create, find, findOne, findOneAndUpdate, model };
