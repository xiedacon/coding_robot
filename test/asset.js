'use strict'

const _ = require('lodash')
const rewire = require('rewire')

const config = require('../config')
config.core = {
  schedule: '0 * * * * *',
  managers: ['test']
}

const dingding = rewire('../lib/dingding')

let enter = dingding.__get__('enter')

let title = 'test'
let lines = ['test', 'test', 'test', 'test', 'test']
let user = { realname: 'somebody', name: '110' }
let users = [{ realname: 'somebody', name: '110' }, { realname: 'somebody1', name: '111' }, { realname: 'somebody2', name: '112' }]
let message = {
  'msgtype': 'markdown',
  'markdown': {
    title,
    text: lines.join(enter)
  },
  'at': {
    'atMobiles': [],
    'isAtAll': false
  }
}
let msg = {
  message: _.cloneDeep(message),
  raw: {
    type: 'type',
    action: 'action'
  }
}

exports.utils = {
  test: 'test',
  obj: {
    1: {
      2: {
        3: {
          4: '4'
        }
      }
    }
  }
}

exports.dingding = {
  title,
  lines,
  user,
  users,
  message,
  msg
}
