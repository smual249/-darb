const { Model } = require('../database/db');

const model = new Model('messages');

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

module.exports = { create, find, findOne, model };
