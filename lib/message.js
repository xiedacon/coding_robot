'use strict'

const fs = require('fs')

const utils = require('./utils')
const { messagesPath } = require('../config')

let messages = {}

let file = fs.readFileSync(messagesPath, { encoding: 'utf8' })
let fragments = file.split(/---\n([^-]+)\n---\n\n/g)
fragments.shift()

for (let i = 0; i < fragments.length; i += 2) {
  utils.set(messages, fragments[i], fragments[i + 1])
}

module.exports = messages
