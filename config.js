'use strict'

exports.dingding = {
  hook: '钉钉机器人 webhook 地址',
  users: [
    { realname: '钉钉昵称', name: '钉钉手机号' }
  ]
}

// TODO: 简化参数
exports.coding = {
  cookie: 'Coding 的 Cookie',
  domain: 'Coding 企业版域名',
  user: '企业版用户名',
  project: '需要添加机器人的项目名',
  projectId: '需要添加机器人的项目ID',
  developers: ['开发者']
}

exports.core = {
  // 钉钉机器人频率限制
  limit: 20,
  interval: 60
}