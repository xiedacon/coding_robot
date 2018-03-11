'use strict'

module.exports = class Store {
  constructor (args) {
    if (!args) args = {}

    let clear = args.clear || 1000 * 60 * 60 * 24

    this.map = Object.create(null)

    setInterval(() => {
      this.map = Object.create(null)
    }, clear)
  }

  async get (key) {
    return Promise.resolve(this.map[key])
  }

  async set (key, val) {
    this.map[key] = val
    return Promise.resolve(this)
  }
}
