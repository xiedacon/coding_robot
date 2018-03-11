'use strict'

const agent = require('superagent').agent()

const config = require('../config')
const utils = require('./utils')
const robotMap = require('./robots')

const handler = new config.dingding.Render(config)

exports.render = function () {
  return handler.render.apply(handler, Array.from(arguments))
}

exports.send = async (msgs) => {
  /* istanbul ignore if */
  if (!msgs) return
  if (!Array.isArray(msgs)) msgs = [msgs]

  let msgsMap = toMsgsMap(msgs)
  await Promise.all(Object.keys(msgsMap).reduce((msgs, robot) => {
    return msgs.concat(handler.merge(msgsMap[robot]).map((msg) => {
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
    let robot = utils.get(robotMap, [raw.type, raw.action].filter(p => p), [])

    let robotMsgs = utils.get(msgsMap, [robot], [])
    robotMsgs.push(msg.message)
    utils.set(msgsMap, [robot], robotMsgs)

    return msgsMap
  }, {})
}
