const { Model } = require('../database/db');

const model = new Model('documents');

const DOC_TYPES = ['iqama', 'driving_license', 'passport', 'car_registration', 'insurance', 'tenancy', 'visa', 'national_id', 'birth_certificate', 'marriage_certificate', 'professional_license', 'commercial_register', 'other'];

async function create(data) {
  const doc = {
    ...data,
    docType: data.docType || 'other',
    status: data.status || 'active',
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    issueDate: data.issueDate ? new Date(data.issueDate) : null,
    renewedDate: null,
    remindersEnabled: data.remindersEnabled !== false,
    autoCheck: data.autoCheck !== false,
    violations: data.violations || [],
    renewalSteps: [],
    notes: data.notes || '',
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

async function findById(id) {
  return model.findOne({ _id: id });
}

async function findByIdAndUpdate(id, updates) {
  return model.findByIdAndUpdate(id, updates);
}

async function findOneAndUpdate(query, updates) {
  return model.findOneAndUpdate(query, updates);
}

async function updateOne(query, update) {
  return model.updateOne(query, update);
}

async function deleteOne(query) {
  return model.deleteOne(query);
}

async function count(query) {
  return model.count(query);
}

async function getExpiringSoon(days = 60) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  const docs = await model.find({ status: 'active' });
  return docs.filter(d => d.expiryDate && d.expiryDate >= now && d.expiryDate <= future);
}

async function getOverdue() {
  const docs = await model.find({ status: 'active' });
  return docs.filter(d => d.expiryDate && d.expiryDate < new Date());
}

async function getByType(docType) {
  return model.find({ docType });
}

module.exports = {
  create, find, findOne, findById, findByIdAndUpdate, findOneAndUpdate,
  updateOne, deleteOne, count, getExpiringSoon, getOverdue, getByType,
  DOC_TYPES,
};
