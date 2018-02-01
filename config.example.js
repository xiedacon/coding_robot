'use strict'

const { resolve } = require('path')
const Store = require('./lib/store')

exports.dingding = {
  robots: [
    {
      actions: ['Task.*', 'MergeRequestBean.*'],
      hook: '',
      remark: 'develop'
    }
  ],
  users: [
    { realname: '测试人员', name: '110' }
  ],
  Render: require('./render/markdown')
}

exports.coding = {
  cookie: '',
  domain: '',
  project: '',
  developers: ['开发者1', '开发者2', '开发者3']
}

exports.core = {
  schedule: '0 * * * * *',
  managers: ['管理员']
}

exports.messagesPath = resolve(__dirname, './messages.md')

exports.store = new Store()
