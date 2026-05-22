const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

class Model {
  constructor(name) {
    this.store = Datastore.create({ filename: path.join(dataDir, `${name}.db`), autoload: true });
  }

  async find(query = {}) {
    const docs = await this.store.find(query);
    return docs;
  }

  async findOne(query) {
    return this.store.findOne(query);
  }

  async findById(id) {
    return this.store.findOne({ _id: id });
  }

  async create(data) {
    const doc = { ...data, _id: data._id || undefined };
    return this.store.insert(doc);
  }

  async findByIdAndUpdate(id, updates, options = {}) {
    const doc = await this.store.findOne({ _id: id });
    if (!doc) return null;
    const updated = { ...doc, updatedAt: new Date() };
    for (const key of Object.keys(updates)) {
      const parts = key.split('.');
      if (parts.length > 1) {
        let obj = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = updates[key];
      } else {
        updated[key] = updates[key];
      }
    }
    await this.store.update({ _id: id }, updated);
    return options.new ? updated : doc;
  }

  async findOneAndUpdate(query, updates, options = {}) {
    let doc = await this.store.findOne(query);
    if (!doc) return null;
    const merged = { ...doc, ...updates, updatedAt: new Date() };
    if (updates.$set) Object.assign(merged, updates.$set);
    if (updates.$inc) {
      for (const k of Object.keys(updates.$inc)) {
        merged[k] = (merged[k] || 0) + updates.$inc[k];
      }
    }
    await this.store.update(query, merged);
    return options.new || true ? merged : doc;
  }

  async updateOne(query, update) {
    const doc = await this.store.findOne(query);
    if (!doc) return { modifiedCount: 0 };
    const merged = { ...doc, updatedAt: new Date() };
    if (update.$set) {
      for (const key of Object.keys(update.$set)) {
        const parts = key.split('.');
        if (parts.length === 2) {
          if (parts[0] === 'reminders' && parts[1] === '$') {
            const idx = doc.reminders.findIndex(r =>
              r.time && update.$set[key] === true ? true : r.time?.getTime() === update.$set[key]?.getTime()
            );
            if (idx >= 0) {
              const setKey = Object.keys(update.$set).find(k => k.startsWith('reminders.$.'));
              const field = setKey.split('.').pop();
              merged.reminders[idx] = { ...merged.reminders[idx], [field]: true };
            }
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
    await this.store.update(query, merged);
    return { modifiedCount: 1 };
  }

  async deleteOne(query) {
    await this.store.remove(query, {});
    return { deletedCount: 1 };
  }

  async count(query) {
    return this.store.count(query);
  }

  query() {
    return new QueryBuilder(this.store);
  }
}

class QueryBuilder {
  constructor(store) {
    this.store = store;
    this._query = {};
    this._sort = {};
    this._limit = null;
  }

  find(query) {
    this._query = query;
    return this;
  }

  sort(s) {
    this._sort = s;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  async populate() {
    const docs = await this._exec();
    return docs;
  }

  async _exec() {
    let docs = await this.store.find(this._query);
    const sortKeys = Object.keys(this._sort);
    if (sortKeys.length > 0) {
      docs.sort((a, b) => {
        for (const key of sortKeys) {
          const order = this._sort[key];
          const va = a[key] || 0;
          const vb = b[key] || 0;
          if (va < vb) return -order;
          if (va > vb) return order;
        }
        return 0;
      });
    }
    if (this._limit) docs = docs.slice(0, this._limit);
    return docs;
  }

  then(resolve, reject) {
    return this._exec().then(resolve, reject);
  }
  catch(reject) {
    return this._exec().catch(reject);
  }
}

module.exports = { Model };
