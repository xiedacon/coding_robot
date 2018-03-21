'use strict'

const LRU = require('lru-cache')

module.exports = class Store {
  constructor (args) {
    this.map = new LRU(Object.assign({
      max: 50,
      maxAge: 1000 * 60 * 60
    }, args))
  }

  async get (key) {
    return Promise.resolve(this.map[key])
  }

  async set (key, val) {
    this.map[key] = val
    return Promise.resolve(this)
  }
}
