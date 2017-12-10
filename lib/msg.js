'use strict'

const coding = require('./coding')
const dingding = require('./dingding')
const { core } = require('../config')
const utils = require('./utils')

const limit = core.interval / 60 * core.limit

exports.sendMsgs = async (before) => {
  let msgs = await coding.getMsgs(before)

  if (msgs && msgs.length > 0) {
    let msgsMap = dingding.bindRobots(msgs).reduce((msgsMap, msg) => {
      msg.robots.forEach((robot) => {
        let robotMsgs = utils.get(msgsMap, robot, [])
        robotMsgs.push(msg)
        utils.set(msgsMap, robot, robotMsgs)
      })
      return msgsMap
    }, {})

    let robots = Object.keys(msgsMap)
    for (let robot of robots) {
      let robotMsgs = mergeMsgs(msgsMap[robot].map(robotMsg => robotMsg.message))

      await dingding.send(robot, robotMsgs)
    }
  }
}

function mergeMsgs (msgs) {
  if (msgs.length <= limit) return msgs

  let ret = new Array(limit)

  let step = Math.ceil(msgs.length / limit)
  let length = msgs.length % limit

  for (let i = 0; i < limit; i++) {
    let _step = i < length ? step : (step - 1)
    ret[i] = dingding.mergeMarkdown(msgs.slice(0, _step))
    msgs = msgs.slice(_step)
  }

  return ret
}
