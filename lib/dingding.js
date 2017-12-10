'use strict'

const agent = require('superagent').agent()

const { core, dingding } = require('../config')
const utils = require('./utils')
const robotMap = require('./robots')

const enter = '\n \n 　 \n \n'
const limit = core.interval / 60 * core.limit

exports.markdown = (title = Date.now(), lines = []) => {
  let ats = []

  let text = dingding.users.reduce((text, user) => {
    if (text.indexOf(`@${user.realname}`) < 0) return text

    ats.push(user.name)
    return text.replace(`@${user.realname}`, `@${user.name}`)
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

exports.send = async (msgs) => {
  if (!msgs) return
  if (!Array.isArray(msgs)) msgs = [msgs]

  let msgsMap = toMsgsMap(msgs)
  await Promise.all(Object.keys(msgsMap).reduce((msgs, robot) => {
    return msgs.concat(mergeMsgs(msgsMap[robot]).map((msg) => {
      return agent
        .post(robot)
        .set('Content-Type', 'application/json')
        .send(msg)
    }))
  }, []))
}

function toMsgsMap (msgs) {
  return msgs.reduce((msgsMap, msg) => {
    let raw = msg.raw
    let robot = utils.get(robotMap, [raw.type, raw.action], [])

    let robotMsgs = utils.get(msgsMap, [robot], [])
    robotMsgs.push(msg.message)
    utils.set(msgsMap, [robot], robotMsgs)

    return msgsMap
  }, {})
}

function mergeMsgs (msgs) {
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
  let atAll = msgs.reduce((atAll, msg) => atAll || msg.at.isAtAll, false)

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
