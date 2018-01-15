'use strict'

const { resolve } = require('path')
const Store = require('./lib/store')

exports.dingding = {
  robots: [
    {
      actions: ['机器人需要监听的 action 类型匹配'],
      hook: '钉钉机器人 webhook 地址',
      remark: 'develop'
    }
  ],
  users: [
    { realname: '钉钉昵称', name: '钉钉手机号' }
  ],
  Render: "钉钉消息渲染函数，默认：require('./render/markdown')"
}

exports.coding = {
  cookie: 'Coding 的 Cookie',
  domain: 'Coding 企业版域名',
  project: '需要添加机器人的项目名',
  developers: ['开发者']
}

exports.core = {
  schedule: 'node-schedule 的时间格式',
  managers: ['Coding 机器人管理员']
}

exports.messagesPath = resolve(__dirname, './messages.md')

exports.store = new Store()
