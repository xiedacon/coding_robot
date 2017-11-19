'use strict'

let map = {}

module.exports = class Store {
  async get (key) {
    return Promise.resolve(map[key])
  }

  async set (key, val) {
    map[key] = val
    return this
  }
}

setInterval(() => {
  map = {}
}, 1000 * 60 * 60 * 24)
