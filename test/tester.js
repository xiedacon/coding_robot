'use strict'

const test = require('ava').default
const _ = require('lodash')

const assets = require('./asset')

module.exports = (key) => {
  return function (...args) {
    test.apply(null, args.concat(_.cloneDeep(assets[key])))
  }
}
