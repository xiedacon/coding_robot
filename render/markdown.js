'use strict'

const cronParser = require('cron-parser')

const enter = '\n \n 　 \n \n'

module.exports = Render

function Render (config) {
  if (!config) throw new Error('config is required')
  if (!config.core) throw new Error('config.core is required')
  if (!config.dingding) throw new Error('config.dingding is required')

  // 钉钉机器人频率限制
  let robotLimit = 20
  let schedule = config.core.schedule
  if (schedule) {
    schedule = cronParser.parseExpression(config.core.schedule)
    this.limit = (schedule.next().getTime() - schedule.prev().getTime()) / (1000 * 60) * robotLimit
  } else {
    this.limit = robotLimit
  }

  this.users = config.dingding.users || []
}

Render.prototype.render = function (title = Date.now(), lines = []) {
  let ats = []

  let text = this.users.reduce((text, user) => {
    if (text.indexOf(`@${user.realname}`) < 0) return text

    ats.push(user.name)
    return text.replace(new RegExp(`@${user.realname}`, 'g'), `@${user.name}`)
  }, lines.join(enter).replace(/\[@([^\]]*)\]\([^)]*\)/g, '@$1'))

  return {
    'msgtype': 'markdown',
    'markdown': {
      title,
      text
    },
    'at': {
      'atMobiles': Array.from(new Set(ats)),
      'isAtAll': false
    }
  }
}

Render.prototype.merge = function (msgs) {
  let limit = this.limit

  if (msgs.length <= limit) return msgs

  let ret = new Array(limit)

  let step = Math.ceil(msgs.length / limit)
  let length = msgs.length % limit

  for (let i = 0; i < limit; i++) {
    let _step = i < length ? step : (step - 1)
    ret[i] = mergeMarkdown(msgs.slice(0, _step))
    msgs = msgs.slice(_step)
  }

  return ret
}

function mergeMarkdown (msgs) {
  let title = msgs.map(msg => msg.markdown.title).join(' & ')
  let text = msgs.map(msg => msg.markdown.text).join(`${enter} —————————————— ${enter}`)
  let ats = Array.from(new Set(msgs.reduce((ats, msg) => ats.concat(msg.at.atMobiles), [])))
  let atAll = msgs.some(msg => msg.at.isAtAll)

  return {
    'msgtype': 'markdown',
    'markdown': {
      title,
      text
    },
    'at': {
      'atMobiles': ats,
      'isAtAll': atAll
    }
  }
}
