'use strict'

const LRU = require('lru-cache')
const MAP = Symbol('map')

module.exports = class Store {
  constructor (args) {
    this[MAP] = new LRU(Object.assign({
      max: 50,
      maxAge: 1000 * 60 * 60
    }, args))
  }

  async get (key) {
    return Promise.resolve(this[MAP].get(key))
  }

  async set (key, val) {
    this[MAP].set(key, val)
    return Promise.resolve(this)
  }
}
