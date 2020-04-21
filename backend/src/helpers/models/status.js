const { logAPP } = require('../../utils/logger');

/* eslint-disable no-underscore-dangle */
class StatusCache {
  constructor(model, data = []) {
    if (!StatusCache.instance) {
      this._array = data;
      this._model = model;
      StatusCache.instance = this;
    }
    return StatusCache.instance;
  }

  async init() {
    logAPP('Initializing CACHE.');
    if (this._array.length === 0) {
      await this.populate();
    }
  }

  async populate() {
    logAPP('Populationg fake cache.');
    const status = await this._model.find().sort('asc');
    this.set(status);
    logAPP(`Àdded ${status.length} itens to cache!`);
  }

  get() {
    return [...this._array];
  }

  tag(tag) {
    return this._array.find((t) => t.tag === tag);
  }

  set(data) {
    this._array = [...data];
  }

  add(status) {
    this._array.push(status);
  }
}

module.exports = StatusCache;
